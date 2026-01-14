"""
관리자 API 라우트
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Header
from typing import Optional
from functools import wraps

from ..services.admin_service import AdminService
from ..services.user_service import UserService
from ..utils.security import SecurityManager
from ..utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()
admin_service = AdminService()
user_service = UserService()
security_manager = SecurityManager()


def get_current_user(token: str):
    """현재 사용자 조회 (간단한 구현)"""
    payload = security_manager.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload


def require_admin_role(current_user: dict = Depends(get_current_user)):
    """관리자 권한 확인"""
    user_id = current_user.get('sub')
    if not user_service.is_admin(user_id):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# ========== 대시보드 ==========

@router.get("/dashboard")
def get_dashboard(current_user: dict = Depends(require_admin_role)):
    """플랫폼 대시보드"""
    try:
        result = admin_service.get_platform_dashboard()
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=500, detail=result.get('error'))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Dashboard error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== 사용자 관리 ==========

@router.get("/users")
def get_all_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_admin_role)
):
    """모든 사용자 조회"""
    try:
        result = admin_service.get_all_users(page, page_size)
        return result
    except Exception as e:
        logger.error(f"Get users error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: str,
    role: str,
    current_user: dict = Depends(require_admin_role)
):
    """사용자 역할 변경"""
    try:
        result = admin_service.update_user_role(user_id, role)
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=400, detail=result.get('error'))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update user role error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: str,
    current_user: dict = Depends(require_admin_role)
):
    """사용자 비활성화"""
    try:
        result = admin_service.deactivate_user(user_id)
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=400, detail=result.get('error'))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Deactivate user error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== 모니터링 ==========

@router.get("/monitoring/system")
def get_system_status(current_user: dict = Depends(require_admin_role)):
    """시스템 상태"""
    try:
        result = admin_service.monitoring_service.get_system_status()
        return result
    except Exception as e:
        logger.error(f"System status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/monitoring/ai-connections")
def get_ai_connections(current_user: dict = Depends(require_admin_role)):
    """AI 연결 상태"""
    try:
        result = admin_service.monitoring_service.check_ai_connections()
        return result
    except Exception as e:
        logger.error(f"AI connections error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/monitoring/vulnerabilities")
def get_vulnerabilities(current_user: dict = Depends(require_admin_role)):
    """취약점 확인"""
    try:
        result = admin_service.monitoring_service.check_vulnerabilities()
        return result
    except Exception as e:
        logger.error(f"Vulnerabilities error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/monitoring/malware")
def get_malware_check(current_user: dict = Depends(require_admin_role)):
    """악성 코드 탐지"""
    try:
        result = admin_service.monitoring_service.check_malware()
        return result
    except Exception as e:
        logger.error(f"Malware check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/monitoring/service-health")
def get_service_health(current_user: dict = Depends(require_admin_role)):
    """서비스 헬스 체크"""
    try:
        result = admin_service.monitoring_service.get_service_health()
        return result
    except Exception as e:
        logger.error(f"Service health error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== 활동 관리 ==========

@router.get("/activities")
def get_recent_activities(
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(require_admin_role)
):
    """최근 활동 조회"""
    try:
        result = admin_service.get_recent_activities(limit)
        return result
    except Exception as e:
        logger.error(f"Get activities error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== 저장소 관리 ==========

@router.post("/storage/clear")
def clear_storage(
    storage_type: str,
    current_user: dict = Depends(require_admin_role)
):
    """저장소 정리"""
    try:
        result = admin_service.clear_storage(storage_type)
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=400, detail=result.get('error'))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Clear storage error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== 통계 ==========

@router.get("/stats")
def get_platform_stats(current_user: dict = Depends(require_admin_role)):
    """플랫폼 통계"""
    try:
        result = admin_service.monitoring_service.get_platform_stats()
        return result
    except Exception as e:
        logger.error(f"Platform stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
