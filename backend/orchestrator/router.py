"""
통합 Orchestrator API 라우터
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core import get_db, get_current_user
from backend.database.models import User
from backend.utils.logger import get_logger
from .unified_orchestrator import UnifiedOrchestrator
from .schemas import UnifiedRequest, UnifiedResponse

router = APIRouter(prefix="/api/v1/orchestrator", tags=["orchestrator"])
orchestrator = UnifiedOrchestrator()
logger = get_logger(__name__)


@router.post("/unified", response_model=UnifiedResponse, status_code=status.HTTP_202_ACCEPTED)
async def process_unified_flow(
    request: UnifiedRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    통합 플로우 처리
    
    콘텐츠 생성 → 캐릭터 → 기억 → 공간 → 피드 → 수익
    
    윤리/법적 검증 포함
    """
    # user_id 설정
    request.user_id = user.id
    
    result = await orchestrator.process(db, request)
    
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error or "Failed to process unified flow"
        )
    
    return result
