"""
AI Orchestrated SNS - 피드 재구성 엔진
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import random

from ...orchestrator.memory import MemoryManager
from ...utils.logger import get_logger

logger = get_logger(__name__)


class FeedEngine:
    """AI 피드 재구성 엔진"""
    
    def __init__(self, memory_manager: MemoryManager):
        self.memory_manager = memory_manager
    
    def reorganize_feed(
        self,
        user_id: str,
        raw_feed: List[Dict[str, Any]],
        max_items: int = 20
    ) -> List[Dict[str, Any]]:
        """
        피드 재구성
        
        Args:
            user_id: 사용자 ID
            raw_feed: 원본 피드
            max_items: 최대 아이템 수
        
        Returns:
            재구성된 피드
        """
        # 사용자 컨텍스트 로드
        user_context = self.memory_manager.get_context(user_id)
        
        # 감정 상태
        current_emotion = self.memory_manager.get(user_id, 'emotion') or 'neutral'
        
        # 선호도
        preference = self.memory_manager.get(user_id, 'preference') or {}
        
        # 상호작용 기록
        interactions = self.memory_manager.get(user_id, 'interactions') or []
        
        # 점수 계산
        scored_feed = []
        for item in raw_feed:
            score = self._calculate_score(
                item,
                current_emotion,
                preference,
                interactions
            )
            scored_feed.append({
                'item': item,
                'score': score
            })
        
        # 점수 순 정렬
        scored_feed.sort(key=lambda x: x['score'], reverse=True)
        
        # 상위 N개 선택
        reorganized = [item['item'] for item in scored_feed[:max_items]]
        
        logger.info(f"Feed reorganized: {len(raw_feed)} -> {len(reorganized)} items")
        
        return reorganized
    
    def _calculate_score(
        self,
        item: Dict[str, Any],
        emotion: str,
        preference: Dict[str, Any],
        interactions: List[Dict[str, Any]]
    ) -> float:
        """아이템 점수 계산"""
        score = 0.0
        
        # 1. 감정 매칭
        item_emotion = item.get('metadata', {}).get('emotion', 'neutral')
        if item_emotion == emotion:
            score += 10.0
        elif self._emotion_compatible(emotion, item_emotion):
            score += 5.0
        
        # 2. 선호도 매칭
        item_category = item.get('category', 'general')
        preferred_categories = preference.get('categories', [])
        if item_category in preferred_categories:
            score += 8.0
        
        # 3. 상호작용 패턴
        similar_items = [
            i for i in interactions
            if i.get('data', {}).get('category') == item_category
        ]
        if similar_items:
            score += len(similar_items) * 2.0
        
        # 4. 시간 가중치 (최신일수록 높음)
        item_time = item.get('created_at', datetime.now().isoformat())
        time_diff = (datetime.now() - datetime.fromisoformat(item_time)).total_seconds()
        time_score = max(0, 10.0 - (time_diff / 86400))  # 24시간 기준
        score += time_score
        
        # 5. 창작자 매칭
        creator_id = item.get('creator_id')
        followed_creators = preference.get('followed_creators', [])
        if creator_id in followed_creators:
            score += 15.0
        
        return score
    
    def _emotion_compatible(self, user_emotion: str, item_emotion: str) -> bool:
        """감정 호환성"""
        compatible_map = {
            'happy': ['excited', 'calm'],
            'sad': ['calm', 'neutral'],
            'calm': ['happy', 'neutral'],
            'excited': ['happy', 'neutral'],
            'neutral': ['calm', 'happy']
        }
        return item_emotion in compatible_map.get(user_emotion, [])
    
    def personalize_content(
        self,
        user_id: str,
        content: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        콘텐츠 개인화
        
        Args:
            user_id: 사용자 ID
            content: 원본 콘텐츠
        
        Returns:
            개인화된 콘텐츠
        """
        user_context = self.memory_manager.get_context(user_id)
        preference = self.memory_manager.get(user_id, 'preference') or {}
        
        # 스타일 조정
        personalized = content.copy()
        
        # 선호 스타일 적용
        preferred_style = preference.get('style', 'default')
        if preferred_style != 'default':
            personalized['style'] = preferred_style
        
        # 감정 톤 조정
        current_emotion = self.memory_manager.get(user_id, 'emotion') or 'neutral'
        personalized['tone'] = self._get_emotion_tone(current_emotion)
        
        return personalized
    
    def _get_emotion_tone(self, emotion: str) -> str:
        """감정에 따른 톤"""
        tone_map = {
            'happy': 'warm',
            'sad': 'gentle',
            'calm': 'peaceful',
            'excited': 'energetic',
            'neutral': 'balanced'
        }
        return tone_map.get(emotion, 'balanced')
