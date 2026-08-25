import json
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional, List, Dict
from app.database import get_db
from app.ai.llm_service import llm_service
from app.ai.memory_engine import MemoryEngine
from app.ai.web_search import web_search_service
from app.models import User, Persona, Conversation, Message, Memory
from pydantic import BaseModel

logger = logging.getLogger("app.api.chat")
logger.setLevel(logging.INFO)

if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)

router = APIRouter(prefix="/api/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    persona_id: str = "krishna"
    conversation_id: Optional[str] = None
    model: Optional[str] = None
    attachment_url: Optional[str] = None
    attachment_type: Optional[str] = None

class NewConversationRequest(BaseModel):
    persona_id: str = "krishna"
    title: Optional[str] = None

def get_or_create_user(db: Session) -> User:
    user = db.query(User).first()
    if not user:
        user = User(
            email="explorer@origen.ai",
            hashed_password="mock_password_hash",
            full_name="Explorer",
            preferred_name="Explorer",
            active_persona_id="krishna",
            onboarding_completed=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.get("/personas")
def get_personas(db: Session = Depends(get_db)):
    """Returns active Personas (Krishna, Chhava, Chanakya, etc.)"""
    personas = db.query(Persona).all()
    return personas

@router.get("/conversations")
def get_conversations(persona_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Fetch conversation list with message count and pinned status"""
    user = get_or_create_user(db)
    query = db.query(Conversation).filter(Conversation.user_id == user.id)
    if persona_id:
        query = query.filter(Conversation.persona_id == persona_id)
    conversations = query.order_by(Conversation.is_pinned.desc(), Conversation.updated_at.desc()).all()
    
    result = []
    for c in conversations:
        last_msg = db.query(Message).filter(Message.conversation_id == c.id).order_by(Message.timestamp.desc()).first()
        result.append({
            "id": c.id,
            "persona_id": c.persona_id,
            "title": c.title,
            "is_pinned": c.is_pinned,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "last_message": last_msg.content[:80] if last_msg else None
        })
    return result

@router.post("/conversations")
def create_conversation(req: NewConversationRequest, db: Session = Depends(get_db)):
    user = get_or_create_user(db)
    persona = db.query(Persona).filter(Persona.id == req.persona_id).first()
    title = req.title or f"Chat with {persona.name if persona else 'Companion'}"
    
    convo = Conversation(
        user_id=user.id,
        persona_id=req.persona_id,
        title=title
    )
    db.add(convo)
    db.commit()
    db.refresh(convo)
    return convo

@router.put("/conversations/{convo_id}/pin")
def toggle_pin_conversation(convo_id: str, db: Session = Depends(get_db)):
    user = get_or_create_user(db)
    convo = db.query(Conversation).filter(Conversation.id == convo_id, Conversation.user_id == user.id).first()
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    convo.is_pinned = not convo.is_pinned
    db.commit()
    return {"id": convo.id, "is_pinned": convo.is_pinned}

@router.delete("/conversations/{convo_id}")
def delete_conversation(convo_id: str, db: Session = Depends(get_db)):
    user = get_or_create_user(db)
    convo = db.query(Conversation).filter(Conversation.id == convo_id, Conversation.user_id == user.id).first()
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(convo)
    db.commit()
    return {"message": "Conversation deleted"}

@router.get("/conversations/{convo_id}/messages")
def get_conversation_messages(convo_id: str, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(Message.conversation_id == convo_id).order_by(Message.timestamp.asc()).all()
    return messages

@router.post("")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    logger.info("=== Chat Request Received ===")
    user = get_or_create_user(db)
    
    persona = db.query(Persona).filter(Persona.id == request.persona_id).first()
    if not persona:
        persona = db.query(Persona).first()

    # Get or create active conversation
    conversation = None
    if request.conversation_id:
        conversation = db.query(Conversation).filter(
            Conversation.id == request.conversation_id,
            Conversation.user_id == user.id
        ).first()

    if not conversation:
        conversation = Conversation(
            user_id=user.id,
            persona_id=request.persona_id,
            title=request.message[:30] + ("..." if len(request.message) > 30 else "")
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # History
    history_records = db.query(Message).filter(
        Message.conversation_id == conversation.id
    ).order_by(Message.timestamp.asc()).all()

    conversation_history: List[Dict[str, str]] = [
        {"role": msg.sender, "content": msg.content}
        for msg in history_records[-10:]
    ]

    # Save user message
    user_msg_db = Message(
        conversation_id=conversation.id,
        sender="user",
        content=request.message,
        attachment_url=request.attachment_url,
        attachment_type=request.attachment_type
    )
    db.add(user_msg_db)

    # Memory extraction
    new_memories = MemoryEngine.extract_memories_from_text(request.message)
    for mem in new_memories:
        db.add(Memory(
            user_id=user.id,
            category=mem.get("category", "Personal"),
            content=mem.get("content", request.message),
            importance=mem.get("importance", "medium")
        ))
    db.commit()

    user_context = MemoryEngine.build_user_context(db, user, request.persona_id)

    # Real-time search if needed
    web_search_context = None
    if web_search_service.requires_realtime_info(request.message):
        web_search_context = await web_search_service.perform_search(request.message)

    # Generate response
    try:
        response_text = await llm_service.generate_response(
            system_prompt=persona.system_prompt,
            context=user_context,
            current_message=request.message,
            web_search_context=web_search_context,
            conversation_history=conversation_history,
            model=request.model
        )
    except Exception as e:
        logger.error(f"Error in LLM generation: {e}")
        response_text = llm_service._smart_fallback(request.message, persona.system_prompt)

    # Save AI message
    ai_msg_db = Message(
        conversation_id=conversation.id,
        sender="ai",
        content=response_text
    )
    db.add(ai_msg_db)
    db.commit()

    return {
        "response": response_text,
        "conversation_id": conversation.id
    }

@router.post("/stream")
async def chat_stream(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Streaming response endpoint using Server-Sent Events (SSE)
    """
    user = get_or_create_user(db)
    persona = db.query(Persona).filter(Persona.id == request.persona_id).first()
    if not persona:
        persona = db.query(Persona).first()

    conversation = None
    if request.conversation_id:
        conversation = db.query(Conversation).filter(
            Conversation.id == request.conversation_id,
            Conversation.user_id == user.id
        ).first()

    if not conversation:
        conversation = Conversation(
            user_id=user.id,
            persona_id=request.persona_id,
            title=request.message[:30] + ("..." if len(request.message) > 30 else "")
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # Save user message
    user_msg_db = Message(
        conversation_id=conversation.id,
        sender="user",
        content=request.message,
        attachment_url=request.attachment_url,
        attachment_type=request.attachment_type
    )
    db.add(user_msg_db)
    db.commit()

    history_records = db.query(Message).filter(
        Message.conversation_id == conversation.id
    ).order_by(Message.timestamp.asc()).all()

    conversation_history = [
        {"role": msg.sender, "content": msg.content}
        for msg in history_records[-10:]
    ]

    user_context = MemoryEngine.build_user_context(db, user, request.persona_id)

    web_search_context = None
    if web_search_service.requires_realtime_info(request.message):
        web_search_context = await web_search_service.perform_search(request.message)

    async def event_generator():
        accumulated = []
        # First send conversation_id event
        yield f"data: {json.dumps({'conversation_id': conversation.id})}\n\n"
        
        async for chunk in llm_service.generate_stream(
            system_prompt=persona.system_prompt,
            context=user_context,
            current_message=request.message,
            web_search_context=web_search_context,
            conversation_history=conversation_history,
            model=request.model
        ):
            accumulated.append(chunk)
            yield f"data: {json.dumps({'content': chunk})}\n\n"

        full_text = "".join(accumulated).strip()
        if full_text:
            ai_msg_db = Message(
                conversation_id=conversation.id,
                sender="ai",
                content=full_text
            )
            db.add(ai_msg_db)
            db.commit()

        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
