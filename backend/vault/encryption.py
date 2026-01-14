"""
AI Vault - 프라이버시 및 암호화
"""

from typing import Dict, Any, Optional
from datetime import datetime
import os
import json
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
import base64

from ..utils.logger import get_logger

logger = get_logger(__name__)


class VaultManager:
    """Vault 관리자 (로컬 암호화)"""
    
    def __init__(self, storage_dir: str = "storage/vault"):
        self.storage_dir = storage_dir
        os.makedirs(storage_dir, exist_ok=True)
        self.keys: Dict[str, bytes] = {}
    
    def _get_key(self, user_id: str, password: str) -> bytes:
        """사용자별 암호화 키 생성"""
        if user_id in self.keys:
            return self.keys[user_id]
        
        # PBKDF2로 키 생성
        kdf = PBKDF2(
            algorithm=hashes.SHA256(),
            length=32,
            salt=user_id.encode(),
            iterations=100000
        )
        
        key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
        self.keys[user_id] = key
        
        return key
    
    def store(
        self,
        user_id: str,
        password: str,
        data: Dict[str, Any],
        data_type: str = 'general'
    ) -> Dict[str, Any]:
        """
        데이터 저장 (암호화)
        
        Args:
            user_id: 사용자 ID
            password: 암호화 비밀번호
            data: 저장할 데이터
            data_type: 데이터 타입
        
        Returns:
            저장 결과
        """
        try:
            # 암호화
            key = self._get_key(user_id, password)
            fernet = Fernet(key)
            
            # 데이터 직렬화
            data_json = json.dumps(data, ensure_ascii=False)
            encrypted_data = fernet.encrypt(data_json.encode())
            
            # 저장
            vault_dir = os.path.join(self.storage_dir, user_id)
            os.makedirs(vault_dir, exist_ok=True)
            
            file_path = os.path.join(vault_dir, f"{data_type}.encrypted")
            with open(file_path, 'wb') as f:
                f.write(encrypted_data)
            
            logger.info(f"Data stored in vault: {data_type} for {user_id}")
            
            return {
                'success': True,
                'data_type': data_type
            }
            
        except Exception as e:
            logger.error(f"Failed to store data in vault: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def retrieve(
        self,
        user_id: str,
        password: str,
        data_type: str = 'general'
    ) -> Optional[Dict[str, Any]]:
        """
        데이터 조회 (복호화)
        
        Args:
            user_id: 사용자 ID
            password: 복호화 비밀번호
            data_type: 데이터 타입
        
        Returns:
            복호화된 데이터
        """
        try:
            file_path = os.path.join(self.storage_dir, user_id, f"{data_type}.encrypted")
            
            if not os.path.exists(file_path):
                return None
            
            # 복호화
            key = self._get_key(user_id, password)
            fernet = Fernet(key)
            
            with open(file_path, 'rb') as f:
                encrypted_data = f.read()
            
            decrypted_data = fernet.decrypt(encrypted_data)
            data = json.loads(decrypted_data.decode())
            
            return data
            
        except Exception as e:
            logger.error(f"Failed to retrieve data from vault: {e}")
            return None
    
    def delete(
        self,
        user_id: str,
        data_type: str = None
    ) -> Dict[str, Any]:
        """
        데이터 삭제
        
        Args:
            user_id: 사용자 ID
            data_type: 데이터 타입 (None이면 전체 삭제)
        
        Returns:
            삭제 결과
        """
        try:
            vault_dir = os.path.join(self.storage_dir, user_id)
            
            if not os.path.exists(vault_dir):
                return {
                    'success': True,
                    'message': 'No data to delete'
                }
            
            if data_type:
                # 특정 타입만 삭제
                file_path = os.path.join(vault_dir, f"{data_type}.encrypted")
                if os.path.exists(file_path):
                    os.remove(file_path)
            else:
                # 전체 삭제
                for filename in os.listdir(vault_dir):
                    file_path = os.path.join(vault_dir, filename)
                    if os.path.isfile(file_path):
                        os.remove(file_path)
                
                # 디렉토리 삭제
                os.rmdir(vault_dir)
            
            # 키 제거
            if user_id in self.keys:
                del self.keys[user_id]
            
            logger.info(f"Data deleted from vault: {data_type or 'all'} for {user_id}")
            
            return {
                'success': True,
                'message': 'Data deleted'
            }
            
        except Exception as e:
            logger.error(f"Failed to delete data from vault: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def set_sharing_preference(
        self,
        user_id: str,
        sharing_enabled: bool
    ) -> Dict[str, Any]:
        """
        AI 학습 공유 설정
        
        Args:
            user_id: 사용자 ID
            sharing_enabled: 공유 활성화 여부
        
        Returns:
            설정 결과
        """
        preference_file = os.path.join(self.storage_dir, user_id, 'sharing_preference.json')
        
        os.makedirs(os.path.dirname(preference_file), exist_ok=True)
        
        preference = {
            'user_id': user_id,
            'sharing_enabled': sharing_enabled,
            'updated_at': datetime.now().isoformat()
        }
        
        try:
            with open(preference_file, 'w', encoding='utf-8') as f:
                json.dump(preference, f, ensure_ascii=False, indent=2)
            
            return {
                'success': True,
                'sharing_enabled': sharing_enabled
            }
        except Exception as e:
            logger.error(f"Failed to set sharing preference: {e}")
            return {
                'success': False,
                'error': str(e)
            }
