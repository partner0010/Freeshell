"""
콘텐츠 모더레이션 API 라우트
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Header
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from ..database.connection import get_db
from ..services.content_moderation_service import ContentModerationService
from ..services.db_user_service import DBUserService
from ..utils.security import SecurityManager
from ..utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()
moderation_service = ContentModerationService()
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


@router.post("/video/{video_id}")
async def moderate_video(
    video_id: str,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """비디오 모더레이션"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # 관리자 또는 모더레이터만 접근 가능
    is_admin = await user_service.is_admin(db, user_id)
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await moderation_service.moderate_video(db, video_id)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=404 if 'not found' in result.get('error', '') else 500, detail=result.get('error'))


@router.post("/comment/{comment_id}")
async def moderate_comment(
    comment_id: str,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """댓글 모더레이션"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    is_admin = await user_service.is_admin(db, user_id)
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await moderation_service.moderate_comment(db, comment_id)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=404 if 'not found' in result.get('error', '') else 500, detail=result.get('error'))


@router.post("/report")
async def report_content(
    resource_type: str,
    resource_id: str,
    reason: str,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """콘텐츠 신고"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await moderation_service.report_content(
        db, user_id, resource_type, resource_id, reason
    )
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))


@router.get("/pending")
async def get_pending_moderations(
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """대기 중인 모더레이션 조회"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    is_admin = await user_service.is_admin(db, user_id)
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await moderation_service.get_pending_moderations(db, limit)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))
