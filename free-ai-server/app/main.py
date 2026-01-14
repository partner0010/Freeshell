"""
FastAPI 메인 애플리케이션
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import generate, health
from app.services.ollama_client import ollama_client
import logging

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="Free AI API Server",
    description="완전 무료 오픈소스 기반 AI API 서버",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인만 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(generate.router)
app.include_router(health.router)


@app.on_event("startup")
async def startup_event():
    """서버 시작 시 실행"""
    logger.info("Free AI API Server 시작 중...")
    
    # Ollama 연결 확인
    connected = await ollama_client.check_connection()
    if connected:
        models = await ollama_client.get_available_models()
        logger.info(f"Ollama 연결 성공. 사용 가능한 모델: {len(models)}개")
        if models:
            logger.info(f"모델 목록: {', '.join(models[:5])}{'...' if len(models) > 5 else ''}")
    else:
        logger.warning("Ollama 서버에 연결할 수 없습니다. Ollama가 실행 중인지 확인하세요.")


@app.on_event("shutdown")
async def shutdown_event():
    """서버 종료 시 실행"""
    logger.info("Free AI API Server 종료 중...")
    await ollama_client.close()


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Free AI API Server",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    from app.config import settings
    
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    )
