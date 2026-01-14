"""
고급 검색 서비스
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from datetime import datetime

from ..database.models import Video, User, VideoLike, VideoComment
from ..utils.logger import get_logger

logger = get_logger(__name__)


class SearchService:
    """고급 검색 서비스"""
    
    async def search_videos(
        self,
        db: AsyncSession,
        query: str,
        filters: Optional[Dict[str, Any]] = None,
        sort_by: str = 'relevance',
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """비디오 검색"""
        try:
            filters = filters or {}
            offset = (page - 1) * page_size
            
            # 기본 검색 쿼리
            search_query = select(Video).where(
                Video.status == 'completed'
            )
            
            # 텍스트 검색 (제목, 설명)
            if query:
                search_query = search_query.where(
                    or_(
                        Video.title.contains(query),
                        Video.description.contains(query) if Video.description else False
                    )
                )
            
            # 필터 적용
            if filters.get('user_id'):
                search_query = search_query.where(Video.user_id == filters['user_id'])
            
            if filters.get('min_likes'):
                # 서브쿼리로 좋아요 수 필터링
                subquery = select(VideoLike.video_id).group_by(VideoLike.video_id).having(
                    func.count(VideoLike.id) >= filters['min_likes']
                ).subquery()
                search_query = search_query.join(subquery, Video.id == subquery.c.video_id)
            
            # 정렬
            if sort_by == 'relevance':
                # 좋아요 수 + 최신순
                search_query = search_query.order_by(Video.created_at.desc())
            elif sort_by == 'popular':
                # 좋아요 많은 순 (서브쿼리 필요)
                search_query = search_query.order_by(Video.created_at.desc())
            elif sort_by == 'newest':
                search_query = search_query.order_by(Video.created_at.desc())
            elif sort_by == 'oldest':
                search_query = search_query.order_by(Video.created_at.asc())
            
            # 페이지네이션
            search_query = search_query.offset(offset).limit(page_size)
            
            result = await db.execute(search_query)
            videos = result.scalars().all()
            
            # 결과 포맷팅
            video_list = []
            for video in videos:
                # 좋아요 수
                likes_result = await db.execute(
                    select(func.count(VideoLike.id))
                    .where(VideoLike.video_id == video.id)
                )
                likes_count = likes_result.scalar() or 0
                
                # 사용자 정보
                user_result = await db.execute(
                    select(User).where(User.id == video.user_id)
                )
                user = user_result.scalar_one_or_none()
                
                video_list.append({
                    'id': video.id,
                    'title': video.title,
                    'description': video.description,
                    'file_path': video.file_path,
                    'thumbnail_path': video.thumbnail_path,
                    'likes_count': likes_count,
                    'created_at': video.created_at.isoformat(),
                    'user': {
                        'id': user.id if user else None,
                        'username': user.username if user else 'Unknown'
                    }
                })
            
            # 전체 개수
            count_query = select(func.count(Video.id)).where(Video.status == 'completed')
            if query:
                count_query = count_query.where(
                    or_(
                        Video.title.contains(query),
                        Video.description.contains(query) if Video.description else False
                    )
                )
            count_result = await db.execute(count_query)
            total = count_result.scalar() or 0
            
            return {
                'success': True,
                'query': query,
                'videos': video_list,
                'total': total,
                'page': page,
                'page_size': page_size,
                'total_pages': (total + page_size - 1) // page_size
            }
            
        except Exception as e:
            logger.error(f"Search videos error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def search_users(
        self,
        db: AsyncSession,
        query: str,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """사용자 검색"""
        try:
            offset = (page - 1) * page_size
            
            search_query = select(User).where(
                and_(
                    User.is_active == True,
                    or_(
                        User.username.contains(query),
                        User.email.contains(query)
                    )
                )
            ).offset(offset).limit(page_size)
            
            result = await db.execute(search_query)
            users = result.scalars().all()
            
            user_list = []
            for user in users:
                # 비디오 수
                videos_result = await db.execute(
                    select(func.count(Video.id))
                    .where(Video.user_id == user.id)
                )
                videos_count = videos_result.scalar() or 0
                
                user_list.append({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'videos_count': videos_count,
                    'created_at': user.created_at.isoformat()
                })
            
            return {
                'success': True,
                'query': query,
                'users': user_list,
                'page': page,
                'page_size': page_size
            }
            
        except Exception as e:
            logger.error(f"Search users error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
