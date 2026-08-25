import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Sparkles, Plus, Pin, Trash2, RotateCcw, 
  Copy, Check, Paperclip, Mic, MicOff, Search, ChevronDown, 
  MessageSquare, Edit3, X
} from 'lucide-react';
import { clsx } from 'clsx';
import { MarkdownMessage } from '../components/MarkdownMessage';
import { api, streamChatResponse } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  attachment_url?: string;
  timestamp: Date;
}

interface ConversationItem {
  id: string;
  persona_id: string;
  title: string;
  is_pinned: boolean;
  last_message?: string;
}

const AVAILABLE_MODELS = [
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (Fast & Smart)' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Deep Reasoning)' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat (Code & Logic)' },
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash (Fast)' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free Open-Source)' },
];

export const ChatPage = () => {
  const personaId = localStorage.getItem('selectedPersona') || 'krishna';
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('openrouter_model') || 'openai/gpt-4o-mini');
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [searchConvo, setSearchConvo] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const getInitialGreeting = () => {
    switch (personaId) {
      case 'krishna': return "Welcome, dear soul. I am here with you. What weighs on your heart or mind today?";
      case 'chhava': return "Rise, warrior. Greatness requires action, not excuses. What battle are we conquering today?";
      case 'chanakya': return "Greetings. In this world, power follows vision and strategy. What problem shall we dissect and solve?";
      default: return "Welcome. I am your AI companion. How may I assist your journey today?";
    }
  };

  const personaConfig: Record<string, { color: string; bg: string; name: string; emoji: string }> = {
    krishna: { color: 'text-blue-400', bg: 'from-blue-500 to-emerald-400', name: 'Krishna', emoji: '🦚' },
    chhava: { color: 'text-amber-500', bg: 'from-amber-500 to-red-500', name: 'Chhava', emoji: '🦁' },
    chanakya: { color: 'text-purple-400', bg: 'from-purple-500 to-indigo-500', name: 'Chanakya', emoji: '📜' },
  };

  const activePersona = personaConfig[personaId] || personaConfig.krishna;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load conversations
  const fetchConversations = async () => {
    try {
      const res = await api.get(`/chat/conversations?persona_id=${personaId}`);
      setConversations(res.data || []);
      if (res.data && res.data.length > 0 && !activeConvoId) {
        loadConversation(res.data[0].id);
      } else if (!activeConvoId) {
        setMessages([
          { id: 'init', role: 'ai', content: getInitialGreeting(), timestamp: new Date() }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadConversation = async (convoId: string) => {
    try {
      setActiveConvoId(convoId);
      const res = await api.get(`/chat/conversations/${convoId}/messages`);
      if (res.data && res.data.length > 0) {
        setMessages(res.data.map((m: any) => ({
          id: m.id,
          role: m.sender,
          content: m.content,
          attachment_url: m.attachment_url,
          timestamp: new Date(m.timestamp)
        })));
      } else {
        setMessages([
          { id: 'init', role: 'ai', content: getInitialGreeting(), timestamp: new Date() }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [personaId]);

  // Speech Recognition STT
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      setInput(transcript);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const handleCreateNewChat = async () => {
    try {
      const res = await api.post('/chat/conversations', {
        persona_id: personaId,
        title: `Chat with ${activePersona.name}`
      });
      setConversations(prev => [res.data, ...prev]);
      setActiveConvoId(res.data.id);
      setMessages([
        { id: 'init', role: 'ai', content: getInitialGreeting(), timestamp: new Date() }
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (convoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.put(`/chat/conversations/${convoId}/pin`);
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConversation = async (convoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation?")) return;
    try {
      await api.delete(`/chat/conversations/${convoId}`);
      setConversations(prev => prev.filter(c => c.id !== convoId));
      if (activeConvoId === convoId) {
        setActiveConvoId(null);
        setMessages([
          { id: 'init', role: 'ai', content: getInitialGreeting(), timestamp: new Date() }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (overrideMsg?: string) => {
    const textToSend = overrideMsg || input;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      attachment_url: attachmentName || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!overrideMsg) setInput('');
    setAttachmentName(null);
    setIsTyping(true);

    const aiMsgId = (Date.now() + 1).toString();
    const initialAiMsg: Message = {
      id: aiMsgId,
      role: 'ai',
      content: '',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, initialAiMsg]);

    let accumulatedContent = '';

    await streamChatResponse(
      {
        message: textToSend,
        persona_id: personaId,
        conversation_id: activeConvoId,
        model: selectedModel,
        attachment_url: userMsg.attachment_url,
      },
      (chunk) => {
        accumulatedContent += chunk;
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: accumulatedContent } : m));
      },
      (newConvoId) => {
        if (!activeConvoId) {
          setActiveConvoId(newConvoId);
          fetchConversations();
        }
      },
      () => {
        setIsTyping(false);
      },
      (err) => {
        console.error('Streaming error:', err);
        setMessages(prev => prev.map(m => m.id === aiMsgId ? {
          ...m,
          content: m.content || "I am currently in fallback mode. Please check your OPENROUTER_API_KEY in backend .env to enable streaming."
        } : m));
        setIsTyping(false);
      }
    );
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      handleSend(lastUserMsg.content);
    }
  };

  const handleEditSave = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: editInput } : m));
    setEditingMsgId(null);
    handleSend(editInput);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchConvo.toLowerCase())
  );

  return (
    <div className="flex h-full w-full gap-4 relative overflow-hidden">
      
      {/* Conversations Drawer Sidebar */}
      <div className={clsx(
        "glass-card rounded-3xl flex flex-col border border-border transition-all duration-300 overflow-hidden flex-shrink-0",
        showSidebar ? "w-72" : "w-0 p-0 border-0"
      )}>
        {showSidebar && (
          <div className="flex flex-col h-full p-4">
            
            {/* New Chat Button */}
            <button
              onClick={handleCreateNewChat}
              className="primary-button w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mb-4 shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> New Conversation
            </button>

            {/* Search conversations */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchConvo}
                onChange={(e) => setSearchConvo(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-text-primary focus:border-primary transition-colors"
              />
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
              {filteredConversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => loadConversation(c.id)}
                  className={clsx(
                    "p-2.5 rounded-xl text-xs border cursor-pointer transition-all flex items-center justify-between group",
                    activeConvoId === c.id
                      ? "bg-primary/15 border-primary text-primary font-semibold"
                      : "bg-surface/40 border-border/50 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{c.title}</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleTogglePin(c.id, e)}
                      title={c.is_pinned ? "Unpin" : "Pin"}
                      className={clsx("p-1 rounded hover:bg-surface", c.is_pinned && "opacity-100 text-amber-400")}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteConversation(c.id, e)}
                      title="Delete"
                      className="p-1 rounded hover:bg-red-500/20 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full min-w-0 glass-card rounded-3xl border border-border p-4 md:p-6 relative">
        
        {/* Chat Header */}
        <div className="flex items-center justify-between pb-4 mb-2 border-b border-border/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-xl bg-surface border border-border text-text-secondary hover:text-text-primary transition-colors text-xs"
              title="Toggle sidebar"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <span>{activePersona.emoji}</span>
                <span>{activePersona.name}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface border border-border text-primary font-normal">
                  Live AI
                </span>
              </h1>
            </div>
          </div>

          {/* Model Switcher */}
          <div className="flex items-center gap-2">
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                localStorage.setItem('openrouter_model', e.target.value);
              }}
              className="bg-surface border border-border rounded-xl px-3 py-1.5 text-xs text-text-primary focus:border-primary font-medium cursor-pointer"
            >
              {AVAILABLE_MODELS.map(m => (
                <option key={m.id} value={m.id} className="bg-background text-text-primary">
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-6 py-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={clsx(
                "flex gap-3 max-w-[92%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              {/* Avatar */}
              <div className={clsx(
                "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 shadow-sm",
                msg.role === 'user'
                  ? "bg-surface border border-border text-text-secondary"
                  : `bg-gradient-to-br ${activePersona.bg} p-[1px]`
              )}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-text-primary" />
                  </div>
                )}
              </div>

              {/* Message Bubble + Action toolbar */}
              <div className="flex flex-col gap-1 min-w-0">
                <div className={clsx(
                  "px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm min-w-0 overflow-hidden group relative",
                  msg.role === 'user'
                    ? "bg-primary text-white rounded-tr-sm shadow-[0_4px_15px_rgba(96,165,250,0.2)] whitespace-pre-wrap"
                    : "glass-card rounded-tl-sm text-text-primary w-full border border-border/70"
                )}>
                  {msg.attachment_url && (
                    <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/20 text-xs text-white/90 border border-white/10">
                      <Paperclip className="w-3 h-3" />
                      <span>Attachment: {msg.attachment_url}</span>
                    </div>
                  )}

                  {editingMsgId === msg.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editInput}
                        onChange={(e) => setEditInput(e.target.value)}
                        className="w-full bg-surface text-text-primary text-sm p-2 rounded-lg border border-border focus:outline-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingMsgId(null)} className="px-2 py-1 text-xs text-text-secondary">Cancel</button>
                        <button onClick={() => handleEditSave(msg.id)} className="px-3 py-1 text-xs bg-primary text-white rounded-md font-bold">Save & Send</button>
                      </div>
                    </div>
                  ) : msg.role === 'user' ? (
                    <span>{msg.content}</span>
                  ) : (
                    <MarkdownMessage content={msg.content} />
                  )}
                </div>

                {/* Message Actions */}
                <div className={clsx(
                  "flex items-center gap-2 text-xs text-text-secondary px-2 opacity-60 hover:opacity-100 transition-opacity",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}>
                  <button
                    onClick={() => handleCopyMessage(msg.content, msg.id)}
                    className="hover:text-text-primary transition-colors flex items-center gap-1"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                  </button>

                  {msg.role === 'user' && (
                    <button
                      onClick={() => {
                        setEditingMsgId(msg.id);
                        setEditInput(msg.content);
                      }}
                      className="hover:text-text-primary transition-colors flex items-center gap-1"
                      title="Edit message"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  )}

                  {msg.role === 'ai' && !isTyping && (
                    <button
                      onClick={handleRegenerate}
                      className="hover:text-text-primary transition-colors flex items-center gap-1"
                      title="Regenerate response"
                    >
                      <RotateCcw className="w-3 h-3" /> Regenerate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-3 max-w-[92%]">
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 bg-gradient-to-br ${activePersona.bg} p-[1px]`}>
                <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-text-primary" />
                </div>
              </div>
              <div className="px-5 py-4 rounded-2xl glass-card rounded-tl-sm flex items-center gap-1.5 border border-border">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-2">
          {attachmentName && (
            <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-surface border border-border text-xs text-text-primary">
              <Paperclip className="w-3.5 h-3.5 text-primary" />
              <span>{attachmentName}</span>
              <button onClick={() => setAttachmentName(null)} className="text-text-secondary hover:text-text-primary">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="relative flex items-end bg-surface-hover border border-border rounded-2xl p-2 transition-all focus-within:border-primary/50 focus-within:bg-surface-active focus-within:shadow-[0_0_20px_rgba(96,165,250,0.1)]">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 mb-1 text-text-secondary hover:text-text-primary transition-colors rounded-xl hover:bg-surface"
              title="Attach document/image"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={clsx(
                "p-2.5 mb-1 rounded-xl transition-colors",
                isRecording ? "text-red-400 bg-red-500/10 animate-pulse" : "text-text-secondary hover:text-text-primary hover:bg-surface"
              )}
              title={isRecording ? "Stop listening" : "Voice dictation"}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Ask ${activePersona.name} anything... (Enter to send, Shift+Enter for newline)`}
              className="w-full max-h-36 min-h-[44px] bg-transparent resize-none py-2.5 px-3 text-text-primary placeholder:text-text-secondary/50 text-[15px] focus:outline-none"
              rows={1}
            />

            <button
              onClick={() => handleSend()}
              disabled={(!input.trim() && !attachmentName) || isTyping}
              className="p-2.5 mb-1 mr-1 rounded-xl bg-primary text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-md shadow-primary/30"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-between items-center px-2 mt-2 text-[11px] text-text-secondary/60">
            <span>Powered by OpenRouter API • {selectedModel}</span>
            <span>Esc to clear</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ChatPage;
