"""
Rate Limiting 미들웨어
"""

from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from ..services.rate_limit_service import rate_limit_service
from ..utils.logger import get_logger

logger = get_logger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate Limiting 미들웨어"""
    
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
    
    async def dispatch(self, request: Request, call_next):
        # 관리자 경로는 제외
        if request.url.path.startswith('/api/admin'):
            return await call_next(request)
        
        # 클라이언트 식별자 (IP 또는 사용자 ID)
        client_ip = request.client.host if request.client else 'unknown'
        
        # Rate limit 확인
        allowed, remaining = await rate_limit_service.check_rate_limit(
            identifier=f"ip:{client_ip}",
            limit=self.requests_per_minute,
            window=60
        )
        
        if not allowed:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    'error': 'Rate limit exceeded',
                    'message': f'Too many requests. Limit: {self.requests_per_minute} per minute'
                },
                headers={
                    'X-RateLimit-Limit': str(self.requests_per_minute),
                    'X-RateLimit-Remaining': '0',
                    'Retry-After': '60'
                }
            )
        
        response = await call_next(request)
        
        # Rate limit 헤더 추가
        response.headers['X-RateLimit-Limit'] = str(self.requests_per_minute)
        response.headers['X-RateLimit-Remaining'] = str(remaining or self.requests_per_minute)
        
        return response
