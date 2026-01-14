"""
Scene JSON 처리
"""

from typing import Dict, Any, List
import json

from .ffmpeg_renderer import FFmpegRenderer
from ..utils.logger import get_logger

logger = get_logger(__name__)


class SceneProcessor:
    """Scene JSON 처리기"""
    
    def __init__(self):
        self.renderer = FFmpegRenderer()
    
    def process_scenes(
        self,
        scenes_data: Dict[str, Any],
        voice_path: str = None
    ) -> Dict[str, Any]:
        """
        Scene JSON 처리 및 렌더링
        
        Args:
            scenes_data: Scene 데이터
            voice_path: 음성 파일 경로
            
        Returns:
            처리 결과
        """
        # Scene JSON 파싱
        if isinstance(scenes_data, dict):
            scenes = scenes_data.get('scenes', [])
        elif isinstance(scenes_data, list):
            scenes = scenes_data
        else:
            scenes = []
        
        if not scenes:
            return {
                'success': False,
                'error': 'No scenes provided'
            }
        
        # FFmpeg 렌더링
        result = self.renderer.render(scenes, voice_path)
        
        return result
    
    def validate_scene(self, scene: Dict[str, Any]) -> bool:
        """Scene 유효성 검증"""
        required_fields = ['duration', 'image']
        return all(field in scene for field in required_fields)
