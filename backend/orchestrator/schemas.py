"""
통합 Orchestrator 스키마
"""
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class ContentType(str, Enum):
    """콘텐츠 타입"""
    SHORTFORM = "shortform"
    VIDEO = "video"
    IMAGE = "image"
    AUDIO = "audio"
    TEXT = "text"


class FlowStage(str, Enum):
    """플로우 단계"""
    CONTENT = "content"
    CHARACTER = "character"
    MEMORY = "memory"
    SPACE = "space"
    FEED = "feed"
    REVENUE = "revenue"


class UnifiedRequest(BaseModel):
    """통합 요청"""
    user_id: str = Field(..., description="사용자 ID (자동 설정)")
    prompt: str = Field(..., min_length=1, max_length=2000, description="프롬프트")
    content_type: Optional[ContentType] = Field(None, description="콘텐츠 타입")
    character_id: Optional[str] = Field(None, description="캐릭터 ID")
    vault_id: Optional[str] = Field(None, description="Vault ID (기억 저장)")
    space_id: Optional[str] = Field(None, description="공간 ID (공간에서 생성)")
    publish_to_feed: bool = Field(default=True, description="피드에 게시")
    enable_revenue: bool = Field(default=False, description="수익화 활성화")
    options: Dict[str, Any] = Field(default_factory=dict, description="추가 옵션")


class ContentFlow(BaseModel):
    """콘텐츠 플로우"""
    stage: FlowStage
    status: str = Field(..., description="success, error, pending")
    data: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime
    error: Optional[str] = None


class RevenueFlow(BaseModel):
    """수익 플로우"""
    revenue_type: str = Field(..., description="goods, donation, education, subscription")
    amount: float = Field(default=0.0)
    currency: str = Field(default="KRW")
    status: str = Field(default="pending", description="pending, completed, failed")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class UnifiedResponse(BaseModel):
    """통합 응답"""
    request_id: str
    user_id: str
    success: bool
    flows: List[ContentFlow] = Field(default_factory=list)
    revenue: Optional[RevenueFlow] = None
    final_content_id: Optional[str] = None
    feed_item_id: Optional[str] = None
    space_id: Optional[str] = None
    created_at: datetime
    error: Optional[str] = None
