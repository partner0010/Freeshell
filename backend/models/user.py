"""
사용자 모델
"""

from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """사용자 역할"""
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"


class User(BaseModel):
    """사용자 모델"""
    id: str
    email: EmailStr
    username: str
    role: UserRole = UserRole.USER
    created_at: datetime
    last_login: Optional[datetime] = None
    is_active: bool = True
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "user123",
                "email": "user@example.com",
                "username": "user",
                "role": "user",
                "created_at": "2024-01-01T00:00:00",
                "is_active": True
            }
        }


class UserCreate(BaseModel):
    """사용자 생성 요청"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=20)
    password: str = Field(..., min_length=8, max_length=100)


class UserLogin(BaseModel):
    """로그인 요청"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """토큰 응답"""
    access_token: str
    token_type: str = "bearer"
