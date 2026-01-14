"""
수익화 서비스
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta
from enum import Enum

from ..database.models import User, Subscription, CreditTransaction, Video
from ..utils.logger import get_logger

logger = get_logger(__name__)


class PlanType(str, Enum):
    """구독 플랜 타입"""
    FREE = "free"
    BASIC = "basic"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"


class MonetizationService:
    """수익화 서비스"""
    
    PLAN_FEATURES = {
        PlanType.FREE: {
            'max_videos_per_month': 10,
            'max_video_duration': 60,  # seconds
            'resolution': '720p',
            'ads_enabled': True,
            'analytics': False
        },
        PlanType.BASIC: {
            'max_videos_per_month': 50,
            'max_video_duration': 300,
            'resolution': '1080p',
            'ads_enabled': False,
            'analytics': True
        },
        PlanType.PREMIUM: {
            'max_videos_per_month': -1,  # unlimited
            'max_video_duration': -1,  # unlimited
            'resolution': '4K',
            'ads_enabled': False,
            'analytics': True
        },
        PlanType.ENTERPRISE: {
            'max_videos_per_month': -1,
            'max_video_duration': -1,
            'resolution': '4K',
            'ads_enabled': False,
            'analytics': True,
            'priority_support': True
        }
    }
    
    async def get_user_plan(
        self,
        db: AsyncSession,
        user_id: str
    ) -> Dict[str, Any]:
        """사용자 구독 플랜 조회"""
        try:
            subscription_result = await db.execute(
                select(Subscription)
                .where(
                    and_(
                        Subscription.user_id == user_id,
                        Subscription.status == 'active'
                    )
                )
                .order_by(Subscription.created_at.desc())
            )
            subscription = subscription_result.scalar_one_or_none()
            
            if subscription:
                plan_type = subscription.plan_type
                expires_at = subscription.expires_at
            else:
                plan_type = PlanType.FREE.value
                expires_at = None
            
            features = self.PLAN_FEATURES.get(PlanType(plan_type), self.PLAN_FEATURES[PlanType.FREE])
            
            return {
                'success': True,
                'plan': {
                    'type': plan_type,
                    'features': features,
                    'expires_at': expires_at.isoformat() if expires_at else None,
                    'is_active': subscription is not None and (
                        expires_at is None or expires_at > datetime.utcnow()
                    )
                }
            }
            
        except Exception as e:
            logger.error(f"Get user plan error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def subscribe_plan(
        self,
        db: AsyncSession,
        user_id: str,
        plan_type: str,
        duration_days: int = 30
    ) -> Dict[str, Any]:
        """구독 플랜 구매"""
        try:
            # 기존 구독 취소
            await db.execute(
                Subscription.__table__.update()
                .where(
                    and_(
                        Subscription.user_id == user_id,
                        Subscription.status == 'active'
                    )
                )
                .values(status='cancelled')
            )
            
            # 새 구독 생성
            expires_at = datetime.utcnow() + timedelta(days=duration_days)
            subscription = Subscription(
                user_id=user_id,
                plan_type=plan_type,
                status='active',
                expires_at=expires_at
            )
            db.add(subscription)
            await db.commit()
            
            return {
                'success': True,
                'subscription_id': subscription.id,
                'plan_type': plan_type,
                'expires_at': expires_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Subscribe plan error: {e}")
            await db.rollback()
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_user_credits(
        self,
        db: AsyncSession,
        user_id: str
    ) -> Dict[str, Any]:
        """사용자 크레딧 조회"""
        try:
            # 총 크레딧 계산
            result = await db.execute(
                select(func.sum(CreditTransaction.amount))
                .where(CreditTransaction.user_id == user_id)
            )
            total_credits = result.scalar() or 0
            
            return {
                'success': True,
                'credits': total_credits
            }
            
        except Exception as e:
            logger.error(f"Get user credits error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def add_credits(
        self,
        db: AsyncSession,
        user_id: str,
        amount: int,
        description: str = 'Credit purchase'
    ) -> Dict[str, Any]:
        """크레딧 충전"""
        try:
            transaction = CreditTransaction(
                user_id=user_id,
                amount=amount,
                transaction_type='purchase',
                description=description
            )
            db.add(transaction)
            await db.commit()
            
            return {
                'success': True,
                'transaction_id': transaction.id,
                'amount': amount
            }
            
        except Exception as e:
            logger.error(f"Add credits error: {e}")
            await db.rollback()
            return {
                'success': False,
                'error': str(e)
            }
    
    async def use_credits(
        self,
        db: AsyncSession,
        user_id: str,
        amount: int,
        description: str = 'Credit usage'
    ) -> Dict[str, Any]:
        """크레딧 사용"""
        try:
            # 현재 크레딧 확인
            credits_result = await self.get_user_credits(db, user_id)
            if not credits_result['success']:
                return credits_result
            
            current_credits = credits_result['credits']
            if current_credits < amount:
                return {
                    'success': False,
                    'error': 'Insufficient credits'
                }
            
            # 크레딧 사용
            transaction = CreditTransaction(
                user_id=user_id,
                amount=-amount,
                transaction_type='usage',
                description=description
            )
            db.add(transaction)
            await db.commit()
            
            return {
                'success': True,
                'transaction_id': transaction.id,
                'remaining_credits': current_credits - amount
            }
            
        except Exception as e:
            logger.error(f"Use credits error: {e}")
            await db.rollback()
            return {
                'success': False,
                'error': str(e)
            }
    
    async def check_video_creation_limit(
        self,
        db: AsyncSession,
        user_id: str
    ) -> Dict[str, Any]:
        """비디오 생성 제한 확인"""
        try:
            plan_result = await self.get_user_plan(db, user_id)
            if not plan_result['success']:
                return plan_result
            
            plan = plan_result['plan']
            max_videos = plan['features'].get('max_videos_per_month', 10)
            
            if max_videos == -1:  # 무제한
                return {
                    'success': True,
                    'allowed': True,
                    'remaining': -1
                }
            
            # 이번 달 생성한 비디오 수
            month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            videos_result = await db.execute(
                select(func.count(Video.id))
                .where(
                    and_(
                        Video.user_id == user_id,
                        Video.created_at >= month_start
                    )
                )
            )
            videos_count = videos_result.scalar() or 0
            
            remaining = max_videos - videos_count
            allowed = remaining > 0
            
            return {
                'success': True,
                'allowed': allowed,
                'remaining': remaining,
                'used': videos_count,
                'limit': max_videos
            }
            
        except Exception as e:
            logger.error(f"Check video creation limit error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
