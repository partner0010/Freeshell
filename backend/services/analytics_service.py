"""
고급 분석 및 통계 서비스
"""

from typing import Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from ..database.models import Video, VideoLike, VideoComment, User, ActivityLog
from ..utils.logger import get_logger

logger = get_logger(__name__)


class AnalyticsService:
    """분석 및 통계 서비스"""
    
    async def get_platform_overview(self, db: AsyncSession) -> Dict[str, Any]:
        """플랫폼 전체 개요"""
        try:
            # 총 사용자 수
            user_count = await db.execute(select(func.count(User.id)))
            total_users = user_count.scalar() or 0
            
            # 활성 사용자 (최근 30일)
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            active_users = await db.execute(
                select(func.count(func.distinct(ActivityLog.user_id)))
                .where(ActivityLog.created_at >= thirty_days_ago)
            )
            active_users_count = active_users.scalar() or 0
            
            # 총 비디오 수
            video_count = await db.execute(select(func.count(Video.id)))
            total_videos = video_count.scalar() or 0
            
            # 총 좋아요 수
            like_count = await db.execute(select(func.count(VideoLike.id)))
            total_likes = like_count.scalar() or 0
            
            # 총 댓글 수
            comment_count = await db.execute(select(func.count(VideoComment.id)))
            total_comments = comment_count.scalar() or 0
            
            # 오늘 생성된 비디오
            today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            today_videos = await db.execute(
                select(func.count(Video.id))
                .where(Video.created_at >= today)
            )
            videos_today = today_videos.scalar() or 0
            
            return {
                'success': True,
                'overview': {
                    'total_users': total_users,
                    'active_users_30d': active_users_count,
                    'total_videos': total_videos,
                    'videos_today': videos_today,
                    'total_likes': total_likes,
                    'total_comments': total_comments,
                    'avg_engagement': (total_likes + total_comments) / max(total_videos, 1)
                },
                'timestamp': datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Analytics overview error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_user_growth(self, db: AsyncSession, days: int = 30) -> Dict[str, Any]:
        """사용자 성장 추이"""
        try:
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            # 일별 가입자 수
            daily_signups = []
            current_date = start_date
            
            while current_date <= end_date:
                next_date = current_date + timedelta(days=1)
                count = await db.execute(
                    select(func.count(User.id))
                    .where(
                        and_(
                            User.created_at >= current_date,
                            User.created_at < next_date
                        )
                    )
                )
                daily_signups.append({
                    'date': current_date.date().isoformat(),
                    'count': count.scalar() or 0
                })
                current_date = next_date
            
            return {
                'success': True,
                'growth': daily_signups,
                'period_days': days
            }
        except Exception as e:
            logger.error(f"User growth error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_video_performance(self, db: AsyncSession, video_id: str) -> Dict[str, Any]:
        """비디오 성과 분석"""
        try:
            # 비디오 정보
            video_result = await db.execute(
                select(Video).where(Video.id == video_id)
            )
            video = video_result.scalar_one_or_none()
            
            if not video:
                return {
                    'success': False,
                    'error': 'Video not found'
                }
            
            # 좋아요 수
            likes_result = await db.execute(
                select(func.count(VideoLike.id))
                .where(VideoLike.video_id == video_id)
            )
            likes_count = likes_result.scalar() or 0
            
            # 댓글 수
            comments_result = await db.execute(
                select(func.count(VideoComment.id))
                .where(VideoComment.video_id == video_id)
            )
            comments_count = comments_result.scalar() or 0
            
            # 조회수 (ActivityLog에서)
            views_result = await db.execute(
                select(func.count(ActivityLog.id))
                .where(
                    and_(
                        ActivityLog.resource_type == 'video',
                        ActivityLog.resource_id == video_id,
                        ActivityLog.action == 'view'
                    )
                )
            )
            views_count = views_result.scalar() or 0
            
            # 참여율
            engagement_rate = (likes_count + comments_count) / max(views_count, 1) * 100
            
            return {
                'success': True,
                'performance': {
                    'video_id': video_id,
                    'title': video.title,
                    'views': views_count,
                    'likes': likes_count,
                    'comments': comments_count,
                    'engagement_rate': round(engagement_rate, 2),
                    'created_at': video.created_at.isoformat()
                }
            }
        except Exception as e:
            logger.error(f"Video performance error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_top_videos(self, db: AsyncSession, limit: int = 10) -> Dict[str, Any]:
        """인기 비디오 조회"""
        try:
            # 좋아요 수 기준 상위 비디오
            top_videos_result = await db.execute(
                select(
                    Video.id,
                    Video.title,
                    Video.created_at,
                    func.count(VideoLike.id).label('likes_count')
                )
                .outerjoin(VideoLike, Video.id == VideoLike.video_id)
                .group_by(Video.id)
                .order_by(func.count(VideoLike.id).desc())
                .limit(limit)
            )
            
            top_videos = []
            for row in top_videos_result:
                top_videos.append({
                    'video_id': row.id,
                    'title': row.title,
                    'likes': row.likes_count or 0,
                    'created_at': row.created_at.isoformat()
                })
            
            return {
                'success': True,
                'top_videos': top_videos
            }
        except Exception as e:
            logger.error(f"Top videos error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_user_engagement(self, db: AsyncSession, user_id: str) -> Dict[str, Any]:
        """사용자 참여도 분석"""
        try:
            # 사용자 비디오 수
            videos_result = await db.execute(
                select(func.count(Video.id))
                .where(Video.user_id == user_id)
            )
            videos_count = videos_result.scalar() or 0
            
            # 총 좋아요 수 (사용자 비디오에 받은)
            likes_result = await db.execute(
                select(func.count(VideoLike.id))
                .join(Video, VideoLike.video_id == Video.id)
                .where(Video.user_id == user_id)
            )
            total_likes = likes_result.scalar() or 0
            
            # 총 댓글 수
            comments_result = await db.execute(
                select(func.count(VideoComment.id))
                .join(Video, VideoComment.video_id == Video.id)
                .where(Video.user_id == user_id)
            )
            total_comments = comments_result.scalar() or 0
            
            return {
                'success': True,
                'engagement': {
                    'user_id': user_id,
                    'videos_count': videos_count,
                    'total_likes': total_likes,
                    'total_comments': total_comments,
                    'avg_likes_per_video': total_likes / max(videos_count, 1),
                    'avg_comments_per_video': total_comments / max(videos_count, 1)
                }
            }
        except Exception as e:
            logger.error(f"User engagement error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
