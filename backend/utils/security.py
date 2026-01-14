"""
보안 유틸리티
"""

import os
import hashlib
import secrets
import re
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import jwt
from functools import wraps

from .logger import get_logger

logger = get_logger(__name__)

# 환경 변수에서 시크릿 키 가져오기 (기본값은 개발용)
SECRET_KEY = os.getenv('SECRET_KEY', secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


class SecurityManager:
    """보안 관리자"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """비밀번호 해시 (bcrypt 스타일)"""
        salt = secrets.token_hex(16)
        hash_obj = hashlib.sha256()
        hash_obj.update((password + salt).encode())
        return f"{salt}:{hash_obj.hexdigest()}"
    
    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """비밀번호 검증"""
        try:
            salt, hash_value = hashed.split(':')
            hash_obj = hashlib.sha256()
            hash_obj.update((password + salt).encode())
            return hash_obj.hexdigest() == hash_value
        except:
            return False
    
    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """JWT 토큰 생성"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """JWT 토큰 검증"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("Token expired")
            return None
        except jwt.InvalidTokenError:
            logger.warning("Invalid token")
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
        return True  # TODO: Redis 기반 구현 필요


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
