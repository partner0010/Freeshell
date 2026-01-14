"""
캐싱 서비스 (Redis 기반)
"""

import os
import json
from typing import Optional, Any
from datetime import timedelta

try:
    import redis.asyncio as redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

from ..utils.logger import get_logger

logger = get_logger(__name__)


class CacheService:
    """캐싱 서비스"""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.enabled = False
        
        if REDIS_AVAILABLE:
            redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
            try:
                self.redis_client = redis.from_url(redis_url, decode_responses=True)
                self.enabled = True
                logger.info("Redis cache enabled")
            except Exception as e:
                logger.warning(f"Redis not available, using memory cache: {e}")
                self.enabled = False
        
        # 메모리 기반 폴백
        self.memory_cache: dict = {}
    
    async def get(self, key: str) -> Optional[Any]:
        """캐시에서 값 가져오기"""
        try:
            if self.enabled and self.redis_client:
                value = await self.redis_client.get(key)
                if value:
                    return json.loads(value)
            else:
                # 메모리 캐시
                if key in self.memory_cache:
                    data, expiry = self.memory_cache[key]
                    if expiry is None or expiry > self._now():
                        return data
                    else:
                        del self.memory_cache[key]
        except Exception as e:
            logger.error(f"Cache get error: {e}")
        
        return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """캐시에 값 저장"""
        try:
            if self.enabled and self.redis_client:
                json_value = json.dumps(value)
                if ttl:
                    await self.redis_client.setex(key, ttl, json_value)
                else:
                    await self.redis_client.set(key, json_value)
            else:
                # 메모리 캐시
                expiry = None if ttl is None else self._now() + ttl
                self.memory_cache[key] = (value, expiry)
        except Exception as e:
            logger.error(f"Cache set error: {e}")
    
    async def delete(self, key: str):
        """캐시에서 값 삭제"""
        try:
            if self.enabled and self.redis_client:
                await self.redis_client.delete(key)
            else:
                self.memory_cache.pop(key, None)
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
    
    async def clear_pattern(self, pattern: str):
        """패턴에 맞는 키 삭제"""
        try:
            if self.enabled and self.redis_client:
                keys = await self.redis_client.keys(pattern)
                if keys:
                    await self.redis_client.delete(*keys)
            else:
                # 메모리 캐시에서 패턴 매칭
                keys_to_delete = [k for k in self.memory_cache.keys() if pattern.replace('*', '') in k]
                for key in keys_to_delete:
                    del self.memory_cache[key]
        except Exception as e:
            logger.error(f"Cache clear pattern error: {e}")
    
    def _now(self) -> int:
        """현재 시간 (초)"""
        import time
        return int(time.time())
    
    async def close(self):
        """연결 종료"""
        if self.redis_client:
            await self.redis_client.close()


# 전역 인스턴스
cache_service = CacheService()
