"""
비용 추적 API 엔드포인트
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from datetime import datetime, date

from ....schemas.cost import (
    CostRecordRequest,
    CostRecordResponse,
    MonthlyCostResponse,
    CostLimitCheckResponse,
    DailyCostResponse,
    AdminStatisticsResponse,
)
from ....services.cost_tracker import CostTracker
from ....database.connection import get_db
from ....utils.logger import get_logger
from ....api.auth_routes import get_current_user
from ....database.models import User

logger = get_logger(__name__)

router = APIRouter()
cost_tracker = CostTracker()


@router.post("/record", response_model=CostRecordResponse)
async def record_cost(
    request: CostRecordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    API 호출 비용 기록
    
    내부 서비스에서 사용하는 엔드포인트입니다.
    """
    try:
        result = await cost_tracker.record_cost(
            db,
            current_user.id,
            request.action,
            request.cost,
            request.metadata,
        )

        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to record cost")
            )

        return CostRecordResponse(
            success=True,
            log_id=result["log_id"],
            cost=result["cost"],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to record cost: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record cost"
        )


@router.get("/monthly", response_model=MonthlyCostResponse)
async def get_monthly_cost(
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    사용자별 월간 비용 조회
    """
    try:
        result = await cost_tracker.get_user_monthly_cost(
            db, current_user.id, year, month
        )

        return MonthlyCostResponse(
            total_cost=result["total_cost"],
            breakdown=result["breakdown"],
            period=result["period"],
            limit=result["limit"],
            remaining=result["remaining"],
            exceeded=result["exceeded"],
        )

    except Exception as e:
        logger.error(f"Failed to get monthly cost: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch monthly cost"
        )


@router.get("/check-limit", response_model=CostLimitCheckResponse)
async def check_cost_limit(
    estimated_cost: float = Query(..., ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    비용 한도 초과 확인
    """
    try:
        result = await cost_tracker.check_cost_limit(
            db, current_user.id, estimated_cost
        )

        return CostLimitCheckResponse(
            allowed=result["allowed"],
            current_cost=result["current_cost"],
            limit=result["limit"],
            remaining=result["remaining"],
            error=result.get("error"),
        )

    except Exception as e:
        logger.error(f"Failed to check cost limit: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check cost limit"
        )


@router.get("/admin/daily", response_model=List[DailyCostResponse])
async def get_daily_costs(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    limit: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    일일 비용 집계 조회 (관리자용)
    """
    try:
        # 관리자 권한 확인
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        costs = await cost_tracker.get_daily_costs(
            db, start_date, end_date, limit
        )

        return [
            DailyCostResponse(
                date=cost["date"],
                total_cost=cost["total_cost"],
                breakdown=cost["breakdown"],
                user_count=cost["user_count"],
            )
            for cost in costs
        ]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get daily costs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch daily costs"
        )


@router.get("/admin/statistics", response_model=AdminStatisticsResponse)
async def get_admin_statistics(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    관리자 대시보드용 통계
    """
    try:
        # 관리자 권한 확인
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        stats = await cost_tracker.get_admin_statistics(db, days)

        return AdminStatisticsResponse(
            total_cost=stats["total_cost"],
            daily_average=stats["daily_average"],
            top_users=stats["top_users"],
            top_actions=stats["top_actions"],
            cost_trend=[
                DailyCostResponse(
                    date=trend["date"],
                    total_cost=trend["total_cost"],
                    breakdown=trend["breakdown"],
                    user_count=trend["user_count"],
                )
                for trend in stats["cost_trend"]
            ],
            period=stats["period"],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get admin statistics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch admin statistics"
        )
