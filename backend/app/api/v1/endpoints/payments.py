"""
결제 API 엔드포인트
"""

from fastapi import APIRouter, HTTPException, Depends, status, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import stripe

from ....schemas.payment import CheckoutRequest, CheckoutResponse, InvoiceResponse
from ....services.payment_service import PaymentService
from ....database.connection import get_db
from ....utils.logger import get_logger
from ....api.auth_routes import get_current_user
from ....database.models import User

logger = get_logger(__name__)

router = APIRouter()
payment_service = PaymentService()


@router.post("/create-checkout", response_model=CheckoutResponse)
async def create_checkout(
    request: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Stripe Checkout 세션 생성
    
    결제 페이지로 리다이렉트할 URL을 반환합니다.
    """
    try:
        result = await payment_service.create_checkout_session(
            db,
            current_user.id,
            request.plan_id,
            request.success_url,
            request.cancel_url,
        )

        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to create checkout session")
            )

        return CheckoutResponse(
            session_id=result["session_id"],
            url=result["url"],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create checkout: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create checkout session"
        )


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    stripe_signature: Optional[str] = Header(None, alias="stripe-signature"),
):
    """
    Stripe Webhook 처리
    
    Stripe에서 결제 이벤트를 받아 처리합니다.
    """
    try:
        if not stripe_signature:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing stripe-signature header"
            )

        payload = await request.body()

        result = await payment_service.handle_webhook(db, payload, stripe_signature)

        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Webhook processing failed")
            )

        return {"success": True, "event_type": result.get("event_type")}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook processing failed"
        )


@router.get("/invoices", response_model=List[InvoiceResponse])
async def get_invoices(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    사용자 인보이스 조회
    
    Args:
        limit: 조회할 인보이스 개수 (기본값: 10)
        
    Returns:
        인보이스 목록
    """
    try:
        invoices = await payment_service.get_invoices(db, current_user.id, limit)

        return [
            InvoiceResponse(
                id=invoice["id"],
                amount_paid=invoice["amount_paid"],
                currency=invoice["currency"],
                status=invoice["status"],
                created=invoice["created"],
                invoice_pdf=invoice.get("invoice_pdf"),
                hosted_invoice_url=invoice.get("hosted_invoice_url"),
            )
            for invoice in invoices
        ]

    except Exception as e:
        logger.error(f"Failed to get invoices: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch invoices"
        )


@router.post("/cancel-subscription")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    구독 취소 (Stripe 연동)
    """
    try:
        result = await payment_service.cancel_subscription_stripe(db, current_user.id)

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
