import json
import logging
import httpx
from typing import List, Dict, AsyncGenerator, Optional
from app.config import settings

logger = logging.getLogger("app.ai.openrouter")

class OpenRouterProvider:
    """
    Dedicated OpenRouter AI Provider Abstraction Layer
    Supports dynamic model switching, fallback cascade, standard & streaming responses.
    """

    @property
    def api_key(self) -> str:
        return settings.OPENROUTER_API_KEY or ""

    @property
    def base_url(self) -> str:
        return settings.OPENROUTER_BASE_URL.rstrip("/")

    @property
    def default_model(self) -> str:
        return settings.OPENROUTER_MODEL or "openai/gpt-4o-mini"

    def get_headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "AI Persona SaaS Platform"
        }

    async def generate_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096
    ) -> str:
        """
        Execute non-streaming completion with automatic fallback cascade.
        """
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY is not configured.")

        selected_model = model or self.default_model
        models_to_try = [selected_model]
        fallbacks = [
            "openai/gpt-4o-mini",
            "meta-llama/llama-3.3-70b-instruct:free",
            "google/gemini-2.0-flash-exp:free",
            "google/gemini-2.0-flash-001",
            "deepseek/deepseek-chat"
        ]
        for m in fallbacks:
            if m not in models_to_try:
                models_to_try.append(m)

        last_error = None
        url = f"{self.base_url}/chat/completions"

        async with httpx.AsyncClient(timeout=60.0) as client:
            for candidate_model in models_to_try:
                payload = {
                    "model": candidate_model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens
                }
                try:
                    logger.info(f"OpenRouter requesting model: {candidate_model}")
                    resp = await client.post(url, headers=self.get_headers(), json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        if "choices" in data and len(data["choices"]) > 0:
                            content = data["choices"][0]["message"]["content"]
                            if content and content.strip():
                                return content.strip()
                    error_msg = f"Status {resp.status_code}: {resp.text}"
                    logger.warning(f"OpenRouter model '{candidate_model}' failed: {error_msg}")
                    last_error = error_msg
                except Exception as e:
                    last_error = str(e)
                    logger.warning(f"OpenRouter model '{candidate_model}' network error: {e}")
                    continue

        raise RuntimeError(f"OpenRouter completion failed for all models. Error: {last_error}")

    async def stream_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4096
    ) -> AsyncGenerator[str, None]:
        """
        Stream completion chunks using Server-Sent Events (SSE) from OpenRouter.
        """
        if not self.api_key:
            yield json.dumps({"error": "OPENROUTER_API_KEY is not configured."})
            return

        selected_model = model or self.default_model
        url = f"{self.base_url}/chat/completions"
        payload = {
            "model": selected_model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True
        }

        async with httpx.AsyncClient(timeout=90.0) as client:
            try:
                async with client.stream("POST", url, headers=self.get_headers(), json=payload) as response:
                    if response.status_code != 200:
                        error_text = await response.aread()
                        logger.error(f"OpenRouter stream error ({response.status_code}): {error_text.decode('utf-8')}")
                        yield json.dumps({"error": f"OpenRouter status {response.status_code}"})
                        return

                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        if line.startswith("data: "):
                            data_str = line[6:].strip()
                            if data_str == "[DONE]":
                                break
                            try:
                                chunk = json.loads(data_str)
                                delta = chunk.get("choices", [{}])[0].get("delta", {})
                                content_piece = delta.get("content", "")
                                if content_piece:
                                    yield content_piece
                            except Exception:
                                continue
            except Exception as e:
                logger.error(f"Streaming error: {e}")
                yield f"\n[Stream Error: {e}]"

openrouter_provider = OpenRouterProvider()
