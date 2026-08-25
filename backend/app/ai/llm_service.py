import httpx
import logging
from typing import List, Dict, Optional
from app.config import settings

logger = logging.getLogger("app.ai.llm_service")

GENERAL_AI_SYSTEM_PROMPT = """You are AI Persona, a world-class, intelligent conversational AI assistant engineered for excellence across reasoning, coding, science, mathematics, literature, analysis, and creative thought—operating at the quality level of ChatGPT Plus.

Core Directives:
1. Accuracy & Depth: Understand the user's inquiry deeply. Provide accurate, thorough, practical, and highly relevant solutions.
2. Structure & Formatting: Always use clean Markdown formatting:
   - Use bold headers (`### Header`) and concise bullet points for readability.
   - Use code blocks with appropriate language tags (e.g. ```python, ```javascript, ```sql, ```bash) for all code snippets.
   - For comparisons or data, use Markdown tables.
3. Code & Engineering: Produce clean, modern, production-grade, bug-free code with clear comments and explanations. Do not omit critical logic.
4. Step-by-Step Reasoning: For math, logic, science, or architecture problems, guide the user through clear, logical steps.
5. Persona Nuance: Naturally blend the requested persona's voice and temperament without sacrificing factual accuracy or completeness.
6. Context Retention: Maintain full awareness of conversation history, user preferences, and previous context.
"""

from app.ai.openrouter_provider import openrouter_provider
from typing import AsyncGenerator

