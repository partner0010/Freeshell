"""
Scene JSON 생성기
"""

from typing import Dict, Any, List
import re

from ..orchestrator import Orchestrator
from ..video.scene_schema import Scene, Character, Background, Position, EmotionType, MotionType
from ..utils.logger import get_logger

logger = get_logger(__name__)


class SceneGenerator:
    """Scene 생성기"""
    
    def __init__(self, orchestrator: Orchestrator):
        self.orchestrator = orchestrator
    
    async def generate(
        self,
        script: str,
        duration: int,
        style: str
    ) -> Dict[str, Any]:
        """
        Scene JSON 생성
        
        Args:
            script: 스크립트
            duration: 영상 길이 (초)
            style: 스타일
            
        Returns:
            생성 결과
        """
        try:
            # AI Orchestrator를 통한 Scene 생성
            context = {
                'script': script,
                'duration': duration,
                'style': style,
                'type': 'scene'
            }
            
            result = await self.orchestrator.process(
                intent="generate_scenes",
                context=context
            )
            
            if result.success:
                scenes_data = result.data
                if isinstance(scenes_data, dict):
                    scenes_data = scenes_data.get('scenes', [])
                
                # Scene 객체로 변환
                scenes = self._parse_scenes(scenes_data, duration)
                
                return {
                    'success': True,
                    'scenes': scenes
                }
            else:
                # Fallback: 규칙 기반 Scene 생성
                logger.warning("AI scene generation failed, using fallback")
                return self._generate_fallback_scenes(script, duration, style)
                
        except Exception as e:
            logger.error(f"Scene generation error: {e}")
            return self._generate_fallback_scenes(script, duration, style)
    
    def _parse_scenes(self, scenes_data: List[Dict], total_duration: int) -> List[Scene]:
        """Scene 데이터 파싱"""
        scenes = []
        
        for i, scene_data in enumerate(scenes_data):
            scene = Scene(
                id=f"scene_{i+1:03d}",
                duration=scene_data.get('duration', total_duration / len(scenes_data)),
                background=Background(
                    type=scene_data.get('background', {}).get('type', 'color'),
                    source=scene_data.get('background', {}).get('source', '0x000000')
                ),
                characters=[
                    Character(
                        id=char.get('id', 'char_001'),
                        name=char.get('name', 'Character'),
                        image_path=char.get('image_path', 'templates/default_character.png'),
                        position=Position(
                            x=char.get('position', {}).get('x', 0.5),
                            y=char.get('position', {}).get('y', 0.5)
                        ),
                        scale=char.get('scale', 1.0),
                        emotion=EmotionType(char.get('emotion', 'neutral'))
                    )
                    for char in scene_data.get('characters', [])
                ]
            )
            scenes.append(scene)
        
        return scenes
    
    def _generate_fallback_scenes(
        self,
        script: str,
        duration: int,
        style: str
    ) -> Dict[str, Any]:
        """Fallback Scene 생성"""
        # 스크립트를 문장 단위로 분할
        sentences = re.split(r'[.!?。！？]\s*', script)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if not sentences:
            sentences = [script]
        
        # Scene 개수 결정 (최소 3개, 최대 10개)
        num_scenes = min(max(len(sentences), 3), 10)
        scene_duration = duration / num_scenes
        
        scenes = []
        for i in range(num_scenes):
            scene = Scene(
                id=f"scene_{i+1:03d}",
                duration=scene_duration,
                background=Background(
                    type="color",
                    source="0x1a1a2e" if style == "animation" else "0x000000"
                ),
                characters=[
                    Character(
                        id="char_001",
                        name="Character",
                        image_path="templates/default_character.png",
                        position=Position(x=0.5, y=0.5),
                        scale=1.0,
                        emotion=EmotionType.NEUTRAL
                    )
                ]
            )
            scenes.append(scene)
        
        return {
            'success': True,
            'scenes': scenes,
            'fallback': True
        }
