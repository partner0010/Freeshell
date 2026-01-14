"""
FastAPI 메인 서버 (통합 플랫폼)
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import router as main_router
from .api.integrated_routes import router as integrated_router
from .api.auth_routes import router as auth_router
from .api.admin_routes import router as admin_router
from .api.sns_routes import router as sns_router
from .api.analytics_routes import router as analytics_router
from .api.recommendation_routes import router as recommendation_router
from .api.notification_routes import router as notification_router
from .api.search_routes import router as search_router
from .api.moderation_routes import router as moderation_router
from .api.social_routes import router as social_router
from .api.monetization_routes import router as monetization_router
from .api.spatial_routes import router as spatial_router
from .api.websocket_routes import router as websocket_router
from .api.performance_routes import router as performance_router
from .middleware.security_middleware import SecurityHeadersMiddleware
from .database.connection import init_db
from .utils.logger import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    # 시작 시
    logger.info("Initializing database...")
    try:
        await init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
    logger.info("Application started")
    yield
    # 종료 시
    logger.info("Application shutdown")


app = FastAPI(
    title="AI Content Platform",
    description="차세대 종합 콘텐츠 플랫폼 - AI Orchestrator 기반",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS 설정 (보안 강화)
allowed_origins = os.getenv('ALLOWED_ORIGINS', '*').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# 보안 헤더 미들웨어
app.add_middleware(SecurityHeadersMiddleware)

# Rate Limiting 미들웨어
from .middleware.rate_limit_middleware import RateLimitMiddleware
app.add_middleware(RateLimitMiddleware, requests_per_minute=60)

# 라우터 등록
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(main_router, prefix="/api", tags=["api"])
app.include_router(integrated_router, prefix="/api/shortform", tags=["shortform"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
app.include_router(sns_router, prefix="/api/sns", tags=["sns"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["analytics"])
app.include_router(recommendation_router, prefix="/api/recommendation", tags=["recommendation"])
app.include_router(notification_router, prefix="/api/notifications", tags=["notifications"])
app.include_router(search_router, prefix="/api/search", tags=["search"])
app.include_router(moderation_router, prefix="/api/moderation", tags=["moderation"])
app.include_router(social_router, prefix="/api/social", tags=["social"])
app.include_router(monetization_router, prefix="/api/monetization", tags=["monetization"])
app.include_router(spatial_router, prefix="/api/spatial", tags=["spatial"])
app.include_router(websocket_router, prefix="/api/ws", tags=["websocket"])
app.include_router(performance_router, prefix="/api/performance", tags=["performance"])


@app.get("/")
def root():
    """루트 엔드포인트"""
    return {
        "service": "AI Content Platform",
        "version": "1.0.0",
        "status": "running"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
