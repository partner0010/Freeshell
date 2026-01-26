"""
플랜 및 구독 API 엔드포인트
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime

from ....schemas.plan import PlanResponse, SubscriptionResponse
from ....services.plan_service import PlanService
from ....database.connection import get_db
from ....database.models import Plan, Subscription
from ....utils.logger import get_logger
from ....api.auth_routes import get_current_user
from ....database.models import User

logger = get_logger(__name__)

router = APIRouter()
plan_service = PlanService()


@router.get("/", response_model=List[PlanResponse])
async def get_plans(db: AsyncSession = Depends(get_db)):
    """
    모든 플랜 조회
    """
    try:
        plans = await plan_service.get_all_plans(db)
        return [
            PlanResponse(
                id=plan.id,
                name=plan.name,
                type=plan.type,
                price=plan.price,
                currency=plan.currency,
                video_limit=plan.video_limit,
                max_resolution=plan.max_resolution,
                watermark=plan.watermark,
                priority_processing=plan.priority_processing,
                api_access=plan.api_access,
                dedicated_support=plan.dedicated_support,
                features=plan.features or {},
            )
            for plan in plans
        ]
    except Exception as e:
        logger.error(f"Failed to get plans: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch plans"
        )


@router.get("/current", response_model=PlanResponse)
async def get_current_plan(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    현재 사용자 플랜 조회
    """
    try:
        plan = await plan_service.get_user_plan(db, current_user.id)
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plan not found"
            )

        return PlanResponse(
            id=plan.id,
            name=plan.name,
            type=plan.type,
            price=plan.price,
            currency=plan.currency,
            video_limit=plan.video_limit,
            max_resolution=plan.max_resolution,
            watermark=plan.watermark,
            priority_processing=plan.priority_processing,
            api_access=plan.api_access,
            dedicated_support=plan.dedicated_support,
            features=plan.features or {},
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get current plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch current plan"
        )


@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    현재 구독 조회
    """
    try:
        subscription = await plan_service.get_user_subscription(db, current_user.id)
        if not subscription:
            # Free 플랜 반환
            plan = await plan_service.get_plan_by_type(db, "free")
            if not plan:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Plan not found"
                )
            return SubscriptionResponse(
                id="",
                user_id=current_user.id,
                plan_id=plan.id,
                plan=PlanResponse(
                    id=plan.id,
                    name=plan.name,
                    type=plan.type,
                    price=plan.price,
                    currency=plan.currency,
                    video_limit=plan.video_limit,
                    max_resolution=plan.max_resolution,
                    watermark=plan.watermark,
                    priority_processing=plan.priority_processing,
                    api_access=plan.api_access,
                    dedicated_support=plan.dedicated_support,
                    features=plan.features or {},
                ),
                status="active",
                started_at=datetime.utcnow(),
                expires_at=None,
                created_at=datetime.utcnow(),
            )

        return SubscriptionResponse(
            id=subscription.id,
            user_id=subscription.user_id,
            plan_id=subscription.plan_id,
            plan=PlanResponse(
                id=subscription.plan.id,
                name=subscription.plan.name,
                type=subscription.plan.type,
                price=subscription.plan.price,
                currency=subscription.plan.currency,
                video_limit=subscription.plan.video_limit,
                max_resolution=subscription.plan.max_resolution,
                watermark=subscription.plan.watermark,
                priority_processing=subscription.plan.priority_processing,
                api_access=subscription.plan.api_access,
                dedicated_support=subscription.plan.dedicated_support,
                features=subscription.plan.features or {},
            ),
            status=subscription.status,
            started_at=subscription.started_at,
            expires_at=subscription.expires_at,
            created_at=subscription.created_at,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch subscription"
        )


@router.post("/subscribe", response_model=SubscriptionResponse)
async def subscribe_plan(
    plan_id: str,
    duration_days: int = 30,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    플랜 구독
    """
    try:
        result = await plan_service.subscribe_plan(
            db, current_user.id, plan_id, duration_days
        )

        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to subscribe")
            )

        subscription = await plan_service.get_user_subscription(db, current_user.id)
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Subscription created but not found"
            )

        return SubscriptionResponse(
            id=subscription.id,
            user_id=subscription.user_id,
            plan_id=subscription.plan_id,
            plan=PlanResponse(
                id=subscription.plan.id,
                name=subscription.plan.name,
                type=subscription.plan.type,
                price=subscription.plan.price,
                currency=subscription.plan.currency,
                video_limit=subscription.plan.video_limit,
                max_resolution=subscription.plan.max_resolution,
                watermark=subscription.plan.watermark,
                priority_processing=subscription.plan.priority_processing,
                api_access=subscription.plan.api_access,
                dedicated_support=subscription.plan.dedicated_support,
                features=subscription.plan.features or {},
            ),
            status=subscription.status,
            started_at=subscription.started_at,
            expires_at=subscription.expires_at,
            created_at=subscription.created_at,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to subscribe plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to subscribe plan"
        )


@router.post("/cancel", response_model=dict)
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    구독 취소
    """
    try:
        result = await plan_service.cancel_subscription(db, current_user.id)

        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to cancel subscription")
            )

        return {"success": True, "message": "Subscription cancelled"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cancel subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel subscription"
        )


@router.get("/video-limit")
async def get_video_limit(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    비디오 생성 제한 확인
    """
    try:
        limit_check = await plan_service.check_video_limit(db, current_user.id)
        return limit_check
    except Exception as e:
        logger.error(f"Failed to check video limit: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check video limit"
        )
