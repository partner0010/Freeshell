"""
Spatial/Metaverse Lite API 라우트 (STEP E)
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Header
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from ..database.connection import get_db
from ..services.spatial_service import SpatialService
from ..utils.security import SecurityManager
from ..utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()
spatial_service = SpatialService()
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


@router.post("/create")
async def create_space(
    name: str,
    description: Optional[str] = None,
    is_public: bool = False,
    max_users: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """공간 생성"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await spatial_service.create_space(
        db, user_id, name, description, is_public, max_users
    )
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))


@router.get("/{space_id}")
async def get_space(
    space_id: str,
    db: AsyncSession = Depends(get_db)
):
    """공간 조회"""
    result = await spatial_service.get_space(db, space_id)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=404 if 'not found' in result.get('error', '') else 500, detail=result.get('error'))


@router.get("/")
async def list_spaces(
    is_public: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """공간 목록 조회"""
    result = await spatial_service.list_spaces(db, is_public, page, page_size)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))


@router.post("/{space_id}/join")
async def join_space(
    space_id: str,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """공간 입장"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await spatial_service.join_space(db, space_id, user_id)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=400 if 'full' in result.get('error', '') else 404, detail=result.get('error'))


@router.post("/{space_id}/leave")
async def leave_space(
    space_id: str,
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """공간 퇴장"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await spatial_service.leave_space(db, space_id, user_id)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=404 if 'not found' in result.get('error', '') else 500, detail=result.get('error'))
