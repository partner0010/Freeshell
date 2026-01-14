"""
무료 → 유료 전환 전략
"""

from typing import Dict, Any, List
from dataclasses import dataclass
from enum import Enum

from .credit_system import PlanType, CreditSystem
from .pricing_strategy import PricingStrategy


class ConversionTrigger(Enum):
    """전환 트리거"""
    CREDIT_EXHAUSTED = "credit_exhausted"
    FEATURE_LOCKED = "feature_locked"
    QUALITY_UPGRADE = "quality_upgrade"
    BATCH_NEEDED = "batch_needed"
    API_NEEDED = "api_needed"


@dataclass
class ConversionOpportunity:
    """전환 기회"""
    trigger: ConversionTrigger
    message: str
    suggested_plan: PlanType
    benefits: List[str]
    urgency: str = "normal"  # low, normal, high
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'trigger': self.trigger.value,
            'message': self.message,
            'suggested_plan': self.suggested_plan.value,
            'benefits': self.benefits,
            'urgency': self.urgency
        }


class ConversionFunnel:
    """전환 퍼널"""
    
    def __init__(self):
        self.credit_system = CreditSystem()
        self.pricing = PricingStrategy()
    
    def detect_opportunity(
        self,
        user_id: str,
        context: Dict[str, Any]
    ) -> Optional[ConversionOpportunity]:
        """전환 기회 감지"""
        credits = self.credit_system.get_user_credits(user_id)
        
        # 이미 유료 사용자면 None
        if credits.plan != PlanType.FREE:
            return None
        
        # 1. 크레딧 소진
        if credits.daily_used >= 80:  # 80% 사용 시
            return ConversionOpportunity(
                trigger=ConversionTrigger.CREDIT_EXHAUSTED,
                message="오늘 크레딧이 거의 소진되었습니다",
                suggested_plan=PlanType.STARTER,
                benefits=[
                    "일일 크레딧 5배 증가",
                    "우선 처리",
                    "추가 크레딧 할인"
                ],
                urgency="high"
            )
        
        # 2. 기능 잠금
        if context.get('feature_locked'):
            return ConversionOpportunity(
                trigger=ConversionTrigger.FEATURE_LOCKED,
                message="이 기능은 프리미엄 플랜에서만 사용 가능합니다",
                suggested_plan=PlanType.PRO,
                benefits=[
                    "고급 AI 모델",
                    "배치 생성",
                    "API 접근"
                ],
                urgency="normal"
            )
        
        # 3. 품질 업그레이드 요청
        if context.get('quality_requested'):
            return ConversionOpportunity(
                trigger=ConversionTrigger.QUALITY_UPGRADE,
                message="고품질 생성은 프로 플랜에서 가능합니다",
                suggested_plan=PlanType.PRO,
                benefits=[
                    "고급 AI 모델",
                    "더 나은 결과",
                    "빠른 처리"
                ],
                urgency="normal"
            )
        
        # 4. 배치 생성 필요
        if context.get('batch_requested'):
            return ConversionOpportunity(
                trigger=ConversionTrigger.BATCH_NEEDED,
                message="배치 생성은 프로 플랜에서 가능합니다",
                suggested_plan=PlanType.PRO,
                benefits=[
                    "여러 파일 동시 생성",
                    "시간 절약",
                    "API 접근"
                ],
                urgency="low"
            )
        
        return None
    
    def get_upgrade_benefits(self, current_plan: PlanType, target_plan: PlanType) -> Dict[str, Any]:
        """업그레이드 혜택"""
        suggestion = self.pricing.get_upgrade_suggestion(current_plan)
        
        if suggestion.get('recommended') == target_plan:
            return {
                'current_plan': current_plan.value,
                'target_plan': target_plan.value,
                'benefits': suggestion.get('benefits', []),
                'price': suggestion.get('price', 0.0),
                'savings': suggestion.get('savings', '')
            }
        
        return {
            'current_plan': current_plan.value,
            'target_plan': target_plan.value,
            'benefits': [],
            'price': 0.0
        }
    
    def calculate_conversion_value(
        self,
        user_id: str,
        target_plan: PlanType
    ) -> Dict[str, Any]:
        """전환 가치 계산"""
        credits = self.credit_system.get_user_credits(user_id)
        current_plan = credits.plan
        
        current_price = self.pricing.get_monthly_price(current_plan)
        target_price = self.pricing.get_monthly_price(target_plan)
        
        # 연간 절약액
        annual_savings = (target_price - current_price) * 12 * 0.20  # 연간 구독 할인
        
        return {
            'current_monthly': current_price,
            'target_monthly': target_price,
            'monthly_increase': target_price - current_price,
            'annual_savings': annual_savings,
            'value_proposition': f"월 ${target_price - current_price:.2f} 추가로 더 많은 기능 이용"
        }
