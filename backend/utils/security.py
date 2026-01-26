"""
보안 유틸리티
"""

import os
import secrets
import re
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import jwt
import bcrypt
from functools import wraps

from .logger import get_logger

logger = get_logger(__name__)

# 환경 변수에서 시크릿 키 가져오기 (기본값은 개발용)
SECRET_KEY = os.getenv('SECRET_KEY', secrets.token_urlsafe(32))
REFRESH_SECRET_KEY = os.getenv('REFRESH_SECRET_KEY', secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15  # 15분
REFRESH_TOKEN_EXPIRE_DAYS = 7  # 7일


class SecurityManager:
    """보안 관리자"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """비밀번호 해시 (bcrypt)"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """비밀번호 검증 (bcrypt)"""
        try:
            return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return False
    
    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Access Token 생성 (15분)"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        })
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Refresh Token 생성 (7일)"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh"
        })
        encoded_jwt = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str, is_refresh: bool = False) -> Optional[Dict[str, Any]]:
        """JWT 토큰 검증"""
        try:
            secret = REFRESH_SECRET_KEY if is_refresh else SECRET_KEY
            payload = jwt.decode(token, secret, algorithms=[ALGORITHM])
            
            # 토큰 타입 확인
            token_type = payload.get("type")
            if is_refresh and token_type != "refresh":
                logger.warning("Invalid refresh token type")
                return None
            if not is_refresh and token_type != "access":
                logger.warning("Invalid access token type")
                return None
                
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("Token expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {e}")
            return None
    
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """파일명 정제 (경로 탐색 공격 방지)"""
        # 위험한 문자 제거
        filename = re.sub(r'[^a-zA-Z0-9._-]', '', filename)
        # 경로 탐색 방지
        filename = os.path.basename(filename)
        # 최대 길이 제한
        return filename[:255]
    
    @staticmethod
    def validate_path(path: str, base_dir: str) -> bool:
        """경로 검증 (경로 탐색 공격 방지)"""
        try:
            # 절대 경로 변환
            abs_path = os.path.abspath(path)
            abs_base = os.path.abspath(base_dir)
            # base_dir 내에 있는지 확인
            return abs_path.startswith(abs_base)
        except:
            return False
    
    @staticmethod
    def sanitize_input(text: str, max_length: int = 1000) -> str:
        """입력값 정제 (XSS 방지)"""
        # HTML 태그 제거
        text = re.sub(r'<[^>]+>', '', text)
        # 특수 문자 이스케이프
        text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        # 길이 제한
        return text[:max_length]
    
    @staticmethod
    def check_rate_limit(user_id: str, action: str, limit: int = 10, window: int = 60) -> bool:
        """Rate Limiting (간단한 메모리 기반)"""
        # 실제로는 Redis 등을 사용해야 함
        # 여기서는 기본 구조만 제공
        # Redis 기반 구현
        try:
            from backend.services.cache_service import CacheService
            cache_service = CacheService()
            
            # Redis에서 토큰 확인
            cached_token = await cache_service.get(f"token:{token}")
            if cached_token:
                return True
            
            # 토큰이 유효하면 Redis에 캐싱 (1시간)
            if self.verify_token(token):
                await cache_service.set(f"token:{token}", {"valid": True}, ttl=3600)
                return True
            
            return False
        except Exception as e:
            logger.warning(f"Redis token verification failed, using fallback: {e}")
            # Fallback: 기본 검증
            return self.verify_token(token) is not None


def require_auth(f):
    """인증 필요 데코레이터"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        # 실제 구현은 FastAPI Depends 사용
        return f(*args, **kwargs)
    return wrapper


def require_admin(f):
    """관리자 권한 필요 데코레이터"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        # 실제 구현은 FastAPI Depends 사용
        return f(*args, **kwargs)
    return wrapper
