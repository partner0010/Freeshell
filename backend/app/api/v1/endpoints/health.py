"""
헬스체크 API 엔드포인트
DB 연결, 외부 API 상태 확인
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import httpx
import os
from typing import Dict, Any

from ....schemas.health import HealthResponse, HealthDetailResponse
from ....database.connection import get_db
from ....utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()


async def check_database(db: AsyncSession) -> Dict[str, Any]:
    """데이터베이스 연결 확인"""
    try:
        result = await db.execute(text("SELECT 1"))
        result.scalar()
        return {"status": "healthy", "message": "Database connection OK"}
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {"status": "unhealthy", "message": str(e)}


async def check_external_apis() -> Dict[str, Any]:
    """외부 API 상태 확인"""
    results = {}
    
    # OpenAI API 확인
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        results["openai"] = {"status": "configured", "message": "API key set"}
    else:
        results["openai"] = {"status": "not_configured", "message": "API key not set"}
    
    # Replicate API 확인
    replicate_key = os.getenv("REPLICATE_API_TOKEN")
    if replicate_key:
        results["replicate"] = {"status": "configured", "message": "API token set"}
    else:
        results["replicate"] = {"status": "not_configured", "message": "API token not set"}
    
    # Stability AI API 확인
    stability_key = os.getenv("STABILITY_API_KEY")
    if stability_key:
        results["stability_ai"] = {"status": "configured", "message": "API key set"}
    else:
        results["stability_ai"] = {"status": "not_configured", "message": "API key not set"}
    
    # ElevenLabs API 확인
    elevenlabs_key = os.getenv("ELEVENLABS_API_KEY")
    if elevenlabs_key:
        results["elevenlabs"] = {"status": "configured", "message": "API key set"}
    else:
        results["elevenlabs"] = {"status": "not_configured", "message": "API key not set"}
    
    # AWS S3 확인
    aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    if aws_access_key and aws_secret_key:
        results["aws_s3"] = {"status": "configured", "message": "AWS credentials set"}
    else:
        results["aws_s3"] = {"status": "not_configured", "message": "AWS credentials not set"}
    
    # Redis 확인
    redis_url = os.getenv("REDIS_URL")
    if redis_url:
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                # Redis 연결 테스트는 실제 연결을 시도해야 하므로
                # 여기서는 URL 존재 여부만 확인
                results["redis"] = {"status": "configured", "message": "Redis URL set"}
        except Exception as e:
            results["redis"] = {"status": "error", "message": str(e)}
    else:
        results["redis"] = {"status": "not_configured", "message": "Redis URL not set"}
    
    return results


@router.get("/", response_model=HealthResponse)
async def health_check():
    """
    기본 헬스체크
    """
    return {"status": "ok"}


@router.get("/detailed", response_model=HealthDetailResponse)
async def detailed_health_check(
    db: AsyncSession = Depends(get_db),
):
    """
    상세 헬스체크
    DB 연결 및 외부 API 상태 확인
    """
    try:
        # 데이터베이스 확인
        db_status = await check_database(db)
        
        # 외부 API 확인
        external_apis = await check_external_apis()
        
        # 전체 상태 결정
        overall_status = "healthy"
        if db_status["status"] != "healthy":
            overall_status = "unhealthy"
        
        return HealthDetailResponse(
            status=overall_status,
            database=db_status,
            external_apis=external_apis,
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Health check failed: {str(e)}"
        )
