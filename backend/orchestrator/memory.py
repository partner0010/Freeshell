"""
Memory 관리 - 사용자 컨텍스트 기억
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import os

from ..utils.logger import get_logger

logger = get_logger(__name__)


class MemoryManager:
    """Memory 관리자"""
    
    def __init__(self, storage_dir: str = "storage/memory"):
        self.storage_dir = storage_dir
        os.makedirs(storage_dir, exist_ok=True)
        self.memories: Dict[str, Dict[str, Any]] = {}
    
    def save(self, user_id: str, key: str, value: Any, metadata: Dict[str, Any] = None):
        """
        Memory 저장
        
        Args:
            user_id: 사용자 ID
            key: 메모리 키
            value: 메모리 값
            metadata: 메타데이터
        """
        if user_id not in self.memories:
            self.memories[user_id] = {}
        
        self.memories[user_id][key] = {
            'value': value,
            'metadata': metadata or {},
            'timestamp': datetime.now().isoformat()
        }
        
        # 파일 저장
        self._persist(user_id)
    
    def get(self, user_id: str, key: str) -> Optional[Any]:
        """Memory 조회"""
        if user_id in self.memories and key in self.memories[user_id]:
            return self.memories[user_id][key]['value']
        return None
    
    def get_all(self, user_id: str) -> Dict[str, Any]:
        """사용자 전체 Memory 조회"""
        return self.memories.get(user_id, {})
    
    def get_context(self, user_id: str, context_type: str = None) -> Dict[str, Any]:
        """
        컨텍스트 조회
        
        Args:
            user_id: 사용자 ID
            context_type: 컨텍스트 타입 (preference, emotion, pattern 등)
        """
        user_memories = self.memories.get(user_id, {})
        
        if context_type:
            # 특정 타입만 필터링
            filtered = {
                k: v for k, v in user_memories.items()
                if v.get('metadata', {}).get('type') == context_type
            }
            return filtered
        
        return user_memories
    
    def update_preference(self, user_id: str, preference: Dict[str, Any]):
        """사용자 선호도 업데이트"""
        self.save(
            user_id,
            'preference',
            preference,
            {'type': 'preference', 'updated_at': datetime.now().isoformat()}
        )
    
    def update_emotion(self, user_id: str, emotion: str, context: str = None):
        """감정 상태 업데이트"""
        self.save(
            user_id,
            'emotion',
            emotion,
            {'type': 'emotion', 'context': context, 'timestamp': datetime.now().isoformat()}
        )
    
    def add_interaction(self, user_id: str, interaction_type: str, data: Dict[str, Any]):
        """상호작용 기록"""
        interactions = self.get(user_id, 'interactions') or []
        interactions.append({
            'type': interaction_type,
            'data': data,
            'timestamp': datetime.now().isoformat()
        })
        self.save(
            user_id,
            'interactions',
            interactions,
            {'type': 'interaction', 'count': len(interactions)}
        )
    
    def _persist(self, user_id: str):
        """파일 저장"""
        file_path = os.path.join(self.storage_dir, f"{user_id}.json")
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(self.memories.get(user_id, {}), f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Failed to persist memory for {user_id}: {e}")
    
    def _load(self, user_id: str):
        """파일 로드"""
        file_path = os.path.join(self.storage_dir, f"{user_id}.json")
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    self.memories[user_id] = json.load(f)
            except Exception as e:
                logger.error(f"Failed to load memory for {user_id}: {e}")
    
    def load_user(self, user_id: str):
        """사용자 Memory 로드"""
        if user_id not in self.memories:
            self._load(user_id)
