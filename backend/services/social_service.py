"""
소셜 기능 서비스 (팔로우, 공유)
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from datetime import datetime

from ..database.models import User, Video, VideoShare, follows_table
from ..utils.logger import get_logger

logger = get_logger(__name__)


class SocialService:
    """소셜 기능 서비스"""
    
    async def follow_user(
        self,
        db: AsyncSession,
        follower_id: str,
        following_id: str
    ) -> Dict[str, Any]:
        """사용자 팔로우"""
        try:
            if follower_id == following_id:
                return {
                    'success': False,
                    'error': 'Cannot follow yourself'
                }
            
            # 이미 팔로우 중인지 확인
            existing = await db.execute(
                select(follows_table).where(
                    and_(
                        follows_table.c.follower_id == follower_id,
                        follows_table.c.following_id == following_id
                    )
                )
            )
            if existing.first():
                return {
                    'success': True,
                    'message': 'Already following'
                }
            
            # 팔로우 추가
            await db.execute(
                follows_table.insert().values(
                    follower_id=follower_id,
                    following_id=following_id,
                    created_at=datetime.utcnow()
                )
            )
            await db.commit()
            
            return {
                'success': True,
                'message': 'User followed successfully'
            }
            
        except Exception as e:
            logger.error(f"Follow user error: {e}")
            await db.rollback()
            return {
                'success': False,
                'error': str(e)
            }
    
    async def unfollow_user(
        self,
        db: AsyncSession,
        follower_id: str,
        following_id: str
    ) -> Dict[str, Any]:
        """사용자 언팔로우"""
        try:
            await db.execute(
                follows_table.delete().where(
                    and_(
                        follows_table.c.follower_id == follower_id,
                        follows_table.c.following_id == following_id
                    )
                )
            )
            await db.commit()
            
            return {
                'success': True,
                'message': 'User unfollowed successfully'
            }
            
        except Exception as e:
            logger.error(f"Unfollow user error: {e}")
            await db.rollback()
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_followers(
        self,
        db: AsyncSession,
        user_id: str,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """팔로워 목록 조회"""
        try:
            offset = (page - 1) * page_size
            
            # 팔로워 조회
            followers_result = await db.execute(
                select(User)
                .join(follows_table, User.id == follows_table.c.follower_id)
                .where(follows_table.c.following_id == user_id)
                .offset(offset)
                .limit(page_size)
            )
            followers = followers_result.scalars().all()
            
            follower_list = []
            for user in followers:
                follower_list.append({
                    'id': user.id,
                    'username': user.username,
                    'avatar_path': user.avatar_path,
                    'bio': user.bio
                })
            
            # 전체 개수
            count_result = await db.execute(
                select(func.count(follows_table.c.follower_id))
                .where(follows_table.c.following_id == user_id)
            )
            total = count_result.scalar() or 0
            
            return {
                'success': True,
                'followers': follower_list,
                'total': total,
                'page': page,
                'page_size': page_size
            }
            
        except Exception as e:
            logger.error(f"Get followers error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_following(
        self,
        db: AsyncSession,
        user_id: str,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """팔로잉 목록 조회"""
        try:
            offset = (page - 1) * page_size
            
            # 팔로잉 조회
            following_result = await db.execute(
                select(User)
                .join(follows_table, User.id == follows_table.c.following_id)
                .where(follows_table.c.follower_id == user_id)
                .offset(offset)
                .limit(page_size)
            )
            following = following_result.scalars().all()
            
            following_list = []
            for user in following:
                following_list.append({
                    'id': user.id,
                    'username': user.username,
                    'avatar_path': user.avatar_path,
                    'bio': user.bio
                })
            
            # 전체 개수
            count_result = await db.execute(
                select(func.count(follows_table.c.following_id))
                .where(follows_table.c.follower_id == user_id)
            )
            total = count_result.scalar() or 0
            
            return {
                'success': True,
                'following': following_list,
                'total': total,
                'page': page,
                'page_size': page_size
            }
            
        except Exception as e:
            logger.error(f"Get following error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def is_following(
        self,
        db: AsyncSession,
        follower_id: str,
        following_id: str
    ) -> bool:
        """팔로우 여부 확인"""
        try:
            result = await db.execute(
                select(follows_table).where(
                    and_(
                        follows_table.c.follower_id == follower_id,
                        follows_table.c.following_id == following_id
                    )
                )
            )
            return result.first() is not None
        except Exception as e:
            logger.error(f"Is following error: {e}")
            return False
    
    async def share_video(
        self,
        db: AsyncSession,
        video_id: str,
        user_id: Optional[str] = None,
        share_type: str = 'link'
    ) -> Dict[str, Any]:
        """비디오 공유"""
        try:
            # 공유 기록
            share = VideoShare(
                video_id=video_id,
                user_id=user_id,
                share_type=share_type
            )
            db.add(share)
            
            # 비디오 공유 수 증가
            video_result = await db.execute(
                select(Video).where(Video.id == video_id)
            )
            video = video_result.scalar_one_or_none()
            if video:
                video.share_count = (video.share_count or 0) + 1
            
            await db.commit()
            
            return {
                'success': True,
                'share_id': share.id,
                'share_count': video.share_count if video else 0
            }
            
        except Exception as e:
            logger.error(f"Share video error: {e}")
            await db.rollback()
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_user_profile(
        self,
        db: AsyncSession,
        user_id: str,
        viewer_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """사용자 프로필 조회"""
        try:
            user_result = await db.execute(
                select(User).where(User.id == user_id)
            )
            user = user_result.scalar_one_or_none()
            
            if not user:
                return {
                    'success': False,
                    'error': 'User not found'
                }
            
            # 비디오 수
            videos_result = await db.execute(
                select(func.count(Video.id))
                .where(Video.user_id == user_id)
            )
            videos_count = videos_result.scalar() or 0
            
            # 팔로워 수
            followers_result = await db.execute(
                select(func.count(follows_table.c.follower_id))
                .where(follows_table.c.following_id == user_id)
            )
            followers_count = followers_result.scalar() or 0
            
            # 팔로잉 수
            following_result = await db.execute(
                select(func.count(follows_table.c.following_id))
                .where(follows_table.c.follower_id == user_id)
            )
            following_count = following_result.scalar() or 0
            
            # 팔로우 여부
            is_following_user = False
            if viewer_id and viewer_id != user_id:
                is_following_user = await self.is_following(db, viewer_id, user_id)
            
            return {
                'success': True,
                'profile': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email if viewer_id == user_id else None,  # 본인만 이메일 조회
                    'bio': user.bio,
                    'avatar_path': user.avatar_path,
                    'cover_image_path': user.cover_image_path,
                    'videos_count': videos_count,
                    'followers_count': followers_count,
                    'following_count': following_count,
                    'is_following': is_following_user,
                    'created_at': user.created_at.isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Get user profile error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
