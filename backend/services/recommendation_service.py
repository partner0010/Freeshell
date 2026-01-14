"""
AI 추천 시스템
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from ..database.models import Video, VideoLike, VideoComment, User, ActivityLog
from ..utils.logger import get_logger

logger = get_logger(__name__)


class RecommendationService:
    """AI 추천 서비스"""
    
    async def get_personalized_feed(
        self,
        db: AsyncSession,
        user_id: str,
        limit: int = 20
    ) -> Dict[str, Any]:
        """개인화된 피드 추천"""
        try:
            # 1. 사용자가 좋아요한 비디오의 카테고리/태그 분석
            liked_videos = await db.execute(
                select(Video)
                .join(VideoLike, Video.id == VideoLike.video_id)
                .where(VideoLike.user_id == user_id)
            )
            liked_videos_list = liked_videos.scalars().all()
            
            # 2. 사용자가 본 비디오 (ActivityLog)
            viewed_videos = await db.execute(
                select(ActivityLog.resource_id)
                .where(
                    and_(
                        ActivityLog.user_id == user_id,
                        ActivityLog.resource_type == 'video',
                        ActivityLog.action == 'view'
                    )
                )
                .distinct()
            )
            viewed_ids = [row[0] for row in viewed_videos]
            
            # 3. 추천 알고리즘 (간단한 버전)
            # - 좋아요 많은 비디오 우선
            # - 사용자가 본 비디오 제외
            # - 최신 비디오도 포함
            
            recommended = await db.execute(
                select(
                    Video.id,
                    Video.title,
                    Video.description,
                    Video.file_path,
                    Video.thumbnail_path,
                    Video.created_at,
                    func.count(VideoLike.id).label('likes_count')
                )
                .outerjoin(VideoLike, Video.id == VideoLike.video_id)
                .where(
                    and_(
                        Video.status == 'completed',
                        ~Video.id.in_(viewed_ids) if viewed_ids else True
                    )
                )
                .group_by(Video.id)
                .order_by(
                    func.count(VideoLike.id).desc(),
                    Video.created_at.desc()
                )
                .limit(limit)
            )
            
            recommendations = []
            for row in recommended:
                recommendations.append({
                    'video_id': row.id,
                    'title': row.title,
                    'description': row.description,
                    'file_path': row.file_path,
                    'thumbnail_path': row.thumbnail_path,
                    'likes': row.likes_count or 0,
                    'created_at': row.created_at.isoformat()
                })
            
            return {
                'success': True,
                'recommendations': recommendations,
                'count': len(recommendations)
            }
            
        except Exception as e:
            logger.error(f"Personalized feed error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_trending_videos(
        self,
        db: AsyncSession,
        limit: int = 20,
        time_window: int = 7
    ) -> Dict[str, Any]:
        """트렌딩 비디오 (최근 N일간 인기)"""
        try:
            from datetime import datetime, timedelta
            
            cutoff_date = datetime.utcnow() - timedelta(days=time_window)
            
            # 최근 N일간 좋아요가 많은 비디오
            trending = await db.execute(
                select(
                    Video.id,
                    Video.title,
                    Video.description,
                    Video.file_path,
                    Video.thumbnail_path,
                    Video.created_at,
                    func.count(VideoLike.id).label('recent_likes')
                )
                .join(VideoLike, Video.id == VideoLike.video_id)
                .where(
                    and_(
                        Video.status == 'completed',
                        VideoLike.created_at >= cutoff_date
                    )
                )
                .group_by(Video.id)
                .order_by(func.count(VideoLike.id).desc())
                .limit(limit)
            )
            
            trending_list = []
            for row in trending:
                trending_list.append({
                    'video_id': row.id,
                    'title': row.title,
                    'description': row.description,
                    'file_path': row.file_path,
                    'thumbnail_path': row.thumbnail_path,
                    'recent_likes': row.recent_likes or 0,
                    'created_at': row.created_at.isoformat()
                })
            
            return {
                'success': True,
                'trending': trending_list,
                'time_window_days': time_window
            }
            
        except Exception as e:
            logger.error(f"Trending videos error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_similar_videos(
        self,
        db: AsyncSession,
        video_id: str,
        limit: int = 10
    ) -> Dict[str, Any]:
        """유사 비디오 추천"""
        try:
            # 현재 비디오 정보
            video_result = await db.execute(
                select(Video).where(Video.id == video_id)
            )
            video = video_result.scalar_one_or_none()
            
            if not video:
                return {
                    'success': False,
                    'error': 'Video not found'
                }
            
            # 같은 사용자의 다른 비디오 또는 비슷한 제목/설명
            similar = await db.execute(
                select(Video)
                .where(
                    and_(
                        Video.id != video_id,
                        Video.status == 'completed',
                        or_(
                            Video.user_id == video.user_id,
                            Video.title.contains(video.title[:10]) if video.title else False
                        )
                    )
                )
                .order_by(Video.created_at.desc())
                .limit(limit)
            )
            
            similar_list = []
            for v in similar.scalars().all():
                similar_list.append({
                    'video_id': v.id,
                    'title': v.title,
                    'description': v.description,
                    'file_path': v.file_path,
                    'thumbnail_path': v.thumbnail_path,
                    'created_at': v.created_at.isoformat()
                })
            
            return {
                'success': True,
                'similar_videos': similar_list
            }
            
        except Exception as e:
            logger.error(f"Similar videos error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