class LLMService:
    @property
    def openrouter_key(self) -> str:
        return settings.OPENROUTER_API_KEY or ""

    @property
    def openrouter_model(self) -> str:
        return settings.OPENROUTER_MODEL or "openai/gpt-4o-mini"

    @property
    def gemini_key(self) -> str:
        return settings.GEMINI_API_KEY or ""

    @property
    def openai_key(self) -> str:
        return settings.OPENAI_API_KEY or ""

    def build_chat_messages(
        self,
        persona_system_prompt: str,
        user_context: str,
        web_search_context: Optional[str],
        conversation_history: List[Dict[str, str]],
        current_message: str
    ) -> List[Dict[str, str]]:
        """
        Builds native multi-turn chat messages structure for OpenRouter / OpenAI.
        """
        system_parts = [GENERAL_AI_SYSTEM_PROMPT]
        
        if persona_system_prompt and persona_system_prompt.strip():
            system_parts.append(f"[PERSONA & COMMUNICATION STYLE]\n{persona_system_prompt}")

        if user_context and user_context.strip():
            system_parts.append(f"[USER PREFERENCES & MEMORY CONTEXT]\n{user_context}")

        if web_search_context and web_search_context.strip():
            system_parts.append(f"[REAL-TIME WEB GROUNDING DATA]\n{web_search_context}")

        messages: List[Dict[str, str]] = [
            {"role": "system", "content": "\n\n".join(system_parts)}
        ]

        # Add recent conversation history
        for msg in (conversation_history or [])[-10:]:
            role = "user" if msg.get("role") in ["user", "human"] or msg.get("sender") == "user" else "assistant"
            content = msg.get("content", "").strip()
            if content:
                messages.append({"role": role, "content": content})

        # Add current user message
        messages.append({"role": "user", "content": current_message})
        return messages

    def build_prompt_payload(
        self,
        persona_system_prompt: str,
        user_context: str,
        web_search_context: Optional[str],
        conversation_history: List[Dict[str, str]],
        current_message: str
    ) -> str:
        """
        Assembles single text prompt for raw completion / Gemini APIs.
        """
        sections = [
            f"[SYSTEM ROLE INSTRUCTIONS]\n{GENERAL_AI_SYSTEM_PROMPT}",
            f"[COMMUNICATION STYLE & PERSONA INSTRUCTIONS]\n{persona_system_prompt}"
        ]

        if user_context and user_context.strip():
            sections.append(f"[USER MEMORIES & PERSONAL CONTEXT]\n{user_context}")

        if web_search_context and web_search_context.strip():
            sections.append(f"[REAL-TIME GROUNDING INFORMATION]\n{web_search_context}")

        if conversation_history:
            history_lines = []
            for msg in conversation_history[-8:]:
                role = "User" if msg.get("sender") == "user" or msg.get("role") == "user" else "AI"
                history_lines.append(f"{role}: {msg.get('content', '')}")
            sections.append("[RECENT CONVERSATION HISTORY]\n" + "\n".join(history_lines))

        sections.append(f"[CURRENT USER QUESTION]\nUser: {current_message}\nAI:")
        return "\n\n".join(sections)

    async def generate_stream(
        self,
        system_prompt: str,
        context: str,
        current_message: str,
        web_search_context: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        model: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Stream response tokens from OpenRouter.
        """
        chat_messages = self.build_chat_messages(
            persona_system_prompt=system_prompt,
            user_context=context,
            web_search_context=web_search_context,
            conversation_history=conversation_history or [],
            current_message=current_message
        )

        if self.openrouter_key:
            async for chunk in openrouter_provider.stream_completion(chat_messages, model=model):
                yield chunk
        else:
            # Fallback static stream
            full_response = self._smart_fallback(current_message, system_prompt)
            for word in full_response.split(" "):
                yield word + " "

    async def generate_response(
        self,
        system_prompt: str,
        context: str,
        current_message: str,
        web_search_context: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        model: Optional[str] = None
    ) -> str:
        """
        Generates a state-of-the-art response from OpenRouter, Gemini, or OpenAI based on prompt payload.
        """
        chat_messages = self.build_chat_messages(
            persona_system_prompt=system_prompt,
            user_context=context,
            web_search_context=web_search_context,
            conversation_history=conversation_history or [],
            current_message=current_message
        )

        single_prompt = self.build_prompt_payload(
            persona_system_prompt=system_prompt,
            user_context=context,
            web_search_context=web_search_context,
            conversation_history=conversation_history or [],
            current_message=current_message
        )

        # 1. Try OpenRouter AI Provider first if configured
        if self.openrouter_key:
            try:
                logger.info(f"Generating response with OpenRouter ({model or self.openrouter_model})...")
                return await openrouter_provider.generate_completion(chat_messages, model=model)
            except Exception as e:
                logger.warning(f"OpenRouter provider failed: {e}. Trying fallback LLM provider...")

        # 2. Try Gemini API
        if self.gemini_key:
            try:
                logger.info("Attempting response generation with Gemini API...")
                return await self._call_gemini(single_prompt)
            except Exception as e:
                logger.warning(f"Gemini API call failed: {e}. Trying fallback LLM provider...")

        # 3. Try OpenAI API as fallback provider
        if self.openai_key:
            try:
                logger.info("Attempting response generation with OpenAI API...")
                return await self._call_openai(chat_messages)
            except Exception as e:
                logger.warning(f"OpenAI API call failed: {e}.")

        # 4. Fallback if no keys or rate limits
        logger.info("Returning standard fallback explanation for current_message.")
        return self._smart_fallback(current_message, system_prompt)

    async def _call_gemini(self, prompt: str) -> str:
        models_to_try = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-1.5-flash"]
        last_error = None

        async with httpx.AsyncClient(timeout=45.0) as client:
            for model in models_to_try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.gemini_key}"
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 4096
                    }
                }
                try:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            parts = candidates[0]["content"].get("parts", [])
                            for part in reversed(parts):
                                if "text" in part and part["text"].strip():
                                    return part["text"].strip()
                    resp.raise_for_status()
                except Exception as e:
                    last_error = e
                    logger.warning(f"Gemini model '{model}' call failed: {e}")
                    continue

        raise RuntimeError(f"All Gemini models failed. Last error: {last_error}")

    async def _call_openai(self, messages: List[Dict[str, str]]) -> str:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openai_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 4096
        }
        async with httpx.AsyncClient(timeout=45.0) as client:
            try:
                resp = await client.post(url, headers=headers, json=payload)
                resp.raise_for_status()
                data = resp.json()
                return data["choices"][0]["message"]["content"]
            except Exception as e:
                logger.error(f"OpenAI API Error: {e}")
                raise RuntimeError(f"OpenAI API Error: {e}")

    def _smart_fallback(self, current_message: str, system_prompt: str) -> str:
        """
        Clean, prompt-focused fallback when API keys are unconfigured or rate limits are reached.
        Never replaces response with static quotes. Evaluates basic math directly.
        """
        msg_lower = current_message.lower().strip()

        # Handle simple math calculations offline
        if "+" in msg_lower or "-" in msg_lower or "*" in msg_lower or "/" in msg_lower:
            import re
            expr_match = re.search(r'(\d+\s*[\+\-\*/]\s*\d+)', current_message)
            if expr_match:
                try:
                    result = eval(expr_match.group(1))
                    return f"Calculation result: {expr_match.group(1)} = {result}"
                except Exception:
                    pass

        return (
            f"Regarding your query on '{current_message}': "
            "I am currently operating in offline/local fallback mode because the configured LLM API key reached its daily rate limit or is unconfigured. "
            "Please add a valid OPENROUTER_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY in the backend `.env` file to resume live LLM responses."
        )

llm_service = LLMService()
