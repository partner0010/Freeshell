"""
크레딧 시스템
"""

from typing import Dict, Any, Optional
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta
import uuid

from ..utils.logger import get_logger

logger = get_logger(__name__)


class PlanType(Enum):
    """플랜 타입"""
    FREE = "free"
    STARTER = "starter"
    PRO = "pro"
    BUSINESS = "business"


class CreditType(Enum):
    """크레딧 타입"""
    TEXT = "text"
    IMAGE = "image"
    SHORTFORM = "shortform"
    VIDEO = "video"
    AI_PREMIUM = "ai_premium"


@dataclass
class CreditCost:
    """크레딧 비용"""
    text: int = 1
    image: int = 5
    shortform: int = 50
    video: int = 100
    ai_premium: int = 10


@dataclass
class Plan:
    """플랜 정보"""
    type: PlanType
    monthly_price: float
    daily_credits: int
    monthly_credits: int
    additional_credit_price: float
    ai_quality: str = "basic"  # basic, advanced, premium
    features: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': self.type.value,
            'monthly_price': self.monthly_price,
            'daily_credits': self.daily_credits,
            'monthly_credits': self.monthly_credits,
            'additional_credit_price': self.additional_credit_price,
            'ai_quality': self.ai_quality,
            'features': self.features
        }


@dataclass
class UserCredits:
    """사용자 크레딧"""
    user_id: str
    plan: PlanType = PlanType.FREE
    current_credits: int = 0
    daily_used: int = 0
    monthly_used: int = 0
    last_reset_date: datetime = field(default_factory=datetime.now)
    purchased_credits: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'user_id': self.user_id,
            'plan': self.plan.value,
            'current_credits': self.current_credits,
            'daily_used': self.daily_used,
            'monthly_used': self.monthly_used,
            'last_reset_date': self.last_reset_date.isoformat(),
            'purchased_credits': self.purchased_credits
        }


