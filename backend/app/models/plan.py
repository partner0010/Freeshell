"""
플랜 모델
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime


class PlanType(str, Enum):
    """플랜 타입"""
    FREE = "free"
    PRO = "pro"
    BUSINESS = "business"


class PlanResponse(BaseModel):
    """플랜 응답"""
    id: str
    name: str
    type: PlanType
    price: float
    currency: str = "USD"
    video_limit: Optional[int] = None  # None = 무제한
    max_resolution: str  # 720p, 1080p, 4K
    watermark: bool
    priority_processing: bool = False
    api_access: bool = False
    dedicated_support: bool = False
    features: Dict[str, Any] = Field(default_factory=dict)


class SubscriptionResponse(BaseModel):
    """구독 응답"""
    id: str
    user_id: str
    plan_id: str
    plan: PlanResponse
    status: str  # active, cancelled, expired
    started_at: datetime
    expires_at: Optional[datetime]
    created_at: datetime
