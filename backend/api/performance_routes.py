"""
성능 최적화 API 라우트
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Header
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from ..database.connection import get_db
from ..services.performance_service import PerformanceService
from ..services.db_user_service import DBUserService
from ..utils.security import SecurityManager
from ..utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()
performance_service = PerformanceService()
user_service = DBUserService()
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


@router.get("/metrics")
async def get_performance_metrics(
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """성능 메트릭 조회"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # 관리자만 접근 가능
    is_admin = await user_service.is_admin(db, user_id)
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = performance_service.get_performance_metrics()
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))


@router.post("/optimize/image")
async def optimize_image(
    image_path: str,
    max_width: int = Query(1920, ge=100, le=4000),
    max_height: int = Query(1080, ge=100, le=4000),
    quality: int = Query(85, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """이미지 최적화"""
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = performance_service.optimize_image(image_path, max_width, max_height, quality)
    if result['success']:
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get('error'))
