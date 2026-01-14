"""
헬스체크 라우터
"""
from fastapi import APIRouter
from app.models.response import HealthResponse
from app.services.ollama_client import ollama_client
import time
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["health"])

# 서버 시작 시간
server_start_time = time.time()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    서버 헬스체크
    
    - Ollama 연결 상태 확인
    - 사용 가능한 모델 목록 조회
    - 서버 가동 시간 확인
    """
    try:
        # Ollama 연결 확인
        ollama_connected = await ollama_client.check_connection()
        
        # 사용 가능한 모델 목록
        available_models = []
        if ollama_connected:
            available_models = await ollama_client.get_available_models()
        
        # 서버 가동 시간
        uptime = time.time() - server_start_time
        
        return HealthResponse(
            status="healthy" if ollama_connected else "degraded",
            ollama_connected=ollama_connected,
            available_models=available_models,
            server_uptime=uptime
        )
    except Exception as e:
        logger.error(f"헬스체크 오류: {e}")
        return HealthResponse(
            status="unhealthy",
            ollama_connected=False,
            available_models=[],
            server_uptime=time.time() - server_start_time
        )
