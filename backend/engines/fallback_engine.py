"""
Fallback Engine - 최후의 수단
"""

from typing import Dict, Any

from .base import BaseEngine, EngineResult
from ..utils.logger import get_logger

logger = get_logger(__name__)


class FallbackEngine(BaseEngine):
    """Fallback Engine"""
    
    def __init__(self):
        super().__init__("fallback_engine")
    
    def run(self, task_name: str, parameters: Dict[str, Any]) -> EngineResult:
        """Fallback 실행"""
        logger.warning(f"Fallback engine used for: {task_name}")
        
        # 기본 템플릿 반환
        if task_name == 'generate_script':
            return EngineResult(
                success=True,
                data={'script': '안녕하세요. 이것은 기본 템플릿입니다.'}
            )
        elif task_name == 'create_scenes':
            return EngineResult(
                success=True,
                data={
                    'scenes': [
                        {
                            'id': 'scene_001',
                            'duration': 5,
                            'image': 'templates/default_character.png',
                            'motion': 'slow_breath',
                            'emotion': 'warm',
                            'voice': None,
                            'subtitle': {
                                'text': '안녕하세요',
                                'start': 0,
                                'end': 4
                            }
                        }
                    ]
                }
            )
        elif task_name == 'generate_voice':
            return EngineResult(
                success=True,
                data={'voice_path': 'templates/default_voice.mp3'}
            )
        elif task_name == 'render_video':
            return EngineResult(
                success=True,
                data={'file_path': 'templates/default_video.mp4'}
            )
        else:
            return EngineResult(
                success=True,
                data={'message': 'Fallback template used', 'task': task_name}
            )
