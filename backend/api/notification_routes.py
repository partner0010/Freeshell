"""
알림 API 라우트
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Header
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from ..database.connection import get_db
from ..services.notification_service import NotificationService, NotificationType
from ..utils.security import SecurityManager
from ..utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()
notification_service = NotificationService()
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


@router.get("/")
async def get_notifications(
    limit: int = Query(20, ge=1, le=100),
    unread_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """알림 조회"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await notification_service.get_user_notifications(db, user_id, limit, unread_only)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))


@router.post("/mark-read/{notification_id}")
async def mark_notification_read(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """알림 읽음 처리"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # TODO: 읽음 상태 업데이트 구현
    return {
        'success': True,
        'message': 'Notification marked as read'
    }
