import json
import re

from groq import Groq

from ..core.config import settings

_client = None

def client():
    global _client
    if _client is None:
        _client = Groq(api_key=settings.groq_api_key)
    return _client

def _extract_json(text: str):
    text = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.MULTILINE).strip()
    start, end = text.find("{"), text.rfind("}")
    if start != -1 and end != -1:
        text = text[start:end + 1]
    return json.loads(text)

def complete(system: str, user: str, model: str = None, temperature: float = 0.15, max_tokens: int = 1400):
    """Groq completion with JSON-mode + retry fallback. Returns dict (or {'error': ...})."""
    model = model or settings.model_primary
    last_err = None
    for use_json in (True, False):
        for _ in range(2):
            try:
                kwargs = dict(
                    model=model, temperature=temperature, max_tokens=max_tokens,
                    messages=[{"role": "system", "content": system},
                              {"role": "user", "content": user}],
                )
                if use_json:
                    kwargs["response_format"] = {"type": "json_object"}
                rsp = client().chat.completions.create(**kwargs)
                return _extract_json(rsp.choices[0].message.content)
            except Exception as e:
                last_err = e
    return {"error": f"LLM call failed: {last_err}"}
