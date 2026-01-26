"""
Vault 모듈 - 서비스
개인 AI Vault 비즈니스 로직
"""
from typing import Dict, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import os
import json

from backend.utils.logger import get_logger
from backend.utils.id_generator import generate_id
from .schemas import VaultCreate, VaultUpdate, MemoryItemCreate
from .ai_generator import vault_response
from .encryption import VaultManager

logger = get_logger(__name__)


class VaultService:
    """Vault 서비스"""
    
    def __init__(self):
        self.storage_dir = os.getenv("VAULT_STORAGE_DIR", "storage/vault")
        os.makedirs(self.storage_dir, exist_ok=True)
        self.vault_manager = VaultManager(self.storage_dir)
    
    async def create_vault(
        self,
        db: AsyncSession,
        user_id: str,
        vault_data: VaultCreate
    ) -> Dict[str, Any]:
        """Vault 생성"""
        try:
            vault_id = generate_id()
            vault_path = os.path.join(self.storage_dir, user_id, vault_id)
            os.makedirs(vault_path, exist_ok=True)
            
            vault_info = {
                "vault_id": vault_id,
                "owner": user_id,
                "name": vault_data.name,
                "purpose": vault_data.purpose or "archive",
                "memories": [],
                "ai_enabled": vault_data.ai_enabled or False,
                "commercial_use": vault_data.commercial_use or False,
                "family_shared": vault_data.family_shared or False,
                "consent_verified": vault_data.consent_verified or False,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Vault 정보 저장
            vault_file = os.path.join(vault_path, "vault.json")
            with open(vault_file, 'w', encoding='utf-8') as f:
                json.dump(vault_info, f, ensure_ascii=False, indent=2)
            
            return {"success": True, "vault": vault_info}
        except Exception as e:
            logger.error(f"Failed to create vault: {e}")
            return {"success": False, "error": str(e)}
    
    async def list_vaults(
        self,
        db: AsyncSession,
        user_id: str,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """Vault 목록 조회"""
        try:
            user_vault_dir = os.path.join(self.storage_dir, user_id)
            if not os.path.exists(user_vault_dir):
                return {
                    "success": True,
                    "vaults": [],
                    "total": 0,
                    "page": page,
                    "page_size": page_size
                }
            
            vaults = []
            for vault_id in os.listdir(user_vault_dir):
                vault_path = os.path.join(user_vault_dir, vault_id)
                if os.path.isdir(vault_path):
                    vault_file = os.path.join(vault_path, "vault.json")
                    if os.path.exists(vault_file):
                        with open(vault_file, 'r', encoding='utf-8') as f:
                            vault_info = json.load(f)
                            vaults.append(vault_info)
            
            # 페이지네이션
            total = len(vaults)
            start = (page - 1) * page_size
            end = start + page_size
            paginated_vaults = vaults[start:end]
            
            return {
                "success": True,
                "vaults": paginated_vaults,
                "total": total,
                "page": page,
                "page_size": page_size
            }
        except Exception as e:
            logger.error(f"Failed to list vaults: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_vault(
        self,
        db: AsyncSession,
        vault_id: str,
        user_id: str
    ) -> Optional[Dict[str, Any]]:
        """Vault 조회"""
        try:
            vault_path = os.path.join(self.storage_dir, user_id, vault_id)
            vault_file = os.path.join(vault_path, "vault.json")
            
            if not os.path.exists(vault_file):
                return None
            
            with open(vault_file, 'r', encoding='utf-8') as f:
                vault_info = json.load(f)
            
            return vault_info
        except Exception as e:
            logger.error(f"Failed to get vault: {e}")
            return None
    
    async def update_vault(
        self,
        db: AsyncSession,
        vault_id: str,
        user_id: str,
        vault_data: VaultUpdate
    ) -> Dict[str, Any]:
        """Vault 업데이트"""
        try:
            vault = await self.get_vault(db, vault_id, user_id)
            if not vault:
                return {"success": False, "error": "Vault not found"}
            
            # 업데이트
            if vault_data.name is not None:
                vault["name"] = vault_data.name
            if vault_data.purpose is not None:
                vault["purpose"] = vault_data.purpose
            if vault_data.ai_enabled is not None:
                vault["ai_enabled"] = vault_data.ai_enabled
            if vault_data.commercial_use is not None:
                vault["commercial_use"] = vault_data.commercial_use
            if vault_data.family_shared is not None:
                vault["family_shared"] = vault_data.family_shared
            
            vault["updated_at"] = datetime.utcnow().isoformat()
            
            # 저장
            vault_path = os.path.join(self.storage_dir, user_id, vault_id)
            vault_file = os.path.join(vault_path, "vault.json")
            with open(vault_file, 'w', encoding='utf-8') as f:
                json.dump(vault, f, ensure_ascii=False, indent=2)
            
            return {"success": True, "vault": vault}
        except Exception as e:
            logger.error(f"Failed to update vault: {e}")
            return {"success": False, "error": str(e)}
    
    async def delete_vault(
        self,
        db: AsyncSession,
        vault_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """Vault 삭제"""
        try:
            vault_path = os.path.join(self.storage_dir, user_id, vault_id)
            if os.path.exists(vault_path):
                import shutil
                shutil.rmtree(vault_path)
                return {"success": True}
            return {"success": False, "error": "Vault not found"}
        except Exception as e:
            logger.error(f"Failed to delete vault: {e}")
            return {"success": False, "error": str(e)}
    
    async def add_memory(
        self,
        db: AsyncSession,
        vault_id: str,
        user_id: str,
        memory_data: MemoryItemCreate
    ) -> Dict[str, Any]:
        """메모리 추가"""
        try:
            vault = await self.get_vault(db, vault_id, user_id)
            if not vault:
                return {"success": False, "error": "Vault not found"}
            
            memory_id = generate_id()
            memory = {
                "id": memory_id,
                "type": memory_data.type,
                "file": memory_data.file,
                "consent": memory_data.consent,
                "description": memory_data.description,
                "metadata": memory_data.metadata or {},
                "created_at": datetime.utcnow().isoformat()
            }
            
            vault["memories"].append(memory)
            vault["updated_at"] = datetime.utcnow().isoformat()
            
            # 저장
            vault_path = os.path.join(self.storage_dir, user_id, vault_id)
            vault_file = os.path.join(vault_path, "vault.json")
            with open(vault_file, 'w', encoding='utf-8') as f:
                json.dump(vault, f, ensure_ascii=False, indent=2)
            
            return {"success": True, "memory": memory}
        except Exception as e:
            logger.error(f"Failed to add memory: {e}")
            return {"success": False, "error": str(e)}
    
    async def generate_ai_response(
        self,
        db: AsyncSession,
        vault_id: str,
        user_id: str,
        prompt: str,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """AI 응답 생성 (그 사람의 방식으로)"""
        try:
            # Vault 조회
            vault = await self.get_vault(db, vault_id, user_id)
            if not vault:
                return {"success": False, "error": "Vault not found"}
            
            # AI 재현 활성화 확인
            if not vault.get("ai_enabled", False):
                return {"success": False, "error": "AI 재현이 비활성화되어 있습니다"}
            
            # 동의 검증 확인
            if not vault.get("consent_verified", False):
                return {"success": False, "error": "동의 검증이 완료되지 않았습니다"}
            
            # 메모리 데이터 가져오기
            memory_data = vault.get("memories", [])
            
            # AI 응답 생성 (vault_response 호출)
            response = await vault_response(
                prompt=prompt,
                memory_data=memory_data,
                context=context
            )
            
            return {
                "success": True,
                "response": response,
                "method": "ai_analysis",  # AI 분석 서비스 사용
                "consent_verified": vault.get("consent_verified", False)
            }
        except Exception as e:
            logger.error(f"Failed to generate AI response: {e}")
            return {"success": False, "error": str(e)}
    
    async def update_consent(
        self,
        db: AsyncSession,
        vault_id: str,
        user_id: str,
        consent_data: Any  # VaultConsentUpdate
    ) -> Dict[str, Any]:
        """동의 정보 업데이트"""
        try:
            vault = await self.get_vault(db, vault_id, user_id)
            if not vault:
                return {"success": False, "error": "Vault not found"}
            
            # Pydantic 모델인 경우 dict로 변환
            if hasattr(consent_data, 'model_dump'):
                consent_dict = consent_data.model_dump(exclude_unset=True)
            elif isinstance(consent_data, dict):
                consent_dict = consent_data
            else:
                consent_dict = {}
            
            if "consent_verified" in consent_dict:
                vault["consent_verified"] = consent_dict["consent_verified"]
            if "commercial_use" in consent_dict:
                vault["commercial_use"] = consent_dict["commercial_use"]
            
            vault["updated_at"] = datetime.utcnow().isoformat()
            
            # 저장
            vault_path = os.path.join(self.storage_dir, user_id, vault_id)
            vault_file = os.path.join(vault_path, "vault.json")
            with open(vault_file, 'w', encoding='utf-8') as f:
                json.dump(vault, f, ensure_ascii=False, indent=2)
            
            return {"success": True, "vault": vault}
        except Exception as e:
            logger.error(f"Failed to update consent: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_vault_stats(
        self,
        db: AsyncSession,
        vault_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """Vault 통계 조회"""
        try:
            vault = await self.get_vault(db, vault_id, user_id)
            if not vault:
                return {"success": False, "error": "Vault not found"}
            
            memories = vault.get("memories", [])
            memory_count_by_type = {}
            for memory in memories:
                memory_type = memory.get("type", "unknown")
                memory_count_by_type[memory_type] = memory_count_by_type.get(memory_type, 0) + 1
            
            return {
                "success": True,
                "stats": {
                    "total_memories": len(memories),
                    "memory_count_by_type": memory_count_by_type,
                    "ai_enabled": vault.get("ai_enabled", False),
                    "consent_verified": vault.get("consent_verified", False)
                }
            }
        except Exception as e:
            logger.error(f"Failed to get vault stats: {e}")
            return {"success": False, "error": str(e)}
