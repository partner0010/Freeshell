from fastapi import APIRouter

from .endpoints import health, prompts, content, plans, payments, costs

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(prompts.router, prefix="/prompts", tags=["prompts"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
api_router.include_router(plans.router, prefix="/plans", tags=["plans"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(costs.router, prefix="/costs", tags=["costs"])