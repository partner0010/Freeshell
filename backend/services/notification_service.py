"""
알림 서비스
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from enum import Enum

from ..database.models import User, Video, VideoLike, VideoComment
from ..utils.logger import get_logger

logger = get_logger(__name__)


class NotificationType(str, Enum):
    """알림 타입"""
    LIKE = "like"
    COMMENT = "comment"
    FOLLOW = "follow"
    VIDEO_UPLOADED = "video_uploaded"
    SYSTEM = "system"


class NotificationService:
    """알림 서비스"""
    
    async def create_notification(
        self,
        db: AsyncSession,
        user_id: str,
        notification_type: NotificationType,
        title: str,
        message: str,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """알림 생성"""
        try:
            # 실제로는 Notification 테이블에 저장
            # 여기서는 ActivityLog에 기록
            from ..database.models import ActivityLog
            
            activity = ActivityLog(
                user_id=user_id,
                action=f"notification_{notification_type.value}",
                resource_type=resource_type,
                resource_id=resource_id,
                metadata={
                    'title': title,
                    'message': message,
                    'type': notification_type.value,
                    **(metadata or {})
                }
            )
            
            db.add(activity)
            await db.commit()
            
            return {
                'success': True,
                'notification_id': activity.id
            }
        except Exception as e:
            logger.error(f"Create notification error: {e}")
            await db.rollback()
            return {
                'success': False,
                'error': str(e)
            }
    
    async def notify_video_liked(
        self,
        db: AsyncSession,
        video_id: str,
        liker_id: str
    ) -> Dict[str, Any]:
        """비디오 좋아요 알림"""
        try:
            # 비디오 소유자 조회
            video_result = await db.execute(
                select(Video).where(Video.id == video_id)
            )
            video = video_result.scalar_one_or_none()
            
            if not video or video.user_id == liker_id:
                return {'success': True}  # 자신의 비디오는 알림 안 보냄
            
            # 좋아요한 사용자 정보
            liker_result = await db.execute(
                select(User).where(User.id == liker_id)
            )
            liker = liker_result.scalar_one_or_none()
            
            if not liker:
                return {'success': True}
            
            return await self.create_notification(
                db,
                video.user_id,
                NotificationType.LIKE,
                "새로운 좋아요",
                f"{liker.username}님이 당신의 비디오를 좋아합니다",
                resource_type="video",
                resource_id=video_id,
                metadata={'liker_id': liker_id, 'liker_username': liker.username}
            )
        except Exception as e:
            logger.error(f"Notify video liked error: {e}")
            return {'success': False, 'error': str(e)}
    
    async def notify_video_commented(
        self,
        db: AsyncSession,
        video_id: str,
        commenter_id: str,
        comment_content: str
    ) -> Dict[str, Any]:
        """비디오 댓글 알림"""
        try:
            # 비디오 소유자 조회
            video_result = await db.execute(
                select(Video).where(Video.id == video_id)
            )
            video = video_result.scalar_one_or_none()
            
            if not video or video.user_id == commenter_id:
                return {'success': True}
            
            # 댓글 작성자 정보
            commenter_result = await db.execute(
                select(User).where(User.id == commenter_id)
            )
            commenter = commenter_result.scalar_one_or_none()
            
            if not commenter:
                return {'success': True}
            
            return await self.create_notification(
                db,
                video.user_id,
                NotificationType.COMMENT,
                "새로운 댓글",
                f"{commenter.username}님이 댓글을 남겼습니다: {comment_content[:50]}",
                resource_type="video",
                resource_id=video_id,
                metadata={'commenter_id': commenter_id, 'commenter_username': commenter.username}
            )
        except Exception as e:
            logger.error(f"Notify video commented error: {e}")
            return {'success': False, 'error': str(e)}
    
    async def get_user_notifications(
        self,
        db: AsyncSession,
        user_id: str,
        limit: int = 20,
        unread_only: bool = False
    ) -> Dict[str, Any]:
        """사용자 알림 조회"""
        try:
            from ..database.models import ActivityLog
            
            query = select(ActivityLog).where(
                and_(
                    ActivityLog.user_id == user_id,
                    ActivityLog.action.like('notification_%')
                )
            ).order_by(ActivityLog.created_at.desc()).limit(limit)
            
            result = await db.execute(query)
            activities = result.scalars().all()
            
            notifications = []
            for activity in activities:
                metadata = activity.metadata or {}
                notifications.append({
                    'id': activity.id,
                    'type': metadata.get('type', 'system'),
                    'title': metadata.get('title', '알림'),
                    'message': metadata.get('message', ''),
                    'resource_type': activity.resource_type,
                    'resource_id': activity.resource_id,
                    'created_at': activity.created_at.isoformat(),
                    'read': False  # TODO: 읽음 상태 관리
                })
            
            return {
                'success': True,
                'notifications': notifications,
                'count': len(notifications)
            }
        except Exception as e:
            logger.error(f"Get notifications error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
