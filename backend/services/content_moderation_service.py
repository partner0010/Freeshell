"""
콘텐츠 모더레이션 서비스
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from enum import Enum

from ..database.models import Video, VideoComment, ActivityLog
from ..utils.logger import get_logger

logger = get_logger(__name__)


class ModerationStatus(str, Enum):
    """모더레이션 상태"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    FLAGGED = "flagged"


class ContentModerationService:
    """콘텐츠 모더레이션 서비스"""
    
    # 금지 키워드 목록 (실제로는 데이터베이스에 저장)
    PROHIBITED_KEYWORDS = [
        '폭력', '혐오', '차별', '불법', '사기'
    ]
    
    async def moderate_video(
        self,
        db: AsyncSession,
        video_id: str
    ) -> Dict[str, Any]:
        """비디오 모더레이션"""
        try:
            video_result = await db.execute(
                select(Video).where(Video.id == video_id)
            )
            video = video_result.scalar_one_or_none()
            
            if not video:
                return {
                    'success': False,
                    'error': 'Video not found'
                }
            
            # 자동 검사
            issues = []
            
            # 제목 검사
            if video.title:
                for keyword in self.PROHIBITED_KEYWORDS:
                    if keyword in video.title:
                        issues.append(f"제목에 금지 키워드 포함: {keyword}")
            
            # 설명 검사
            if video.description:
                for keyword in self.PROHIBITED_KEYWORDS:
                    if keyword in video.description:
                        issues.append(f"설명에 금지 키워드 포함: {keyword}")
            
            # 상태 결정
            if issues:
                status = ModerationStatus.FLAGGED
                action = 'review_required'
            else:
                status = ModerationStatus.APPROVED
                action = 'auto_approved'
            
            return {
                'success': True,
                'video_id': video_id,
                'status': status.value,
                'action': action,
                'issues': issues,
                'requires_review': len(issues) > 0
            }
            
        except Exception as e:
            logger.error(f"Moderate video error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def moderate_comment(
        self,
        db: AsyncSession,
        comment_id: str
    ) -> Dict[str, Any]:
        """댓글 모더레이션"""
        try:
            comment_result = await db.execute(
                select(VideoComment).where(VideoComment.id == comment_id)
            )
            comment = comment_result.scalar_one_or_none()
            
            if not comment:
                return {
                    'success': False,
                    'error': 'Comment not found'
                }
            
            # 자동 검사
            issues = []
            
            if comment.content:
                for keyword in self.PROHIBITED_KEYWORDS:
                    if keyword in comment.content:
                        issues.append(f"댓글에 금지 키워드 포함: {keyword}")
            
            # 상태 결정
            if issues:
                status = ModerationStatus.FLAGGED
                action = 'review_required'
            else:
                status = ModerationStatus.APPROVED
                action = 'auto_approved'
            
            return {
                'success': True,
                'comment_id': comment_id,
                'status': status.value,
                'action': action,
                'issues': issues,
                'requires_review': len(issues) > 0
            }
            
        except Exception as e:
            logger.error(f"Moderate comment error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def report_content(
        self,
        db: AsyncSession,
        user_id: str,
        resource_type: str,
        resource_id: str,
        reason: str
    ) -> Dict[str, Any]:
        """콘텐츠 신고"""
        try:
            # 신고 기록
            activity = ActivityLog(
                user_id=user_id,
                action='report_content',
                resource_type=resource_type,
                resource_id=resource_id,
                metadata={
                    'reason': reason,
                    'reported_at': datetime.utcnow().isoformat()
                }
            )
            
            db.add(activity)
            await db.commit()
            
            # 자동 모더레이션 트리거
            if resource_type == 'video':
                await self.moderate_video(db, resource_id)
            elif resource_type == 'comment':
                await self.moderate_comment(db, resource_id)
            
            return {
                'success': True,
                'report_id': activity.id,
                'message': 'Content reported successfully'
            }
            
        except Exception as e:
            logger.error(f"Report content error: {e}")
            await db.rollback()
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_pending_moderations(
        self,
        db: AsyncSession,
        limit: int = 50
    ) -> Dict[str, Any]:
        """대기 중인 모더레이션 조회"""
        try:
            # FLAGGED 상태의 콘텐츠 조회
            # 실제로는 모더레이션 상태를 별도 테이블에 저장해야 함
            # 여기서는 ActivityLog에서 신고된 콘텐츠 조회
            
            reports = await db.execute(
                select(ActivityLog)
                .where(ActivityLog.action == 'report_content')
                .order_by(ActivityLog.created_at.desc())
                .limit(limit)
            )
            
            pending_list = []
            for report in reports.scalars().all():
                pending_list.append({
                    'id': report.id,
                    'resource_type': report.resource_type,
                    'resource_id': report.resource_id,
                    'reason': report.metadata.get('reason', '') if report.metadata else '',
                    'reported_at': report.created_at.isoformat()
                })
            
            return {
                'success': True,
                'pending': pending_list,
                'count': len(pending_list)
            }
            
        except Exception as e:
            logger.error(f"Get pending moderations error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
