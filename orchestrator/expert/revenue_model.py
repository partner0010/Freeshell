"""
수익 분배 구조
"""

from typing import Dict, Any
from dataclasses import dataclass
from enum import Enum


class RevenueType(Enum):
    """수익 타입"""
    SERVICE = "service"  # 서비스 제공
    MARKETPLACE = "marketplace"  # 마켓플레이스
    SUBSCRIPTION = "subscription"  # 구독


@dataclass
class RevenueSplit:
    """수익 분배"""
    total: float
    platform_fee: float
    expert_earnings: float
    payment_fee: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'total': self.total,
            'platform_fee': self.platform_fee,
            'expert_earnings': self.expert_earnings,
            'payment_fee': self.payment_fee,
            'platform_percentage': (self.platform_fee / self.total * 100) if self.total > 0 else 0
        }


class RevenueCalculator:
    """수익 계산기"""
    
    # 수수료율
    SERVICE_FEE_RATES = {
        'premium': 0.15,  # 프리미엄 전문가: 15%
        'standard': 0.30  # 일반 전문가: 30%
    }
    
    MARKETPLACE_FEE_RATES = {
        'ebook': 0.30,  # 전자책: 30%
        'course': 0.30,  # 강의: 30%
        'template': 0.20,  # 템플릿: 20%
        'consulting': 0.15  # 컨설팅: 15%
    }
    
    PAYMENT_FEE_RATE = 0.029  # 결제 수수료: 2.9% + $0.30
    
    def calculate_service_revenue(
        self,
        total_cost: float,
        expert_premium: bool = False
    ) -> RevenueSplit:
        """서비스 수익 계산"""
        fee_rate = self.SERVICE_FEE_RATES['premium' if expert_premium else 'standard']
        platform_fee = total_cost * fee_rate
        payment_fee = total_cost * self.PAYMENT_FEE_RATE + 0.30
        expert_earnings = total_cost - platform_fee - payment_fee
        
        return RevenueSplit(
            total=total_cost,
            platform_fee=platform_fee,
            expert_earnings=expert_earnings,
            payment_fee=payment_fee
        )
    
    def calculate_marketplace_revenue(
        self,
        price: float,
        product_type: str
    ) -> RevenueSplit:
        """마켓플레이스 수익 계산"""
        fee_rate = self.MARKETPLACE_FEE_RATES.get(product_type, 0.30)
        platform_fee = price * fee_rate
        payment_fee = price * self.PAYMENT_FEE_RATE + 0.30
        expert_earnings = price - platform_fee - payment_fee
        
        return RevenueSplit(
            total=price,
            platform_fee=platform_fee,
            expert_earnings=expert_earnings,
            payment_fee=payment_fee
        )
    
    def calculate_subscription_revenue(
        self,
        monthly_fee: float,
        expert_premium: bool
    ) -> RevenueSplit:
        """구독 수익 계산"""
        # 구독은 전문가가 플랫폼에 지불
        # 전문가가 $9.99/월 지불 → 수수료 15% 적용
        if expert_premium:
            platform_fee = monthly_fee * 0.15
        else:
            platform_fee = 0  # 일반 전문가는 구독 없음
        
        return RevenueSplit(
            total=monthly_fee,
            platform_fee=platform_fee,
            expert_earnings=0,  # 구독은 지출
            payment_fee=monthly_fee * self.PAYMENT_FEE_RATE + 0.30
        )


class PayoutManager:
    """지급 관리"""
    
    def __init__(self):
        self.pending_payouts: Dict[str, float] = {}  # expert_id -> amount
        self.payout_threshold = 50.0  # 최소 지급 금액
    
    def add_earnings(self, expert_id: str, amount: float):
        """수익 추가"""
        if expert_id not in self.pending_payouts:
            self.pending_payouts[expert_id] = 0.0
        self.pending_payouts[expert_id] += amount
    
    def get_pending_amount(self, expert_id: str) -> float:
        """대기 중인 수익 조회"""
        return self.pending_payouts.get(expert_id, 0.0)
    
    def can_payout(self, expert_id: str) -> bool:
        """지급 가능 여부"""
        return self.get_pending_amount(expert_id) >= self.payout_threshold
    
    def process_payout(self, expert_id: str) -> Dict[str, Any]:
        """지급 처리"""
        amount = self.pending_payouts.get(expert_id, 0.0)
        if amount < self.payout_threshold:
            return {
                'success': False,
                'message': f'최소 지급 금액({self.payout_threshold}) 미달'
            }
        
        # 지급 처리 (실제로는 결제 게이트웨이 연동)
        self.pending_payouts[expert_id] = 0.0
        
        return {
            'success': True,
            'amount': amount,
            'message': '지급 완료'
        }
