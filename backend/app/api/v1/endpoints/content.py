"""
콘텐츠 생성 API 엔드포인트
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
import uuid

from ....schemas.content import (
    ContentGenerationRequest,
    ContentGenerationResponse,
    ContentStatusResponse,
    JobStatus,
)
from ....tasks.content_generation import generate_content_task, get_task_status
from ....database.connection import get_db
from ....utils.logger import get_logger
from ....services.plan_service import PlanService
from ....api.auth_routes import get_current_user
from ....database.models import User

logger = get_logger(__name__)

router = APIRouter()


def estimate_processing_time(options: Dict[str, Any]) -> int:
    """
    예상 처리 시간 계산 (초)
    
    Args:
        options: 생성 옵션
        
    Returns:
        예상 시간 (초)
    """
    # 기본 시간
    base_time = 60  # 1분
    
    # 이미지 생성 시간 (씬당 약 20초)
    image_time = 3 * 20  # 3개 씬
    
    # 오디오 생성 시간
    audio_time = 30 if options.get("with_audio", True) else 0
    
    # 비디오 합성 시간
    video_time = 30
    
    total = base_time + image_time + audio_time + video_time
    return total


@router.post("/generate", response_model=ContentGenerationResponse, status_code=status.HTTP_202_ACCEPTED)
async def generate_content(
    request: ContentGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    콘텐츠 생성 요청
    
    백그라운드 작업으로 실행되며 즉시 job_id를 반환합니다.
    """
    try:
        plan_service = PlanService()
        
        # 생성 요청 검증
        resolution = request.options.resolution.value
        validation = await plan_service.validate_generation_request(
            db,
            current_user.id,
            resolution,
            request.options.with_audio,
            request.options.with_subtitles,
        )
        
        if not validation["allowed"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=validation.get("error", "Generation not allowed")
            )
        
        # 크레딧 차감
        deduct_result = await plan_service.deduct_credits(
            db,
            current_user.id,
            validation["cost"],
            f"Content generation: {request.project_id}",
        )
        
        if not deduct_result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=deduct_result.get("error", "Failed to deduct credits")
            )
        
        logger.info(f"Content generation requested: project_id={request.project_id}, cost={validation['cost']}")
        
        # Celery 태스크 실행
        task = generate_content_task.delay(
            project_id=request.project_id,
            prompt_analysis_id=request.prompt_analysis_id,
            options=request.options.model_dump(),
        )
        
        # 예상 시간 계산
        estimated_time = estimate_processing_time(request.options.model_dump())
        
        return ContentGenerationResponse(
            job_id=task.id,
            status=JobStatus.PROCESSING,
            estimated_time=estimated_time,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to start content generation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start content generation: {str(e)}"
        )


@router.get("/status/{job_id}", response_model=ContentStatusResponse)
async def get_content_status(
    job_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    콘텐츠 생성 상태 조회
    
    Args:
        job_id: 작업 ID
        
    Returns:
        작업 상태 및 진행률
    """
    try:
        status_data = get_task_status(job_id)
        
        return ContentStatusResponse(
            status=JobStatus(status_data["status"]),
            progress=status_data["progress"],
            result=status_data.get("result"),
            error=status_data.get("error"),
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Failed to get content status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get content status: {str(e)}"
        )
