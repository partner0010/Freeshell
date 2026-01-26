"""
Vault 모듈 - Pydantic 스키마
개인 AI Vault 데이터 구조
"""
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime


# ========== Vault Schemas ==========

class VaultCreate(BaseModel):
    """Vault 생성 요청"""
    name: Optional[str] = Field(None, max_length=100, description="Vault 이름")
    purpose: Optional[str] = Field("archive", description="목적 (archive, memorial, healing)")
    ai_enabled: Optional[bool] = Field(False, description="AI 재현 활성화")
    commercial_use: Optional[bool] = Field(False, description="상업 사용 허용")
    family_shared: Optional[bool] = Field(False, description="가족 공유")
    consent_verified: Optional[bool] = Field(False, description="동의 검증 완료")


class VaultUpdate(BaseModel):
    """Vault 수정 요청"""
    name: Optional[str] = Field(None, max_length=100, description="Vault 이름")
    purpose: Optional[str] = Field(None, description="목적")
    ai_enabled: Optional[bool] = Field(None, description="AI 재현 활성화")
    commercial_use: Optional[bool] = Field(None, description="상업 사용 허용")
    family_shared: Optional[bool] = Field(None, description="가족 공유")


class MemoryItemCreate(BaseModel):
    """메모리 아이템 생성 요청"""
    type: str = Field(..., description="타입 (voice, text, photo, video)")
    file: str = Field(..., description="파일 경로")
    consent: bool = Field(..., description="생전 동의 여부")
    description: Optional[str] = Field(None, description="설명")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="메타데이터")


class MemoryItemResponse(BaseModel):
    """메모리 아이템 응답"""
    id: str
    type: str
    file: str
    consent: bool
    description: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime


class VaultResponse(BaseModel):
    """Vault 응답"""
    vault_id: str
    owner: str
    name: Optional[str] = None
    purpose: str = "archive"
    memories: List[MemoryItemResponse] = Field(default_factory=list)
    ai_enabled: bool = False
    commercial_use: bool = False
    family_shared: bool = False
    consent_verified: bool = False
    created_at: datetime
    updated_at: datetime


class VaultListResponse(BaseModel):
    """Vault 목록 응답"""
    vaults: List[VaultResponse]
    total: int
    page: int
    page_size: int


# ========== AI Schemas ==========

class VaultAIRequest(BaseModel):
    """Vault AI 요청"""
    prompt: str = Field(..., min_length=1, description="프롬프트")
    context: Optional[str] = Field(None, description="추가 컨텍스트")


class VaultAIResponse(BaseModel):
    """Vault AI 응답"""
    vault_id: str
    response: str
    method: str  # "ai_analysis", "memory_based", etc.
    consent_verified: bool


# ========== Consent Schemas ==========

class VaultConsentUpdate(BaseModel):
    """Vault 동의 정보 업데이트"""
    consent_verified: Optional[bool] = Field(None, description="동의 검증 완료")
    commercial_use: Optional[bool] = Field(None, description="상업 사용 허용")


# ========== Stats Schemas ==========

class VaultStats(BaseModel):
    """Vault 통계"""
    total_memories: int
    memory_count_by_type: Dict[str, int]
    ai_enabled: bool
    consent_verified: bool
