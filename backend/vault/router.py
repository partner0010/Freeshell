"""
Vault 모듈 - API 라우터
개인 AI Vault API
"""
from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List

from datetime import datetime
from backend.core import get_db, get_current_user
from backend.database.models import User
from backend.utils.logger import get_logger
from .service import VaultService
from .schemas import (
    VaultCreate,
    VaultUpdate,
    VaultResponse,
    VaultListResponse,
    MemoryItemCreate,
    MemoryItemResponse,
    VaultAIRequest,
    VaultAIResponse,
    VaultConsentUpdate,
    VaultStats,
)

router = APIRouter(prefix="/api/v1/vault", tags=["vault"])
vault_service = VaultService()
logger = get_logger(__name__)


# ========== Vault Endpoints ==========

@router.post("", response_model=VaultResponse, status_code=status.HTTP_201_CREATED)
async def create_vault(
    vault_data: VaultCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Vault 생성 (기억 / 추모 / 기록)
    
    윤리·법적 안전 설계:
    - 생전 동의 여부 저장
    - AI 재현 ON/OFF
    - 완전 삭제 가능
    - 상업 사용 불가 (기본)
    """
    result = await vault_service.create_vault(db, user.id, vault_data)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to create vault")
        )
    
    vault = result["vault"]
    return VaultResponse(
        vault_id=vault["vault_id"],
        owner=vault["owner"],
        name=vault.get("name"),
        purpose=vault.get("purpose", "archive"),
        memories=[],  # 초기에는 빈 리스트
        ai_enabled=vault.get("ai_enabled", False),
        commercial_use=vault.get("commercial_use", False),
        family_shared=vault.get("family_shared", False),
        consent_verified=vault.get("consent_verified", False),
        created_at=datetime.fromisoformat(vault["created_at"]),
        updated_at=datetime.fromisoformat(vault["updated_at"])
    )


@router.get("", response_model=VaultListResponse)
async def list_vaults(
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(20, ge=1, le=100, description="페이지 크기"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Vault 목록 조회"""
    result = await vault_service.list_vaults(db, user.id, page, page_size)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to list vaults")
        )
    
    # 응답 변환
    vaults = []
    for v in result["vaults"]:
        memories = [MemoryItemResponse(**m) for m in v.get("memories", [])]
        vaults.append(VaultResponse(
            vault_id=v["vault_id"],
            owner=v["owner"],
            name=v.get("name"),
            purpose=v.get("purpose", "archive"),
            memories=memories,
            ai_enabled=v.get("ai_enabled", False),
            commercial_use=v.get("commercial_use", False),
            family_shared=v.get("family_shared", False),
            consent_verified=v.get("consent_verified", False),
            created_at=datetime.fromisoformat(v["created_at"]),
            updated_at=datetime.fromisoformat(v["updated_at"])
        ))
    
    return VaultListResponse(
        vaults=vaults,
        total=result["total"],
        page=result["page"],
        page_size=result["page_size"]
    )


@router.get("/{vault_id}", response_model=VaultResponse)
async def get_vault(
    vault_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Vault 조회"""
    vault = await vault_service.get_vault(db, vault_id, user.id)
    
    if not vault:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vault not found"
        )
    
    # 응답 변환
    memories = [MemoryItemResponse(**m) for m in vault.get("memories", [])]
    return VaultResponse(
        vault_id=vault["vault_id"],
        owner=vault["owner"],
        name=vault.get("name"),
        purpose=vault.get("purpose", "archive"),
        memories=memories,
        ai_enabled=vault.get("ai_enabled", False),
        commercial_use=vault.get("commercial_use", False),
        family_shared=vault.get("family_shared", False),
        consent_verified=vault.get("consent_verified", False),
        created_at=datetime.fromisoformat(vault["created_at"]),
        updated_at=datetime.fromisoformat(vault["updated_at"])
    )


@router.put("/{vault_id}", response_model=VaultResponse)
async def update_vault(
    vault_id: str,
    vault_data: VaultUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Vault 수정"""
    result = await vault_service.update_vault(db, vault_id, user.id, vault_data)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to update vault")
        )
    
    vault = result["vault"]
    memories = [MemoryItemResponse(**m) for m in vault.get("memories", [])]
    return VaultResponse(
        vault_id=vault["vault_id"],
        owner=vault["owner"],
        name=vault.get("name"),
        purpose=vault.get("purpose", "archive"),
        memories=memories,
        ai_enabled=vault.get("ai_enabled", False),
        commercial_use=vault.get("commercial_use", False),
        family_shared=vault.get("family_shared", False),
        consent_verified=vault.get("consent_verified", False),
        created_at=datetime.fromisoformat(vault["created_at"]),
        updated_at=datetime.fromisoformat(vault["updated_at"])
    )


