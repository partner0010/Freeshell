"""
SNS API 라우트 (STEP D)
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Header
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func, and_

from ..database.connection import get_db
from ..database.models import Video, VideoLike, VideoComment, User, ActivityLog
from ..services.db_user_service import DBUserService
from ..services.notification_service import NotificationService
from ..utils.security import SecurityManager
from ..utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()
user_service = DBUserService()
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


@router.post("/upload")
async def upload_video(
    title: str,
    description: Optional[str] = None,
    file_path: Optional[str] = None,
    scene_json: Optional[dict] = None,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """비디오 업로드"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        video = Video(
            user_id=user_id,
            title=title,
            description=description,
            file_path=file_path or '',
            scene_json=scene_json,
            status='completed'
        )
        
        db.add(video)
        await db.commit()
        await db.refresh(video)
        
        # 활동 로그 기록
        from datetime import datetime
        activity = ActivityLog(
            user_id=user_id,
            action='upload_video',
            resource_type='video',
            resource_id=video.id
        )
        db.add(activity)
        await db.commit()
        
        return {
            'success': True,
            'video_id': video.id,
            'video': {
                'id': video.id,
                'title': video.title,
                'description': video.description,
                'created_at': video.created_at.isoformat()
            }
        }
    except Exception as e:
        logger.error(f"Upload error: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/timeline")
async def get_timeline(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """타임라인 조회"""
    try:
        # 최신 비디오 조회
        offset = (page - 1) * page_size
        
        result = await db.execute(
            select(Video)
            .where(Video.status == 'completed')
            .order_by(desc(Video.created_at))
            .offset(offset)
            .limit(page_size)
        )
        videos = result.scalars().all()
        
        # 사용자 정보 포함
        video_list = []
        for video in videos:
            user_result = await db.execute(
                select(User).where(User.id == video.user_id)
            )
            user = user_result.scalar_one_or_none()
            
            # 좋아요 수
            likes_result = await db.execute(
                select(func.count(VideoLike.id))
                .where(VideoLike.video_id == video.id)
            )
            likes_count = likes_result.scalar() or 0
            
            # 댓글 수
            comments_result = await db.execute(
                select(func.count(VideoComment.id))
                .where(VideoComment.video_id == video.id)
            )
            comments_count = comments_result.scalar() or 0
            
            video_list.append({
                'id': video.id,
                'title': video.title,
                'description': video.description,
                'file_path': video.file_path,
                'thumbnail_path': video.thumbnail_path,
                'duration': video.duration,
                'created_at': video.created_at.isoformat(),
                'user': {
                    'id': user.id if user else None,
                    'username': user.username if user else 'Unknown'
                },
                'likes_count': likes_count,
                'comments_count': comments_count
            })
        
        # 전체 개수
        count_result = await db.execute(
            select(func.count(Video.id))
            .where(Video.status == 'completed')
        )
        total = count_result.scalar() or 0
        
        return {
            'success': True,
            'videos': video_list,
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': (total + page_size - 1) // page_size
        }
        
    except Exception as e:
        logger.error(f"Timeline error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/video/{video_id}")
async def get_video(
    video_id: str,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """비디오 상세 조회"""
    try:
        result = await db.execute(
            select(Video).where(Video.id == video_id)
        )
        video = result.scalar_one_or_none()
        
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        
        # 조회수 기록
        user_id = get_current_user_id(authorization)
        if user_id:
            activity = ActivityLog(
                user_id=user_id,
                action='view',
                resource_type='video',
                resource_id=video_id
            )
            db.add(activity)
            await db.commit()
        
        # 사용자 정보
        user_result = await db.execute(
            select(User).where(User.id == video.user_id)
        )
        user = user_result.scalar_one_or_none()
        
        # 좋아요 수
        likes_result = await db.execute(
            select(func.count(VideoLike.id))
            .where(VideoLike.video_id == video.id)
        )
        likes_count = likes_result.scalar() or 0
        
        # 댓글 수
        comments_result = await db.execute(
            select(func.count(VideoComment.id))
            .where(VideoComment.video_id == video.id)
        )
        comments_count = comments_result.scalar() or 0
        
        return {
            'success': True,
            'video': {
                'id': video.id,
                'title': video.title,
                'description': video.description,
                'file_path': video.file_path,
                'thumbnail_path': video.thumbnail_path,
                'duration': video.duration,
                'created_at': video.created_at.isoformat(),
                'user': {
                    'id': user.id if user else None,
                    'username': user.username if user else 'Unknown'
                },
                'likes_count': likes_count,
                'comments_count': comments_count
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get video error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/video/{video_id}/like")
async def like_video(
    video_id: str,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """비디오 좋아요"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        # 이미 좋아요 했는지 확인
        existing = await db.execute(
            select(VideoLike).where(
                and_(
                    VideoLike.video_id == video_id,
                    VideoLike.user_id == user_id
                )
            )
        )
        if existing.scalar_one_or_none():
            return {'success': True, 'message': 'Already liked'}
        
        # 좋아요 추가
        like = VideoLike(
            video_id=video_id,
            user_id=user_id
        )
        db.add(like)
        await db.commit()
        
        # 알림 전송
        await notification_service.notify_video_liked(db, video_id, user_id)
        
        return {
            'success': True,
            'message': 'Video liked'
        }
    except Exception as e:
        logger.error(f"Like video error: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/video/{video_id}/like")
async def unlike_video(
    video_id: str,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """비디오 좋아요 취소"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        like_result = await db.execute(
            select(VideoLike).where(
                and_(
                    VideoLike.video_id == video_id,
                    VideoLike.user_id == user_id
                )
            )
        )
        like = like_result.scalar_one_or_none()
        
        if like:
            await db.delete(like)
            await db.commit()
        
        return {
            'success': True,
            'message': 'Video unliked'
        }
    except Exception as e:
        logger.error(f"Unlike video error: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/video/{video_id}/comment")
async def add_comment(
    video_id: str,
    content: str,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """댓글 추가"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        comment = VideoComment(
            video_id=video_id,
            user_id=user_id,
            content=content
        )
        db.add(comment)
        await db.commit()
        await db.refresh(comment)
        
        # 알림 전송
        await notification_service.notify_video_commented(db, video_id, user_id, content)
        
        return {
            'success': True,
            'comment_id': comment.id,
            'comment': {
                'id': comment.id,
                'content': comment.content,
                'created_at': comment.created_at.isoformat()
            }
        }
    except Exception as e:
        logger.error(f"Add comment error: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/video/{video_id}/comments")
async def get_comments(
    video_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """댓글 조회"""
    try:
        offset = (page - 1) * page_size
        
        result = await db.execute(
            select(VideoComment)
            .where(VideoComment.video_id == video_id)
            .order_by(desc(VideoComment.created_at))
            .offset(offset)
            .limit(page_size)
        )
        comments = result.scalars().all()
        
        comment_list = []
        for comment in comments:
            user_result = await db.execute(
                select(User).where(User.id == comment.user_id)
            )
            user = user_result.scalar_one_or_none()
            
            comment_list.append({
                'id': comment.id,
                'content': comment.content,
                'created_at': comment.created_at.isoformat(),
                'user': {
                    'id': user.id if user else None,
                    'username': user.username if user else 'Unknown'
                }
            })
        
        return {
            'success': True,
            'comments': comment_list,
            'page': page,
            'page_size': page_size
        }
    except Exception as e:
        logger.error(f"Get comments error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
