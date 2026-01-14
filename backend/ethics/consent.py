"""
동의 관리 시스템
"""

from typing import Dict, Any, Optional
from datetime import datetime
import os
import json
import uuid

from ..utils.logger import get_logger

logger = get_logger(__name__)


class ConsentManager:
    """동의 관리자"""
    
    def __init__(self, storage_dir: str = "storage/consent"):
        self.storage_dir = storage_dir
        os.makedirs(storage_dir, exist_ok=True)
    
    def create_consent(
        self,
        user_id: str,
        consent_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        동의 생성
        
        Args:
            user_id: 사용자 ID
            consent_data: 동의 데이터
                - type: 동의 타입 (self, family, historical)
                - subject_name: 대상 이름
                - subject_status: 대상 상태 (deceased, living, historical)
                - purpose: 사용 목적 (memorial, healing, archive)
                - explicit: 명시적 동의 여부
        
        Returns:
            동의 생성 결과
        """
        consent_id = str(uuid.uuid4())
        
        consent = {
            'id': consent_id,
            'user_id': user_id,
            'type': consent_data.get('type', 'self'),
            'subject_name': consent_data.get('subject_name'),
            'subject_status': consent_data.get('subject_status'),
            'purpose': consent_data.get('purpose', 'archive'),
            'explicit': consent_data.get('explicit', False),
            'metadata': {
                'created_at': datetime.now().isoformat(),
                'ip_address': consent_data.get('ip_address'),
                'user_agent': consent_data.get('user_agent')
            }
        }
        
        # 저장
        self._save_consent(consent)
        
        logger.info(f"Consent created: {consent_id} by {user_id}")
        
        return {
            'success': True,
            'consent_id': consent_id,
            'consent': consent
        }
    
    def verify_consent(
        self,
        consent_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        동의 검증
        
        Args:
            consent_data: 동의 데이터 또는 consent_id
        
        Returns:
            검증 결과
        """
        # consent_id가 있으면 조회
        if 'consent_id' in consent_data:
            consent = self.get_consent(consent_data['consent_id'])
            if not consent:
                return {
                    'valid': False,
                    'message': 'Consent not found'
                }
        else:
            # 동의 데이터 직접 검증
            consent = consent_data
        
        # 필수 검증
        if not consent.get('explicit', False):
            return {
                'valid': False,
                'message': 'Explicit consent required'
            }
        
        # 생존 인물 검증
        if consent.get('subject_status') == 'living':
            if consent.get('type') != 'self':
                return {
                    'valid': False,
                    'message': 'Living subjects require self-consent'
                }
        
        # 추모 목적 검증
        if consent.get('purpose') == 'memorial':
            if consent.get('subject_status') == 'living':
                return {
                    'valid': False,
                    'message': 'Memorial purpose cannot be used for living subjects'
                }
        
        return {
            'valid': True,
            'consent_id': consent.get('id'),
            'consent': consent
        }
    
    def get_consent(self, consent_id: str) -> Optional[Dict[str, Any]]:
        """동의 조회"""
        file_path = os.path.join(self.storage_dir, f"{consent_id}.json")
        
        if not os.path.exists(file_path):
            return None
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load consent {consent_id}: {e}")
            return None
    
    def revoke_consent(
        self,
        consent_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """동의 철회"""
        consent = self.get_consent(consent_id)
        
        if not consent:
            return {
                'success': False,
                'error': 'Consent not found'
            }
        
        if consent['user_id'] != user_id:
            return {
                'success': False,
                'error': 'Permission denied'
            }
        
        # 파일 삭제
        file_path = os.path.join(self.storage_dir, f"{consent_id}.json")
        try:
            os.remove(file_path)
            logger.info(f"Consent revoked: {consent_id} by {user_id}")
            return {'success': True}
        except Exception as e:
            logger.error(f"Failed to revoke consent {consent_id}: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _save_consent(self, consent: Dict[str, Any]):
        """동의 저장"""
        file_path = os.path.join(self.storage_dir, f"{consent['id']}.json")
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(consent, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Failed to save consent {consent['id']}: {e}")
