"""
가격 전략
"""

from typing import Dict, Any, List
from dataclasses import dataclass
from enum import Enum

from .credit_system import PlanType, Plan


class PricingTier(Enum):
    """가격 티어"""
    FREE = "free"
    STARTER = "starter"
    PRO = "pro"
    BUSINESS = "business"
    ENTERPRISE = "enterprise"


@dataclass
class PricingStrategy:
    """가격 전략"""
    
    # 구독 가격
    subscription_prices = {
        PlanType.FREE: 0.0,
        PlanType.STARTER: 9.99,
        PlanType.PRO: 29.99,
        PlanType.BUSINESS: 99.99
    }
    
    # 연간 구독 할인율
    annual_discount_rate = 0.20  # 20% 할인
    
    # 크레딧 추가 구매 가격
    additional_credit_prices = {
        PlanType.FREE: 0.10,
        PlanType.STARTER: 0.08,
        PlanType.PRO: 0.05,
        PlanType.BUSINESS: 0.03
    }
    
    # 전문가 수수료율
    expert_commission_rates = {
        'standard': 0.30,  # 30%
        'premium': 0.15    # 15%
    }
    
    # 마켓플레이스 수수료율
    marketplace_commission_rates = {
        'ebook': 0.30,      # 30%
        'course': 0.30,     # 30%
        'template': 0.20,   # 20%
        'consulting': 0.15  # 15%
    }
    
    # 기업용 가격
    enterprise_prices = {
        'starter': 199.0,      # 10대 PC
        'business': 499.0,      # 50대 PC
        'enterprise': 1999.0    # 무제한
    }
    
    def get_monthly_price(self, plan_type: PlanType) -> float:
        """월간 가격"""
        return self.subscription_prices.get(plan_type, 0.0)
    
    def get_annual_price(self, plan_type: PlanType) -> float:
        """연간 가격 (할인 적용)"""
        monthly = self.get_monthly_price(plan_type)
        annual = monthly * 12
        return annual * (1 - self.annual_discount_rate)
    
    def get_credit_price(self, plan_type: PlanType) -> float:
        """추가 크레딧 가격"""
        return self.additional_credit_prices.get(plan_type, 0.10)
    
    def calculate_expert_commission(
        self,
        service_price: float,
        expert_premium: bool = False
    ) -> Dict[str, float]:
        """전문가 수수료 계산"""
        rate = self.expert_commission_rates['premium' if expert_premium else 'standard']
        commission = service_price * rate
        expert_earnings = service_price - commission
        
        return {
            'total': service_price,
            'platform_commission': commission,
            'expert_earnings': expert_earnings,
            'commission_rate': rate
        }
    
    def calculate_marketplace_commission(
        self,
        product_price: float,
        product_type: str
    ) -> Dict[str, float]:
        """마켓플레이스 수수료 계산"""
        rate = self.marketplace_commission_rates.get(product_type, 0.30)
        commission = product_price * rate
        seller_earnings = product_price - commission
        
        return {
            'total': product_price,
            'platform_commission': commission,
            'seller_earnings': seller_earnings,
            'commission_rate': rate
        }
    
    def get_upgrade_suggestion(self, current_plan: PlanType) -> Dict[str, Any]:
        """업그레이드 제안"""
        suggestions = {
            PlanType.FREE: {
                'recommended': PlanType.STARTER,
                'benefits': [
                    "일일 크레딧 5배 증가 (100 → 500)",
                    "우선 처리",
                    "추가 크레딧 할인 (10% → 8%)"
                ],
                'price': 9.99,
                'savings': "월 $2.50 절약"
            },
            PlanType.STARTER: {
                'recommended': PlanType.PRO,
                'benefits': [
                    "일일 크레딧 4배 증가 (500 → 2,000)",
                    "고급 AI 모델",
                    "배치 생성",
                    "API 접근"
                ],
                'price': 29.99,
                'savings': "월 $10 절약"
            },
            PlanType.PRO: {
                'recommended': PlanType.BUSINESS,
                'benefits': [
                    "일일 크레딧 5배 증가 (2,000 → 10,000)",
                    "최고급 AI 모델",
                    "무제한 API",
                    "전담 지원"
                ],
                'price': 99.99,
                'savings': "월 $50 절약"
            }
        }
        
        return suggestions.get(current_plan, {})
