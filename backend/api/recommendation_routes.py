"""
AI 추천 API 라우트
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Header
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from ..database.connection import get_db
from ..services.recommendation_service import RecommendationService
from ..utils.security import SecurityManager
from ..utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()
recommendation_service = RecommendationService()
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


@router.get("/feed")
async def get_personalized_feed(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """개인화된 피드"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await recommendation_service.get_personalized_feed(db, user_id, limit)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))


@router.get("/trending")
async def get_trending_videos(
    limit: int = Query(20, ge=1, le=100),
    time_window: int = Query(7, ge=1, le=30),
    db: AsyncSession = Depends(get_db)
):
    """트렌딩 비디오"""
    result = await recommendation_service.get_trending_videos(db, limit, time_window)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))


@router.get("/similar/{video_id}")
async def get_similar_videos(
    video_id: str,
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    """유사 비디오 추천"""
    result = await recommendation_service.get_similar_videos(db, video_id, limit)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=404 if 'not found' in result.get('error', '') else 500, detail=result.get('error'))