@router.delete("/{vault_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vault(
    vault_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Vault 완전 삭제
    
    윤리·법적 요구사항:
    - 모든 데이터 완전 삭제
    - 복구 불가능
    - 동의 정보도 함께 삭제
    """
    result = await vault_service.delete_vault(db, vault_id, user.id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to delete vault")
        )


# ========== Memory Endpoints ==========

@router.post("/{vault_id}/memories", response_model=MemoryItemResponse, status_code=status.HTTP_201_CREATED)
async def add_memory(
    vault_id: str,
    memory_data: MemoryItemCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    메모리 추가 (사진·음성·글·영상)
    
    윤리·법적 요구사항:
    - 생전 동의 여부 필수
    - 파일 암호화 저장
    """
    result = await vault_service.add_memory(db, vault_id, user.id, memory_data)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to add memory")
        )
    
    memory = result["memory"]
    return MemoryItemResponse(
        id=memory["id"],
        type=memory["type"],
        file=memory["file"],
        consent=memory["consent"],
        description=memory.get("description"),
        metadata=memory.get("metadata", {}),
        created_at=datetime.fromisoformat(memory["created_at"])
    )


# ========== Vault AI Endpoints ==========

@router.post("/{vault_id}/ai", response_model=VaultAIResponse)
async def generate_vault_ai_response(
    vault_id: str,
    ai_request: VaultAIRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Vault AI 응답 생성 (그 사람의 방식으로)
    
    윤리·법적 요구사항:
    - AI 재현 활성화 필수
    - 동의 검증 완료 필수
    - 상업 사용 불가 (기본)
    """
    result = await vault_service.generate_ai_response(
        db=db,
        vault_id=vault_id,
        user_id=user.id,
        prompt=ai_request.prompt,
        context=ai_request.context
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to generate AI response")
        )
    
    return VaultAIResponse(
        vault_id=vault_id,
        response=result["response"],
        method=result["method"],
        consent_verified=result["consent_verified"]
    )


# ========== Consent Endpoints ==========

@router.put("/{vault_id}/consent", response_model=VaultResponse)
async def update_vault_consent(
    vault_id: str,
    consent_data: VaultConsentUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Vault 동의 정보 업데이트
    
    윤리·법적 요구사항:
    - 생전 동의 증명 필수
    - 동의 날짜 기록
    - 동의 철회 가능
    """
    result = await vault_service.update_consent(db, vault_id, user.id, consent_data)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to update consent")
        )
    
    vault = result["vault"]
    memories = [MemoryItemResponse(**m) for m in vault.get("memories", [])]
    return VaultResponse(
        vault_id=vault["vault_id"],
        owner=vault["owner"],
        name=vault.get("name"),
        purpose=vault.get("purpose", "archive"),
        memories=memories,
        ai_enabled=vault.get("ai_enabled", False),
        commercial_use=vault.get("commercial_use", False),
        family_shared=vault.get("family_shared", False),
        consent_verified=vault.get("consent_verified", False),
        created_at=datetime.fromisoformat(vault["created_at"]),
        updated_at=datetime.fromisoformat(vault["updated_at"])
    )


# ========== Stats Endpoints ==========

@router.get("/{vault_id}/stats", response_model=VaultStats)
async def get_vault_stats(
    vault_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Vault 통계 조회"""
    result = await vault_service.get_vault_stats(db, vault_id, user.id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to get vault stats")
        )
    
    stats = result.get("stats", {})
    return VaultStats(
        total_memories=stats.get("total_memories", 0),
        memory_count_by_type=stats.get("memory_count_by_type", {}),
        ai_enabled=stats.get("ai_enabled", False),
        consent_verified=stats.get("consent_verified", False)
    )
