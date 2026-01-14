"""
수익 예측
"""

from typing import Dict, Any, List
from dataclasses import dataclass
from datetime import datetime, timedelta

from .credit_system import PlanType
from .pricing_strategy import PricingStrategy


@dataclass
class RevenueForecast:
    """수익 예측"""
    period: str  # "month", "quarter", "year"
    total_revenue: float
    revenue_by_source: Dict[str, float]
    user_count: int
    paid_user_count: int
    conversion_rate: float
    arpu: float  # Average Revenue Per User
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'period': self.period,
            'total_revenue': self.total_revenue,
            'revenue_by_source': self.revenue_by_source,
            'user_count': self.user_count,
            'paid_user_count': self.paid_user_count,
            'conversion_rate': self.conversion_rate,
            'arpu': self.arpu
        }


class RevenueForecaster:
    """수익 예측기"""
    
    def __init__(self):
        self.pricing = PricingStrategy()
    
    def forecast_mvp(
        self,
        user_count: int = 1000,
        conversion_rate: float = 0.20
    ) -> RevenueForecast:
        """MVP 수익 예측"""
        paid_users = int(user_count * conversion_rate)
        
        # 플랜 분포 가정
        plan_distribution = {
            PlanType.STARTER: 0.60,  # 60%
            PlanType.PRO: 0.30,      # 30%
            PlanType.BUSINESS: 0.10  # 10%
        }
        
        # 구독 수익
        subscription_revenue = 0.0
        for plan_type, ratio in plan_distribution.items():
            count = int(paid_users * ratio)
            monthly_price = self.pricing.get_monthly_price(plan_type)
            subscription_revenue += count * monthly_price
        
        # 추가 크레딧 구매 (30% 사용자, 평균 $10)
        additional_credits = paid_users * 0.30 * 10.0
        
        # 전문가 수수료 (가정: 100명 전문가, 월 500건, 평균 $50)
        expert_revenue = 500 * 50.0 * 0.25  # 25% 평균 수수료
        
        total_revenue = subscription_revenue + additional_credits + expert_revenue
        
        return RevenueForecast(
            period="month",
            total_revenue=total_revenue,
            revenue_by_source={
                'subscription': subscription_revenue,
                'additional_credits': additional_credits,
                'expert_commission': expert_revenue
            },
            user_count=user_count,
            paid_user_count=paid_users,
            conversion_rate=conversion_rate,
            arpu=total_revenue / user_count
        )
    
    def forecast_6months(
        self,
        initial_users: int = 1000,
        growth_rate: float = 0.20,  # 월 20% 성장
        conversion_rate: float = 0.25
    ) -> List[RevenueForecast]:
        """6개월 수익 예측"""
        forecasts = []
        current_users = initial_users
        
        for month in range(1, 7):
            forecast = self.forecast_mvp(current_users, conversion_rate)
            forecast.period = f"month_{month}"
            forecasts.append(forecast)
            
            # 다음 달 사용자 수
            current_users = int(current_users * (1 + growth_rate))
            # 전환율도 점진적 증가
            conversion_rate = min(conversion_rate + 0.01, 0.35)
        
        return forecasts
    
    def calculate_break_even(
        self,
        monthly_costs: float = 1700.0
    ) -> Dict[str, Any]:
        """손익분기점 계산"""
        # 평균 ARPU 계산
        avg_arpu = 5.0  # MVP 기준
        
        # 필요한 사용자 수
        required_users = monthly_costs / avg_arpu
        
        # 전환율 20% 가정
        total_users = required_users / 0.20
        
        return {
            'monthly_costs': monthly_costs,
            'required_paid_users': required_users,
            'required_total_users': total_users,
            'break_even_arpu': avg_arpu
        }
    
    def project_year_one(
        self,
        starting_users: int = 1000
    ) -> Dict[str, Any]:
        """1년 수익 예측"""
        monthly_forecasts = self.forecast_6months(starting_users)
        
        # 후반 6개월은 성장률 감소 가정
        current_users = monthly_forecasts[-1].user_count
        for month in range(7, 13):
            forecast = self.forecast_mvp(current_users, 0.30)
            forecast.period = f"month_{month}"
            monthly_forecasts.append(forecast)
            current_users = int(current_users * 1.15)  # 15% 성장
        
        total_revenue = sum(f.total_revenue for f in monthly_forecasts)
        avg_monthly = total_revenue / 12
        
        return {
            'year_total': total_revenue,
            'year_average_monthly': avg_monthly,
            'monthly_breakdown': [f.to_dict() for f in monthly_forecasts],
            'year_end_users': monthly_forecasts[-1].user_count,
            'year_end_paid_users': monthly_forecasts[-1].paid_user_count
        }
