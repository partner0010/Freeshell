"""
분석 및 통계 API 라우트
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Header
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from ..database.connection import get_db
from ..services.analytics_service import AnalyticsService
from ..services.db_user_service import DBUserService
from ..utils.security import SecurityManager
from ..utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()
analytics_service = AnalyticsService()
user_service = DBUserService()
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


@router.get("/overview")
async def get_platform_overview(
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """플랫폼 전체 개요"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # 관리자만 접근 가능
    is_admin = await user_service.is_admin(db, user_id)
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await analytics_service.get_platform_overview(db)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))


@router.get("/user-growth")
async def get_user_growth(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """사용자 성장 추이"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    is_admin = await user_service.is_admin(db, user_id)
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await analytics_service.get_user_growth(db, days)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))


@router.get("/video/{video_id}/performance")
async def get_video_performance(
    video_id: str,
    db: AsyncSession = Depends(get_db)
):
    """비디오 성과 분석"""
    result = await analytics_service.get_video_performance(db, video_id)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=404 if 'not found' in result.get('error', '') else 500, detail=result.get('error'))


@router.get("/top-videos")
async def get_top_videos(
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """인기 비디오 조회"""
    result = await analytics_service.get_top_videos(db, limit)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))


@router.get("/user/{user_id}/engagement")
async def get_user_engagement(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """사용자 참여도 분석"""
    current_user_id = get_current_user_id(authorization)
    if not current_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # 자신의 데이터이거나 관리자만 접근 가능
    if current_user_id != user_id:
        is_admin = await user_service.is_admin(db, current_user_id)
        if not is_admin:
            raise HTTPException(status_code=403, detail="Access denied")
    
    result = await analytics_service.get_user_engagement(db, user_id)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))
