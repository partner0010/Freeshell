"""
캐릭터 IP 시스템 관리자
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import os
import json
import uuid

from ...utils.logger import get_logger

logger = get_logger(__name__)


class CharacterManager:
    """캐릭터 IP 관리자"""
    
    def __init__(self, storage_dir: str = "storage/characters"):
        self.storage_dir = storage_dir
        os.makedirs(storage_dir, exist_ok=True)
    
    def create_character(
        self,
        user_id: str,
        character_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        캐릭터 생성
        
        Args:
            user_id: 사용자 ID
            character_data: 캐릭터 데이터
        
        Returns:
            생성 결과
        """
        character_id = str(uuid.uuid4())
        
        character = {
            'id': character_id,
            'user_id': user_id,
            'name': character_data.get('name', 'Unnamed Character'),
            'visual': {
                'image': character_data.get('image'),
                'style': character_data.get('style', '2d'),
                'variations': character_data.get('variations', [])
            },
            'voice': {
                'voice_id': character_data.get('voice_id'),
                'gender': character_data.get('gender', 'neutral'),
                'tone': character_data.get('tone', 'neutral')
            },
            'personality': {
                'traits': character_data.get('traits', []),
                'background': character_data.get('background', ''),
                'speech_style': character_data.get('speech_style', 'casual')
            },
            'usage_rights': {
                'owner': user_id,
                'commercial': character_data.get('commercial', False),
                'derivative': character_data.get('derivative', True),
                'created_at': datetime.now().isoformat()
            },
            'metadata': {
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat(),
                'version': 1
            }
        }
        
        # 저장
        self._save_character(character)
        
        logger.info(f"Character created: {character_id} by {user_id}")
        
        return {
            'success': True,
            'character_id': character_id,
            'character': character
        }
    
    def get_character(self, character_id: str) -> Optional[Dict[str, Any]]:
        """캐릭터 조회"""
        file_path = os.path.join(self.storage_dir, f"{character_id}.json")
        
        if not os.path.exists(file_path):
            return None
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load character {character_id}: {e}")
            return None
    
    def list_characters(self, user_id: str) -> List[Dict[str, Any]]:
        """사용자 캐릭터 목록"""
        characters = []
        
        for filename in os.listdir(self.storage_dir):
            if not filename.endswith('.json'):
                continue
            
            character_id = filename[:-5]
            character = self.get_character(character_id)
            
            if character and character['user_id'] == user_id:
                characters.append({
                    'id': character['id'],
                    'name': character['name'],
                    'visual': character['visual'],
                    'created_at': character['metadata']['created_at']
                })
        
        characters.sort(key=lambda x: x['created_at'], reverse=True)
        return characters
    
    def update_character(
        self,
        character_id: str,
        user_id: str,
        updates: Dict[str, Any]
    ) -> Dict[str, Any]:
        """캐릭터 업데이트"""
        character = self.get_character(character_id)
        
        if not character:
            return {
                'success': False,
                'error': 'Character not found'
            }
        
        if character['user_id'] != user_id:
            return {
                'success': False,
                'error': 'Permission denied'
            }
        
        # 업데이트
        if 'visual' in updates:
            character['visual'].update(updates['visual'])
        
        if 'voice' in updates:
            character['voice'].update(updates['voice'])
        
        if 'personality' in updates:
            character['personality'].update(updates['personality'])
        
        character['metadata']['updated_at'] = datetime.now().isoformat()
        character['metadata']['version'] += 1
        
        # 저장
        self._save_character(character)
        
        return {
            'success': True,
            'character': character
        }
    
    def use_character(
        self,
        character_id: str,
        usage_type: str,
        content_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        캐릭터 사용 (영상/음성/스토리/굿즈)
        
        Args:
            character_id: 캐릭터 ID
            usage_type: 사용 타입 (video, voice, story, goods)
            content_data: 콘텐츠 데이터
        
        Returns:
            사용 결과
        """
        character = self.get_character(character_id)
        
        if not character:
            return {
                'success': False,
                'error': 'Character not found'
            }
        
        usage_record = {
            'character_id': character_id,
            'usage_type': usage_type,
            'content': content_data,
            'timestamp': datetime.now().isoformat()
        }
        
        # 사용 기록 저장
        usage_dir = os.path.join(self.storage_dir, 'usage')
        os.makedirs(usage_dir, exist_ok=True)
        
        usage_file = os.path.join(usage_dir, f"{character_id}_{usage_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
        with open(usage_file, 'w', encoding='utf-8') as f:
            json.dump(usage_record, f, ensure_ascii=False, indent=2)
        
        return {
            'success': True,
            'usage_record': usage_record
        }
    
    def _save_character(self, character: Dict[str, Any]):
        """캐릭터 저장"""
        file_path = os.path.join(self.storage_dir, f"{character['id']}.json")
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(character, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Failed to save character {character['id']}: {e}")
