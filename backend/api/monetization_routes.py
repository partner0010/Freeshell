"""
수익화 API 라우트
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Header
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from ..database.connection import get_db
from ..services.monetization_service import MonetizationService, PlanType
from ..utils.security import SecurityManager
from ..utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()
monetization_service = MonetizationService()
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


@router.get("/plan")
async def get_user_plan(
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """사용자 구독 플랜 조회"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await monetization_service.get_user_plan(db, user_id)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))


@router.post("/subscribe")
async def subscribe_plan(
    plan_type: str,
    duration_days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """구독 플랜 구매"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if plan_type not in [p.value for p in PlanType]:
        raise HTTPException(status_code=400, detail="Invalid plan type")
    
    result = await monetization_service.subscribe_plan(db, user_id, plan_type, duration_days)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))


@router.get("/credits")
async def get_user_credits(
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """사용자 크레딧 조회"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await monetization_service.get_user_credits(db, user_id)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))


@router.post("/credits/add")
async def add_credits(
    amount: int = Query(..., ge=1),
    description: str = Query('Credit purchase'),
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """크레딧 충전"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await monetization_service.add_credits(db, user_id, amount, description)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))


@router.post("/credits/use")
async def use_credits(
    amount: int = Query(..., ge=1),
    description: str = Query('Credit usage'),
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """크레딧 사용"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await monetization_service.use_credits(db, user_id, amount, description)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=400 if 'Insufficient' in result.get('error', '') else 500, detail=result.get('error'))


@router.get("/video-limit")
async def check_video_creation_limit(
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """비디오 생성 제한 확인"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await monetization_service.check_video_creation_limit(db, user_id)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))
