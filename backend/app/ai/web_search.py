import httpx
import re
import logging
from html import unescape
from typing import Optional, List

logger = logging.getLogger("app.ai.web_search")

class WebSearchService:
    REALTIME_KEYWORDS = [
        "today", "latest", "news", "current", "recent", "present",
        "prime minister", "president", "weather", "score", "stock price",
        "2025", "2026", "who is the current", "who is the prime minister",
        "live", "now", "happening", "releasing"
    ]

    @classmethod
    def requires_realtime_info(cls, query: str) -> bool:
        lower = query.lower()
        return any(kw in lower for kw in cls.REALTIME_KEYWORDS)

    @classmethod
    async def perform_search(cls, query: str) -> Optional[str]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        url = "https://html.duckduckgo.com/html/"
        data = {"q": query}
        
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                resp = await client.post(url, data=data, headers=headers)
                if resp.status_code == 200:
                    html_content = resp.text
                    raw_snippets = re.findall(
                        r'<a\s+class="result__snippet[^"]*"[^>]*>(.*?)</a>',
                        html_content,
                        re.DOTALL | re.IGNORECASE
                    )
                    clean_snippets = []
                    for snippet in raw_snippets:
                        text = unescape(re.sub(r'<[^>]+>', '', snippet)).strip()
                        if text and text not in clean_snippets:
                            clean_snippets.append(text)
                        if len(clean_snippets) >= 4:
                            break
                    
                    if clean_snippets:
                        formatted = "\n".join([f"- {s}" for s in clean_snippets])
                        logger.info(f"Web search found {len(clean_snippets)} snippets for '{query}'")
                        return f"[REAL-TIME WEB SEARCH RESULTS FOR: '{query}']\n{formatted}"
        except Exception as e:
            logger.warning(f"Web search for '{query}' encountered error: {e}")

        return None

web_search_service = WebSearchService()
