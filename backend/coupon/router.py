"""
쿠폰 API 라우터
"""
from fastapi import APIRouter, HTTPException, Depends, Query, Header
from typing import Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database.connection import get_db
from ..database.models import User
from ..utils.security import SecurityManager
from ..utils.logger import get_logger
from .service import CouponService
from .schemas import CouponCreate, CouponResponse, CouponUsageRequest, CouponUsageResponse

logger = get_logger(__name__)

router = APIRouter()
coupon_service = CouponService()
security_manager = SecurityManager()


def get_current_user_id(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """현재 사용자 ID 추출"""
    if not authorization or not authorization.startswith('Bearer '):
        return None
    token = authorization[7:]
    payload = security_manager.verify_token(token)
    if payload:
        return payload.get('sub')
    return None


async def require_admin(db: AsyncSession, user_id: str) -> bool:
    """관리자 권한 확인"""
    from sqlalchemy import select
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    return user and user.role == 'admin'


# ========== 관리자 API ==========

@router.post("/create", response_model=CouponResponse)
async def create_coupon(
    coupon_data: CouponCreate,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """쿠폰 생성 (관리자만)"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # 관리자 권한 확인
    is_admin = await require_admin(db, user_id)
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await coupon_service.create_coupon(db, user_id, coupon_data)
    if result['success']:
        # 쿠폰 조회하여 반환
        coupon = await coupon_service.get_coupon(db, result['coupon']['code'])
        if coupon:
            return CouponResponse(
                id=coupon.id,
                code=coupon.code,
                name=coupon.name,
                description=coupon.description,
                type=coupon.type,
                value=coupon.value,
                max_users=coupon.max_users,
                max_uses_per_user=coupon.max_uses_per_user,
                current_users=coupon.current_users,
                expires_at=coupon.expires_at,
                is_active=coupon.is_active,
                plan_restriction=coupon.plan_restriction,
                min_purchase=coupon.min_purchase,
                options=coupon.options,
                created_by=coupon.created_by,
                created_at=coupon.created_at,
                updated_at=coupon.updated_at
            )
    
    raise HTTPException(status_code=400, detail=result.get('error', 'Failed to create coupon'))


@router.get("/list")
async def list_coupons(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_active: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """쿠폰 목록 조회 (관리자만)"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # 관리자 권한 확인
    is_admin = await require_admin(db, user_id)
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await coupon_service.list_coupons(db, page, page_size, is_active)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))


# ========== 사용자 API ==========

@router.post("/use", response_model=CouponUsageResponse)
async def use_coupon(
    request: CouponUsageRequest,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """쿠폰 사용"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await coupon_service.use_coupon(
        db,
        user_id,
        request.code,
        request.purchase_amount
    )
    
    if result['success']:
        return CouponUsageResponse(
            success=True,
            message=result['message'],
            coupon_id=result['coupon_id'],
            applied_value=result['applied_value'],
            result_type=result['result_type'],
            result_data=result.get('result_data')
        )
    else:
        raise HTTPException(status_code=400, detail=result.get('error'))


@router.get("/my-coupons")
async def get_my_coupons(
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """내 쿠폰 사용 내역"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await coupon_service.get_user_coupons(db, user_id)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))


@router.get("/validate/{code}")
async def validate_coupon(
    code: str,
    db: AsyncSession = Depends(get_db)
):
    """쿠폰 유효성 확인 (공개)"""
    from datetime import datetime
    coupon = await coupon_service.get_coupon(db, code)
    if not coupon:
        return {
            'valid': False,
            'error': '쿠폰을 찾을 수 없습니다'
        }
    
    # 기본 유효성 확인
    if not coupon.is_active:
        return {
            'valid': False,
            'error': '비활성화된 쿠폰입니다'
        }
    
    if coupon.expires_at and coupon.expires_at < datetime.utcnow():
        return {
            'valid': False,
            'error': '만료된 쿠폰입니다'
        }
    
    if coupon.max_users and coupon.current_users >= coupon.max_users:
        return {
            'valid': False,
            'error': '쿠폰 사용 인원수가 초과되었습니다'
        }
    
    return {
        'valid': True,
        'coupon': {
            'code': coupon.code,
            'name': coupon.name,
            'type': coupon.type,
            'value': coupon.value,
            'expires_at': coupon.expires_at.isoformat() if coupon.expires_at else None
        }
    }