class CreditSystem:
    """크레딧 시스템"""
    
    # 플랜 정의
    PLANS = {
        PlanType.FREE: Plan(
            type=PlanType.FREE,
            monthly_price=0.0,
            daily_credits=100,
            monthly_credits=3000,
            additional_credit_price=0.10,
            ai_quality="basic",
            features=["기본 AI", "일일 100 크레딧"]
        ),
        PlanType.STARTER: Plan(
            type=PlanType.STARTER,
            monthly_price=9.99,
            daily_credits=500,
            monthly_credits=15000,
            additional_credit_price=0.08,
            ai_quality="basic",
            features=["기본 AI", "일일 500 크레딧", "우선 처리"]
        ),
        PlanType.PRO: Plan(
            type=PlanType.PRO,
            monthly_price=29.99,
            daily_credits=2000,
            monthly_credits=60000,
            additional_credit_price=0.05,
            ai_quality="advanced",
            features=["고급 AI", "일일 2,000 크레딧", "배치 생성", "API 접근"]
        ),
        PlanType.BUSINESS: Plan(
            type=PlanType.BUSINESS,
            monthly_price=99.99,
            daily_credits=10000,
            monthly_credits=300000,
            additional_credit_price=0.03,
            ai_quality="premium",
            features=["최고급 AI", "일일 10,000 크레딧", "무제한 API", "전담 지원"]
        )
    }
    
    # 크레딧 비용
    CREDIT_COSTS = CreditCost()
    
    def __init__(self):
        self.user_credits: Dict[str, UserCredits] = {}
    
    def get_user_credits(self, user_id: str) -> UserCredits:
        """사용자 크레딧 조회"""
        if user_id not in self.user_credits:
            self.user_credits[user_id] = UserCredits(user_id=user_id)
        
        credits = self.user_credits[user_id]
        
        # 일일 리셋 확인
        if self._should_reset_daily(credits):
            self._reset_daily_credits(credits)
        
        return credits
    
    def can_use_credits(
        self,
        user_id: str,
        credit_type: CreditType,
        amount: int = 1
    ) -> Tuple[bool, str]:
        """크레딧 사용 가능 여부"""
        credits = self.get_user_credits(user_id)
        plan = self.PLANS[credits.plan]
        
        # 크레딧 비용 계산
        cost = self._calculate_cost(credit_type, amount)
        
        # 일일 제한 확인
        if credits.daily_used + cost > plan.daily_credits:
            return False, f"일일 크레딧 한도 초과 ({plan.daily_credits})"
        
        # 월간 제한 확인
        if credits.monthly_used + cost > plan.monthly_credits:
            return False, f"월간 크레딧 한도 초과 ({plan.monthly_credits})"
        
        # 구매한 크레딧 포함 총 크레딧 확인
        total_available = plan.daily_credits - credits.daily_used + credits.purchased_credits
        if cost > total_available:
            return False, "크레딧 부족"
        
        return True, "사용 가능"
    
    def use_credits(
        self,
        user_id: str,
        credit_type: CreditType,
        amount: int = 1
    ) -> Tuple[bool, str]:
        """크레딧 사용"""
        can_use, message = self.can_use_credits(user_id, credit_type, amount)
        
        if not can_use:
            return False, message
        
        credits = self.get_user_credits(user_id)
        cost = self._calculate_cost(credit_type, amount)
        
        # 구매한 크레딧 우선 사용
        if credits.purchased_credits >= cost:
            credits.purchased_credits -= cost
        else:
            remaining = cost - credits.purchased_credits
            credits.purchased_credits = 0
            credits.daily_used += remaining
        
        credits.monthly_used += cost
        credits.current_credits -= cost
        
        logger.info(f"User {user_id} used {cost} credits for {credit_type.value}")
        return True, f"{cost} 크레딧 사용됨"
    
    def purchase_credits(
        self,
        user_id: str,
        amount: int,
        price: float
    ) -> bool:
        """크레딧 구매"""
        credits = self.get_user_credits(user_id)
        plan = self.PLANS[credits.plan]
        
        # 가격 검증
        expected_price = amount * plan.additional_credit_price
        if abs(price - expected_price) > 0.01:
            logger.warning(f"Price mismatch: expected {expected_price}, got {price}")
            return False
        
        credits.purchased_credits += amount
        logger.info(f"User {user_id} purchased {amount} credits for ${price}")
        return True
    
    def upgrade_plan(self, user_id: str, new_plan: PlanType) -> bool:
        """플랜 업그레이드"""
        credits = self.get_user_credits(user_id)
        credits.plan = new_plan
        
        # 크레딧 리셋
        self._reset_daily_credits(credits)
        
        logger.info(f"User {user_id} upgraded to {new_plan.value}")
        return True
    
    def _calculate_cost(self, credit_type: CreditType, amount: int) -> int:
        """크레딧 비용 계산"""
        cost_map = {
            CreditType.TEXT: self.CREDIT_COSTS.text,
            CreditType.IMAGE: self.CREDIT_COSTS.image,
            CreditType.SHORTFORM: self.CREDIT_COSTS.shortform,
            CreditType.VIDEO: self.CREDIT_COSTS.video,
            CreditType.AI_PREMIUM: self.CREDIT_COSTS.ai_premium
        }
        
        base_cost = cost_map.get(credit_type, 1)
        return base_cost * amount
    
    def _should_reset_daily(self, credits: UserCredits) -> bool:
        """일일 리셋 필요 여부"""
        today = datetime.now().date()
        last_reset = credits.last_reset_date.date()
        return today > last_reset
    
    def _reset_daily_credits(self, credits: UserCredits):
        """일일 크레딧 리셋"""
        credits.daily_used = 0
        credits.last_reset_date = datetime.now()
        
        # 플랜에 따른 크레딧 부여
        plan = self.PLANS[credits.plan]
        credits.current_credits = plan.daily_credits
