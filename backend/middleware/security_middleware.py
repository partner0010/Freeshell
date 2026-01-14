"""
보안 미들웨어
"""

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import time

from ..utils.logger import get_logger

logger = get_logger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """보안 헤더 미들웨어"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # 보안 헤더 추가
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate Limiting 미들웨어 (간단한 구현)"""
    
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.request_counts = {}  # 실제로는 Redis 사용 권장
    
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        
        # Rate limit 체크 (간단한 구현)
        current_time = time.time()
        if client_ip in self.request_counts:
            count, last_reset = self.request_counts[client_ip]
            if current_time - last_reset > 60:  # 1분마다 리셋
                self.request_counts[client_ip] = (1, current_time)
            else:
                if count >= self.requests_per_minute:
                    raise HTTPException(status_code=429, detail="Rate limit exceeded")
                self.request_counts[client_ip] = (count + 1, last_reset)
        else:
            self.request_counts[client_ip] = (1, current_time)
        
        response = await call_next(request)
        return response
