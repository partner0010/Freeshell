"""
Spatial 모듈 - Pydantic 스키마
가벼운 Web 메타공간 데이터 구조
"""
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime


# ========== Space Schemas ==========

class SpaceCreate(BaseModel):
    """공간 생성 요청"""
    name: str = Field(..., min_length=1, max_length=100, description="공간 이름")
    description: Optional[str] = Field(None, max_length=500, description="공간 설명")
    type: Optional[str] = Field("lounge", description="공간 타입 (lounge, event, meeting 등)")
    theme: Optional[str] = Field(None, description="테마")
    is_public: Optional[bool] = Field(False, description="공개 여부")
    max_users: Optional[int] = Field(50, ge=1, le=1000, description="최대 사용자 수")


class SpaceUpdate(BaseModel):
    """공간 수정 요청"""
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="공간 이름")
    description: Optional[str] = Field(None, max_length=500, description="공간 설명")
    type: Optional[str] = Field(None, description="공간 타입")
    theme: Optional[str] = Field(None, description="테마")
    is_public: Optional[bool] = Field(None, description="공개 여부")
    max_users: Optional[int] = Field(None, ge=1, le=1000, description="최대 사용자 수")


class SpaceParticipantResponse(BaseModel):
    """공간 참가자 응답"""
    user_id: str
    character_id: Optional[str] = None
    position: Optional[Dict[str, float]] = None


class SpaceResponse(BaseModel):
    """공간 응답"""
    space_id: str
    name: str
    description: Optional[str] = None
    type: str = "lounge"
    owner_id: str
    is_public: bool = False
    max_users: int = 50
    current_users: int = 0
    participants: List[SpaceParticipantResponse] = Field(default_factory=list)
    theme: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class SpaceListResponse(BaseModel):
    """공간 목록 응답"""
    spaces: List[SpaceResponse]
    total: int
    page: int
    page_size: int


# ========== Chat Schemas ==========

class SpaceChatRequest(BaseModel):
    """공간 채팅 요청"""
    message: str = Field(..., min_length=1, description="메시지")
    character_id: Optional[str] = Field(None, description="캐릭터 ID")


class SpaceChatResponse(BaseModel):
    """공간 채팅 응답"""
    space_id: str
    user_id: str
    character_id: Optional[str] = None
    message: str
    character_reply: Optional[str] = None
    emotion: Optional[str] = None
    timestamp: datetime
