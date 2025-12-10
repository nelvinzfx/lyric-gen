import json
import hashlib
from typing import Optional, Any
from cachetools import TTLCache

# Separate caches with different TTLs
_search_cache = TTLCache(maxsize=500, ttl=86400)      # 24 hours
_lyrics_cache = TTLCache(maxsize=500, ttl=86400)      # 24 hours  
_stream_cache = TTLCache(maxsize=100, ttl=7200)       # 2 hours
_recommendations_cache = TTLCache(maxsize=10, ttl=3600)  # 1 hour

_caches = {
    "search": _search_cache,
    "lyrics": _lyrics_cache,
    "stream": _stream_cache,
    "recommendations": _recommendations_cache,
}

def _key(prefix: str, data: str) -> str:
    return f"{prefix}:{hashlib.md5(data.encode()).hexdigest()}"

def get(prefix: str, identifier: str) -> Optional[Any]:
    cache = _caches.get(prefix, _search_cache)
    key = _key(prefix, identifier)
    val = cache.get(key)
    if val:
        return json.loads(val)
    return None

def set(prefix: str, identifier: str, data: Any, ttl: int = None):
    cache = _caches.get(prefix, _search_cache)
    key = _key(prefix, identifier)
    cache[key] = json.dumps(data)
