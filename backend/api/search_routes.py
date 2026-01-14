"""
검색 API 라우트
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from ..database.connection import get_db
from ..services.search_service import SearchService
from ..utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()
search_service = SearchService()


@router.get("/videos")
async def search_videos(
    q: str = Query(..., min_length=1),
    user_id: Optional[str] = Query(None),
    min_likes: Optional[int] = Query(None, ge=0),
    sort_by: str = Query('relevance', regex='^(relevance|popular|newest|oldest)$'),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """비디오 검색"""
    try:
        filters = {}
        if user_id:
            filters['user_id'] = user_id
        if min_likes:
            filters['min_likes'] = min_likes
        
        result = await search_service.search_videos(
            db, q, filters, sort_by, page, page_size
        )
        
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=500, detail=result.get('error'))
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Search videos error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users")
async def search_users(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """사용자 검색"""
    try:
        result = await search_service.search_users(db, q, page, page_size)
        
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=500, detail=result.get('error'))
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Search users error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
