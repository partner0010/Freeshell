"""
기억 기반 콘텐츠 (Archive) 관리자
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import os
import json

from ...ethics.consent import ConsentManager
from ...utils.logger import get_logger

logger = get_logger(__name__)


class ArchiveManager:
    """Archive 관리자"""
    
    def __init__(self, storage_dir: str = "storage/archive"):
        self.storage_dir = storage_dir
        os.makedirs(storage_dir, exist_ok=True)
        self.consent_manager = ConsentManager()
    
    def create_archive(
        self,
        user_id: str,
        archive_data: Dict[str, Any],
        consent_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Archive 생성
        
        Args:
            user_id: 사용자 ID
            archive_data: Archive 데이터
            consent_data: 동의 데이터
        
        Returns:
            생성 결과
        """
        # 동의 검증
        consent_result = self.consent_manager.verify_consent(consent_data)
        if not consent_result['valid']:
            return {
                'success': False,
                'error': consent_result['message']
            }
        
        # Archive ID 생성
        archive_id = f"archive_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{user_id[:8]}"
        
        # Archive 구조
        archive = {
            'id': archive_id,
            'user_id': user_id,
            'type': archive_data.get('type', 'memory'),  # memory, memorial, healing
            'purpose': archive_data.get('purpose', 'personal_archive'),
            'content': {
                'photos': archive_data.get('photos', []),
                'voice': archive_data.get('voice', []),
                'text': archive_data.get('text', []),
                'conversations': archive_data.get('conversations', [])
            },
            'metadata': {
                'subject_name': archive_data.get('subject_name'),
                'subject_status': archive_data.get('subject_status'),  # deceased, living, historical
                'created_at': datetime.now().isoformat(),
                'consent_id': consent_result.get('consent_id')
            },
            'settings': {
                'mode': archive_data.get('mode', 'archive'),  # archive, conversation
                'privacy': archive_data.get('privacy', 'private'),
                'ai_generated_notice': True
            }
        }
        
        # 저장
        self._save_archive(archive)
        
        logger.info(f"Archive created: {archive_id} by {user_id}")
        
        return {
            'success': True,
            'archive_id': archive_id,
            'archive': archive
        }
    
    def get_archive(self, archive_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Archive 조회"""
        file_path = os.path.join(self.storage_dir, f"{archive_id}.json")
        
        if not os.path.exists(file_path):
            return None
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                archive = json.load(f)
            
            # 권한 확인
            if archive['user_id'] != user_id:
                return None
            
            return archive
        except Exception as e:
            logger.error(f"Failed to load archive {archive_id}: {e}")
            return None
    
    def list_archives(self, user_id: str, archive_type: str = None) -> List[Dict[str, Any]]:
        """Archive 목록 조회"""
        archives = []
        
        for filename in os.listdir(self.storage_dir):
            if not filename.endswith('.json'):
                continue
            
            archive_id = filename[:-5]
            archive = self.get_archive(archive_id, user_id)
            
            if archive:
                if archive_type is None or archive['type'] == archive_type:
                    archives.append({
                        'id': archive['id'],
                        'type': archive['type'],
                        'purpose': archive['purpose'],
                        'created_at': archive['metadata']['created_at'],
                        'subject_name': archive['metadata'].get('subject_name')
                    })
        
        # 최신순 정렬
        archives.sort(key=lambda x: x['created_at'], reverse=True)
        
        return archives
    
    def update_archive(
        self,
        archive_id: str,
        user_id: str,
        updates: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Archive 업데이트"""
        archive = self.get_archive(archive_id, user_id)
        
        if not archive:
            return {
                'success': False,
                'error': 'Archive not found'
            }
        
        # 업데이트
        if 'content' in updates:
            archive['content'].update(updates['content'])
        
        if 'settings' in updates:
            archive['settings'].update(updates['settings'])
        
        archive['metadata']['updated_at'] = datetime.now().isoformat()
        
        # 저장
        self._save_archive(archive)
        
        return {
            'success': True,
            'archive': archive
        }
    
    def delete_archive(self, archive_id: str, user_id: str) -> Dict[str, Any]:
        """Archive 삭제"""
        archive = self.get_archive(archive_id, user_id)
        
        if not archive:
            return {
                'success': False,
                'error': 'Archive not found'
            }
        
        # 파일 삭제
        file_path = os.path.join(self.storage_dir, f"{archive_id}.json")
        try:
            os.remove(file_path)
            logger.info(f"Archive deleted: {archive_id} by {user_id}")
            return {'success': True}
        except Exception as e:
            logger.error(f"Failed to delete archive {archive_id}: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _save_archive(self, archive: Dict[str, Any]):
        """Archive 저장"""
        file_path = os.path.join(self.storage_dir, f"{archive['id']}.json")
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(archive, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Failed to save archive {archive['id']}: {e}")
