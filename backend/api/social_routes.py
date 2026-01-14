"""
소셜 기능 API 라우트 (팔로우, 공유, 프로필)
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Header
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from ..database.connection import get_db
from ..services.social_service import SocialService
from ..utils.security import SecurityManager
from ..utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()
social_service = SocialService()
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


@router.post("/follow/{user_id}")
async def follow_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """사용자 팔로우"""
    follower_id = get_current_user_id(authorization)
    if not follower_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await social_service.follow_user(db, follower_id, user_id)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=400, detail=result.get('error'))


@router.delete("/follow/{user_id}")
async def unfollow_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """사용자 언팔로우"""
    follower_id = get_current_user_id(authorization)
    if not follower_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await social_service.unfollow_user(db, follower_id, user_id)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=400, detail=result.get('error'))


@router.get("/followers/{user_id}")
async def get_followers(
    user_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """팔로워 목록"""
    result = await social_service.get_followers(db, user_id, page, page_size)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))


@router.get("/following/{user_id}")
async def get_following(
    user_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """팔로잉 목록"""
    result = await social_service.get_following(db, user_id, page, page_size)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))


@router.get("/profile/{user_id}")
async def get_user_profile(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """사용자 프로필 조회"""
    viewer_id = get_current_user_id(authorization)
    
    result = await social_service.get_user_profile(db, user_id, viewer_id)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=404 if 'not found' in result.get('error', '') else 500, detail=result.get('error'))


@router.post("/share/video/{video_id}")
async def share_video(
    video_id: str,
    share_type: str = Query('link', regex='^(link|embed|social)$'),
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """비디오 공유"""
    user_id = get_current_user_id(authorization)  # 선택사항
    
    result = await social_service.share_video(db, video_id, user_id, share_type)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))
