"""
Rate Limiting 서비스 (Redis 기반)
"""

import os
from typing import Optional
from datetime import timedelta

from .cache_service import cache_service
from ..utils.logger import get_logger

logger = get_logger(__name__)


class RateLimitService:
    """Rate Limiting 서비스"""
    
    def __init__(self):
        self.cache = cache_service
    
    async def check_rate_limit(
        self,
        identifier: str,
        limit: int = 60,
        window: int = 60
    ) -> tuple[bool, Optional[int]]:
        """
        Rate limit 확인
        
        Returns:
            (allowed, remaining)
        """
        try:
            key = f"rate_limit:{identifier}"
            
            # 현재 카운트 가져오기
            current = await self.cache.get(key)
            
            if current is None:
                # 첫 요청
                await self.cache.set(key, 1, ttl=window)
                return True, limit - 1
            else:
                count = int(current)
                if count >= limit:
                    # 제한 초과
                    return False, 0
                else:
                    # 카운트 증가
                    await self.cache.set(key, count + 1, ttl=window)
                    return True, limit - count - 1
                    
        except Exception as e:
            logger.error(f"Rate limit check error: {e}")
            # 오류 시 허용
            return True, None
    
    async def reset_rate_limit(self, identifier: str):
        """Rate limit 리셋"""
        try:
            key = f"rate_limit:{identifier}"
            await self.cache.delete(key)
        except Exception as e:
            logger.error(f"Rate limit reset error: {e}")


# 전역 인스턴스
rate_limit_service = RateLimitService()
