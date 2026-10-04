import time
from typing import Any, Optional, Dict

class SimpleMemoryCache:
    """
    Lightweight thread-safe in-memory cache with TTL support for NASA POWER API requests.
    Prevents repetitive external requests and respects NASA rate limits.
    """
    def __init__(self, default_ttl_seconds: int = 3600):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self.default_ttl = default_ttl_seconds

    def _generate_key(self, latitude: float, longitude: float, start: str, end: str) -> str:
        return f"{latitude:.4f}_{longitude:.4f}_{start}_{end}"

    def get(self, latitude: float, longitude: float, start: str, end: str) -> Optional[Any]:
        key = self._generate_key(latitude, longitude, start, end)
        entry = self._cache.get(key)
        if not entry:
            return None
        if time.time() > entry["expires_at"]:
            del self._cache[key]
            return None
        return entry["value"]

    def set(self, latitude: float, longitude: float, start: str, end: str, value: Any, ttl: Optional[int] = None) -> None:
        key = self._generate_key(latitude, longitude, start, end)
        expires_at = time.time() + (ttl if ttl is not None else self.default_ttl)
        self._cache[key] = {
            "value": value,
            "expires_at": expires_at
        }

    def clear(self) -> None:
        self._cache.clear()

    def stats(self) -> Dict[str, int]:
        current_time = time.time()
        active_entries = sum(1 for entry in self._cache.values() if entry["expires_at"] > current_time)
        return {
            "total_cached_items": len(self._cache),
            "active_items": active_entries
        }

cache_manager = SimpleMemoryCache(default_ttl_seconds=3600)
