"""
쿠폰 스키마 (Pydantic)
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum


class CouponType(str, Enum):
    """쿠폰 타입"""
    SUBSCRIPTION_DAYS = "subscription_days"  # 구독 일수 추가
    CREDIT = "credit"  # 크레딧 추가
    DISCOUNT_PERCENT = "discount_percent"  # 할인율
    DISCOUNT_AMOUNT = "discount_amount"  # 할인 금액
    PLAN_UPGRADE = "plan_upgrade"  # 플랜 업그레이드


class CouponCreate(BaseModel):
    """쿠폰 생성 요청"""
    code: str = Field(..., min_length=3, max_length=50, description="쿠폰 코드")
    name: str = Field(..., min_length=1, max_length=200, description="쿠폰 이름")
    description: Optional[str] = Field(None, max_length=1000, description="설명")
    
    type: CouponType = Field(..., description="쿠폰 타입")
    value: float = Field(..., gt=0, description="쿠폰 값")
    
    # 사용 제한
    max_users: Optional[int] = Field(None, ge=1, description="최대 사용 인원수")
    max_uses_per_user: int = Field(1, ge=1, le=100, description="사용자당 최대 사용 횟수")
    
    # 기간
    expires_at: Optional[datetime] = Field(None, description="만료일")
    is_active: bool = Field(True, description="활성화 여부")
    
    # 제한 사항
    plan_restriction: Optional[str] = Field(None, description="플랜 제한 (free, basic, premium, enterprise)")
    min_purchase: Optional[float] = Field(None, ge=0, description="최소 구매 금액")
    
    # 추가 옵션
    options: Optional[Dict[str, Any]] = Field(None, description="추가 옵션")
    
    @validator('code')
    def validate_code(cls, v):
        """쿠폰 코드 검증 (대문자, 숫자, 하이픈만 허용)"""
        import re
        if not re.match(r'^[A-Z0-9\-]+$', v):
            raise ValueError('쿠폰 코드는 대문자, 숫자, 하이픈만 사용 가능합니다')
        return v.upper()
    
    @validator('expires_at')
    def validate_expires_at(cls, v):
        """만료일은 미래여야 함"""
        if v and v <= datetime.utcnow():
            raise ValueError('만료일은 미래여야 합니다')
        return v


class CouponResponse(BaseModel):
    """쿠폰 응답"""
    id: str
    code: str
    name: str
    description: Optional[str]
    type: str
    value: float
    max_users: Optional[int]
    max_uses_per_user: int
    current_users: int
    expires_at: Optional[datetime]
    is_active: bool
    plan_restriction: Optional[str]
    min_purchase: Optional[float]
    options: Optional[Dict[str, Any]]
    created_by: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CouponUsageRequest(BaseModel):
    """쿠폰 사용 요청"""
    code: str = Field(..., min_length=3, max_length=50, description="쿠폰 코드")
    purchase_amount: Optional[float] = Field(None, ge=0, description="구매 금액 (할인 쿠폰인 경우)")


class CouponUsageResponse(BaseModel):
    """쿠폰 사용 응답"""
    success: bool
    message: str
    coupon_id: str
    applied_value: float
    result_type: str
    result_data: Optional[Dict[str, Any]] = None
