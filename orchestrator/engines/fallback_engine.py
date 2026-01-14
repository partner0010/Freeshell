"""
Fallback Engine
"""

from typing import Dict, Any
from datetime import datetime

from ..core.engine import Engine, EngineType, EngineResult
from ..utils.logger import get_logger

logger = get_logger(__name__)


class FallbackEngine(Engine):
    """Fallback Engine - 최후의 수단"""
    
    def __init__(self, name: str = "fallback_engine", priority: int = -1):
        super().__init__(name, EngineType.RULE, priority)
    
    async def execute(self, input_data: Dict[str, Any]) -> EngineResult:
        """Fallback 실행"""
        start_time = datetime.now()
        
        # 기본 템플릿 반환
        result_data = {
            'type': 'fallback',
            'message': 'AI generation failed, using default template',
            'data': self._generate_default(input_data)
        }
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        logger.warning(f"Fallback engine used for: {input_data.get('step_id', 'unknown')}")
        
        return EngineResult(
            success=True,
            data=result_data,
            engine_name=self.name,
            engine_type=self.engine_type,
            execution_time=execution_time,
            fallback_used=True
        )
    
    def _generate_default(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """기본 데이터 생성"""
        step_id = input_data.get('step_id', '')
        
        if 'script' in step_id or 'generate_script' in step_id:
            return {
                'script': "안녕하세요. 이것은 기본 템플릿입니다.",
                'scenes': [
                    {
                        'id': 'scene_001',
                        'duration': 5.0,
                        'text': '안녕하세요. 이것은 기본 템플릿입니다.'
                    }
                ]
            }
        elif 'image' in step_id or 'generate_image' in step_id:
            return {
                'image_path': 'templates/default_image.jpg',
                'message': '기본 이미지 템플릿 사용'
            }
        elif 'voice' in step_id or 'generate_voice' in step_id:
            return {
                'voice_path': 'templates/default_voice.mp3',
                'message': '기본 음성 템플릿 사용'
            }
        else:
            return {
                'message': '기본 템플릿',
                'data': input_data
            }
