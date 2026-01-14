"""
자막 생성기
"""

from typing import Dict, Any, List
import re

from ..video.scene_schema import Scene
from ..utils.logger import get_logger

logger = get_logger(__name__)


class SubtitleGenerator:
    """자막 생성기"""
    
    def generate(self, script: str, scenes: List[Scene]) -> List[Dict[str, Any]]:
        """
        자막 생성
        
        Args:
            script: 스크립트
            scenes: Scene 목록
            
        Returns:
            자막 목록
        """
        # 스크립트를 문장 단위로 분할
        sentences = re.split(r'[.!?。！？]\s*', script)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if not sentences:
            sentences = [script]
        
        # Scene별로 자막 분배
        subtitles = []
        current_time = 0.0
        
        for i, scene in enumerate(scenes):
            # Scene에 할당할 문장 수
            sentences_per_scene = len(sentences) // len(scenes)
            start_idx = i * sentences_per_scene
            end_idx = start_idx + sentences_per_scene if i < len(scenes) - 1 else len(sentences)
            
            scene_sentences = sentences[start_idx:end_idx]
            if not scene_sentences and i == 0:
                scene_sentences = sentences[:1]
            
            # 자막 생성
            for j, sentence in enumerate(scene_sentences):
                subtitle_duration = scene.duration / len(scene_sentences) if scene_sentences else scene.duration
                
                subtitle = {
                    'scene_id': scene.id,
                    'text': sentence,
                    'start_time': current_time,
                    'duration': subtitle_duration,
                    'position': {'x': 0.5, 'y': 0.85}  # 하단 중앙
                }
                subtitles.append(subtitle)
                current_time += subtitle_duration
        
        return subtitles
