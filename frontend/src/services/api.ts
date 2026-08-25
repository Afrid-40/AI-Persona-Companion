import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper for SSE Streaming from /api/chat/stream
export async function streamChatResponse(
  payload: {
    message: string;
    persona_id: string;
    conversation_id?: string | null;
    model?: string;
    attachment_url?: string | null;
    attachment_type?: string | null;
  },
  onChunk: (chunk: string) => void,
  onConversationId?: (id: string) => void,
  onComplete?: () => void,
  onError?: (err: any) => void
) {
  try {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No readable stream available');

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const dataStr = trimmed.slice(6);
        if (dataStr === '[DONE]') {
          if (onComplete) onComplete();
          return;
        }

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.conversation_id && onConversationId) {
            onConversationId(parsed.conversation_id);
          }
          if (parsed.content) {
            onChunk(parsed.content);
          }
        } catch {
          // Raw string fallback
          onChunk(dataStr);
        }
      }
    }

    if (onComplete) onComplete();
  } catch (error) {
    if (onError) onError(error);
  }
}
