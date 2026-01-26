"""
쿠폰 서비스
"""
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

# User 모델은 database.models에서 import
# Coupon, CouponUsage는 별도 모델 파일에서 정의
try:
    from ..database.models import User, Subscription
except ImportError:
    # User 모델이 없는 경우를 대비
    User = None
    Subscription = None

from ..services.monetization_service import MonetizationService
from ..utils.logger import get_logger
from .models import Coupon, CouponUsage
from .schemas import CouponCreate, CouponType

logger = get_logger(__name__)


class CouponService:
    """쿠폰 서비스"""
    
    def __init__(self):
        self.monetization_service = MonetizationService()
    
    async def create_coupon(
        self,
        db: AsyncSession,
        admin_id: str,
        coupon_data: CouponCreate
    ) -> Dict[str, Any]:
        """쿠폰 생성"""
        try:
            # 쿠폰 코드 중복 확인
            existing = await db.execute(
                select(Coupon).where(Coupon.code == coupon_data.code.upper())
            )
            if existing.scalar_one_or_none():
                return {
                    'success': False,
                    'error': '쿠폰 코드가 이미 존재합니다'
                }
            
            # 쿠폰 생성
            coupon = Coupon(
                code=coupon_data.code.upper(),
                name=coupon_data.name,
                description=coupon_data.description,
                type=coupon_data.type.value,
                value=coupon_data.value,
                max_users=coupon_data.max_users,
                max_uses_per_user=coupon_data.max_uses_per_user,
                expires_at=coupon_data.expires_at,
                is_active=coupon_data.is_active,
                plan_restriction=coupon_data.plan_restriction,
                min_purchase=coupon_data.min_purchase,
                options=coupon_data.options or {},
                created_by=admin_id
            )
            
            db.add(coupon)
            await db.commit()
            await db.refresh(coupon)
            
            logger.info(f"Coupon created: {coupon.code} by admin {admin_id}")
            
            return {
                'success': True,
                'coupon_id': coupon.id,
                'coupon': {
                    'id': coupon.id,
                    'code': coupon.code,
                    'name': coupon.name,
                    'type': coupon.type,
                    'value': coupon.value,
                    'max_users': coupon.max_users,
                    'expires_at': coupon.expires_at.isoformat() if coupon.expires_at else None
                }
            }
            
        except Exception as e:
            logger.error(f"Coupon creation error: {e}")
            await db.rollback()
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_coupon(
        self,
        db: AsyncSession,
        coupon_code: str
    ) -> Optional[Coupon]:
        """쿠폰 조회"""
        try:
            result = await db.execute(
                select(Coupon).where(Coupon.code == coupon_code.upper())
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Failed to get coupon {coupon_code}: {e}")
            return None
    
    async def validate_coupon(
        self,
        db: AsyncSession,
        coupon: Coupon,
        user_id: str,
        purchase_amount: Optional[float] = None
    ) -> Dict[str, Any]:
        """쿠폰 유효성 검증"""
        # 활성화 확인
        if not coupon.is_active:
            return {
                'valid': False,
                'error': '비활성화된 쿠폰입니다'
            }
        
        # 만료일 확인
        if coupon.expires_at and coupon.expires_at < datetime.utcnow():
            return {
                'valid': False,
                'error': '만료된 쿠폰입니다'
            }
        
        # 최대 사용 인원수 확인
        if coupon.max_users and coupon.current_users >= coupon.max_users:
            return {
                'valid': False,
                'error': '쿠폰 사용 인원수가 초과되었습니다'
            }
        
        # 사용자당 사용 횟수 확인
        usage_count = await db.execute(
            select(func.count(CouponUsage.id))
            .where(
                and_(
                    CouponUsage.coupon_id == coupon.id,
                    CouponUsage.user_id == user_id
                )
            )
        )
        count = usage_count.scalar() or 0
        if count >= coupon.max_uses_per_user:
            return {
                'valid': False,
                'error': f'이미 최대 사용 횟수({coupon.max_uses_per_user}회)를 사용했습니다'
            }
        
        # 플랜 제한 확인
        if User:
            user = await db.execute(
                select(User).where(User.id == user_id)
            )
            user_obj = user.scalar_one_or_none()
            if user_obj and coupon.plan_restriction:
                if user_obj.plan != coupon.plan_restriction:
                    return {
                        'valid': False,
                        'error': f'{coupon.plan_restriction} 플랜에만 사용 가능합니다'
                    }
        
        # 최소 구매 금액 확인
        if coupon.min_purchase and purchase_amount:
            if purchase_amount < coupon.min_purchase:
                return {
                    'valid': False,
                    'error': f'최소 구매 금액 {coupon.min_purchase}원 이상이어야 합니다'
                }
        
        return {
            'valid': True
        }
    
    async def use_coupon(
        self,
        db: AsyncSession,
        user_id: str,
        coupon_code: str,
        purchase_amount: Optional[float] = None
    ) -> Dict[str, Any]:
        """쿠폰 사용"""
        try:
            # 쿠폰 조회
            coupon = await self.get_coupon(db, coupon_code)
            if not coupon:
                return {
                    'success': False,
                    'error': '쿠폰을 찾을 수 없습니다'
                }
            
            # 유효성 검증
            validation = await self.validate_coupon(db, coupon, user_id, purchase_amount)
            if not validation['valid']:
                return {
                    'success': False,
                    'error': validation['error']
                }
            
            # 쿠폰 타입에 따라 처리
            result_data = {}
            applied_value = coupon.value
            
            if coupon.type == CouponType.SUBSCRIPTION_DAYS.value:
                # 구독 일수 추가
                days = int(coupon.value)
                
                # 활성 구독 찾기
                if Subscription:
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
                        # 기존 구독이 있으면 만료일 연장
                        if subscription.expires_at:
                            # 만료일이 지났으면 현재 시간부터 시작
                            if subscription.expires_at < datetime.utcnow():
                                new_expires_at = datetime.utcnow() + timedelta(days=days)
                            else:
                                # 만료일이 남아있으면 기존 만료일에서 연장
                                new_expires_at = subscription.expires_at + timedelta(days=days)
                        else:
                            # 만료일이 없으면 현재 시간부터 시작
                            new_expires_at = datetime.utcnow() + timedelta(days=days)
                        
                        old_expires_at = subscription.expires_at
                        subscription.expires_at = new_expires_at
                        await db.commit()
                        
                        result_data = {
                            'days_added': days,
                            'old_expires_at': old_expires_at.isoformat() if old_expires_at else None,
                            'new_expires_at': new_expires_at.isoformat(),
                            'message': f'{days}일 구독이 연장되었습니다. 새로운 만료일: {new_expires_at.strftime("%Y-%m-%d")}'
                        }
                    else:
                        # 활성 구독이 없으면 새 구독 생성 (Free 플랜으로)
                        new_expires_at = datetime.utcnow() + timedelta(days=days)
                        new_subscription = Subscription(
                            user_id=user_id,
                            plan_type='free',
                            status='active',
                            expires_at=new_expires_at
                        )
                        db.add(new_subscription)
                        await db.commit()
                        
                        result_data = {
                            'days_added': days,
                            'new_expires_at': new_expires_at.isoformat(),
                            'message': f'{days}일 무료 구독이 생성되었습니다. 만료일: {new_expires_at.strftime("%Y-%m-%d")}'
                        }
                else:
                    # Subscription 모델이 없는 경우
                    result_data = {
                        'days_added': days,
                        'message': f'{days}일 구독이 연장되었습니다 (구독 시스템 미연동)'
                    }
                
                result_type = 'subscription_extended'
                
            elif coupon.type == CouponType.CREDIT.value:
                # 크레딧 추가
                credits = int(coupon.value)
                if User:
                    user = await db.execute(
                        select(User).where(User.id == user_id)
                    )
                    user_obj = user.scalar_one_or_none()
                    if user_obj:
                        user_obj.credits = (user_obj.credits or 0) + credits
                        await db.commit()
                result_data = {
                    'credits_added': credits,
                    'message': f'{credits} 크레딧이 추가되었습니다'
                }
                result_type = 'credit_added'
                
            elif coupon.type == CouponType.DISCOUNT_PERCENT.value:
                # 할인율 적용
                if not purchase_amount:
                    return {
                        'success': False,
                        'error': '구매 금액이 필요합니다'
                    }
                discount = purchase_amount * (coupon.value / 100)
                applied_value = discount
                result_data = {
                    'discount_percent': coupon.value,
                    'discount_amount': discount,
                    'original_amount': purchase_amount,
                    'final_amount': purchase_amount - discount,
                    'message': f'{coupon.value}% 할인이 적용되었습니다'
                }
                result_type = 'discount_applied'
                
            elif coupon.type == CouponType.DISCOUNT_AMOUNT.value:
                # 할인 금액 적용
                if not purchase_amount:
                    return {
                        'success': False,
                        'error': '구매 금액이 필요합니다'
                    }
                discount = min(coupon.value, purchase_amount)
                applied_value = discount
                result_data = {
                    'discount_amount': discount,
                    'original_amount': purchase_amount,
                    'final_amount': purchase_amount - discount,
                    'message': f'{discount}원 할인이 적용되었습니다'
                }
                result_type = 'discount_applied'
                
            elif coupon.type == CouponType.PLAN_UPGRADE.value:
                # 플랜 업그레이드
                target_plan = coupon.options.get('target_plan') if coupon.options else None
                
                if not target_plan:
                    return {
                        'success': False,
                        'error': '쿠폰에 대상 플랜이 지정되지 않았습니다'
                    }
                
                # 유효한 플랜 타입 확인
                valid_plans = ['free', 'basic', 'premium', 'enterprise']
                if target_plan not in valid_plans:
                    return {
                        'success': False,
                        'error': f'유효하지 않은 플랜 타입입니다: {target_plan}'
                    }
                
                # 사용자 정보 업데이트
                if User:
                    user_result = await db.execute(
                        select(User).where(User.id == user_id)
                    )
                    user_obj = user_result.scalar_one_or_none()
                    
                    if user_obj:
                        old_plan = user_obj.plan or 'free'
                        user_obj.plan = target_plan
                        
                        # 구독 정보도 업데이트
                        if Subscription:
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
                                # 기존 구독의 플랜 타입 업데이트
                                subscription.plan_type = target_plan
                            else:
                                # 활성 구독이 없으면 새로 생성 (기본 30일)
                                new_expires_at = datetime.utcnow() + timedelta(days=30)
                                new_subscription = Subscription(
                                    user_id=user_id,
                                    plan_type=target_plan,
                                    status='active',
                                    expires_at=new_expires_at
                                )
                                db.add(new_subscription)
                        
                        await db.commit()
                        
                        result_data = {
                            'old_plan': old_plan,
                            'new_plan': target_plan,
                            'message': f'플랜이 {old_plan}에서 {target_plan}으로 업그레이드되었습니다'
                        }
                    else:
                        return {
                            'success': False,
                            'error': '사용자를 찾을 수 없습니다'
                        }
                else:
                    result_data = {
                        'new_plan': target_plan,
                        'message': f'플랜이 {target_plan}으로 업그레이드되었습니다 (사용자 모델 미연동)'
                    }
                
                result_type = 'plan_upgraded'
            
            else:
                return {
                    'success': False,
                    'error': '지원하지 않는 쿠폰 타입입니다'
                }
            
            # 사용 내역 기록
            usage = CouponUsage(
                coupon_id=coupon.id,
                user_id=user_id,
                applied_value=applied_value,
                result_type=result_type,
                result_data=result_data
            )
            db.add(usage)
            
            # 사용 인원수 증가
            coupon.current_users += 1
            await db.commit()
            
            logger.info(f"Coupon used: {coupon.code} by user {user_id}")
            
            return {
                'success': True,
                'message': '쿠폰이 성공적으로 사용되었습니다',
                'coupon_id': coupon.id,
                'applied_value': applied_value,
                'result_type': result_type,
                'result_data': result_data
            }
            
        except Exception as e:
            logger.error(f"Coupon usage error: {e}")
            await db.rollback()
            return {
                'success': False,
                'error': str(e)
            }
    
    async def list_coupons(
        self,
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20,
        is_active: Optional[bool] = None
    ) -> Dict[str, Any]:
        """쿠폰 목록 조회"""
        try:
            query = select(Coupon)
            
            if is_active is not None:
                query = query.where(Coupon.is_active == is_active)
            
            # 전체 개수
            count_result = await db.execute(
                select(func.count(Coupon.id))
            )
            total = count_result.scalar() or 0
            
            # 페이지네이션
            offset = (page - 1) * page_size
            query = query.order_by(Coupon.created_at.desc()).offset(offset).limit(page_size)
            
            result = await db.execute(query)
            coupons = result.scalars().all()
            
            return {
                'success': True,
                'coupons': [
                    {
                        'id': c.id,
                        'code': c.code,
                        'name': c.name,
                        'type': c.type,
                        'value': c.value,
                        'max_users': c.max_users,
                        'current_users': c.current_users,
                        'expires_at': c.expires_at.isoformat() if c.expires_at else None,
                        'is_active': c.is_active,
                        'created_at': c.created_at.isoformat()
                    }
                    for c in coupons
                ],
                'total': total,
                'page': page,
                'page_size': page_size,
                'total_pages': (total + page_size - 1) // page_size
            }
            
        except Exception as e:
            logger.error(f"List coupons error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_user_coupons(
        self,
        db: AsyncSession,
        user_id: str
    ) -> Dict[str, Any]:
        """사용자가 사용한 쿠폰 목록"""
        try:
            result = await db.execute(
                select(CouponUsage)
                .where(CouponUsage.user_id == user_id)
                .order_by(CouponUsage.used_at.desc())
                .options(selectinload(CouponUsage.coupon))
            )
            usages = result.scalars().all()
            
            return {
                'success': True,
                'usages': [
                    {
                        'id': u.id,
                        'coupon_code': u.coupon.code,
                        'coupon_name': u.coupon.name,
                        'used_at': u.used_at.isoformat(),
                        'applied_value': u.applied_value,
                        'result_type': u.result_type,
                        'result_data': u.result_data
                    }
                    for u in usages
                ]
            }
            
        except Exception as e:
            logger.error(f"Get user coupons error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
