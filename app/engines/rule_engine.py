"""
Rule Engine
"""

from typing import Dict, Any
import re
import json

from .base import BaseEngine, EngineResult
from ..utils.logger import get_logger

logger = get_logger(__name__)


class RuleEngine(BaseEngine):
    """Rule Engine - 규칙 기반 생성"""
    
    def __init__(self):
        super().__init__("rule_engine")
        self.rules = self._load_rules()
    
    def _load_rules(self) -> Dict[str, Any]:
        """규칙 로드"""
        return {
            'generate_script': {
                'template': '안녕하세요. {topic}에 대해 이야기하겠습니다. 감사합니다.'
            },
            'create_scenes': {
                'default_scenes': [
                    {
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
            },
            'generate_subtitles': {
                'method': 'split_by_sentences'
            }
        }
    
    def run(self, task_name: str, parameters: Dict[str, Any]) -> EngineResult:
        """Rule 실행"""
        try:
            if task_name == 'generate_script':
                return self._generate_script(parameters)
            elif task_name == 'create_scenes':
                return self._create_scenes(parameters)
            elif task_name == 'generate_subtitles':
                return self._generate_subtitles(parameters)
            elif task_name == 'render_video':
                return self._render_video(parameters)
            elif task_name == 'select_motion':
                return self._select_motion(parameters)
            elif task_name == 'apply_motion':
                return self._apply_motion(parameters)
            else:
                return EngineResult(
                    success=False,
                    error=f"Unknown task: {task_name}",
                    fallback_available=True
                )
        except Exception as e:
            logger.error(f"Rule engine error for {task_name}: {e}")
            return EngineResult(
                success=False,
                error=str(e),
                fallback_available=True
            )
    
    def _generate_script(self, parameters: Dict[str, Any]) -> EngineResult:
        """스크립트 생성"""
        prompt = parameters.get('prompt', '')
        duration = parameters.get('duration', 30)
        
        # 간단한 템플릿 기반 스크립트
        words_per_second = 2.5
        total_words = int(duration * words_per_second)
        
        # 키워드 추출
        keywords = prompt.split()[:5] if prompt else ['주제']
        
        script = f"{' '.join(keywords)}에 대한 이야기입니다. "
        script += f"이 영상에서는 {keywords[0] if keywords else '주제'}에 대해 알아보겠습니다. "
        script += "감사합니다."
        
        # 길이 조정
        while len(script.split()) < total_words:
            script += " " + script
        
        script = ' '.join(script.split()[:total_words])
        
        return EngineResult(
            success=True,
            data={'script': script}
        )
    
    def _create_scenes(self, parameters: Dict[str, Any]) -> EngineResult:
        """Scene 생성"""
        script = parameters.get('script', '')
        duration = parameters.get('duration', 30)
        style = parameters.get('style', 'animation')
        
        # 스크립트를 문장 단위로 분할
        sentences = re.split(r'[.!?。！？]\s*', script)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if not sentences:
            sentences = [script] if script else ['안녕하세요']
        
        # Scene 개수 결정
        num_scenes = min(max(len(sentences), 3), 10)
        scene_duration = duration / num_scenes
        
        scenes = []
        current_time = 0.0
        
        for i, sentence in enumerate(sentences[:num_scenes]):
            scene = {
                'id': f'scene_{i+1:03d}',
                'duration': scene_duration,
                'image': 'templates/default_character.png',
                'motion': 'slow_breath',
                'emotion': 'warm',
                'voice': None,
                'subtitle': {
                    'text': sentence,
                    'start': current_time,
                    'end': current_time + scene_duration
                }
            }
            scenes.append(scene)
            current_time += scene_duration
        
        return EngineResult(
            success=True,
            data={'scenes': scenes}
        )
    
    def _generate_subtitles(self, parameters: Dict[str, Any]) -> EngineResult:
        """자막 생성"""
        script = parameters.get('script', '')
        scenes = parameters.get('create_scenes', {}).get('scenes', [])
        
        subtitles = []
        for scene in scenes:
            if 'subtitle' in scene:
                subtitles.append(scene['subtitle'])
        
        return EngineResult(
            success=True,
            data={'subtitles': subtitles}
        )
    
    def _render_video(self, parameters: Dict[str, Any]) -> EngineResult:
        """영상 렌더링"""
        scenes = parameters.get('create_scenes', {}).get('scenes', [])
        voice_path = parameters.get('generate_voice', {}).get('voice_path')
        
        # FFmpeg 렌더링은 별도 모듈에서 처리
        # 여기서는 경로만 반환
        return EngineResult(
            success=True,
            data={'file_path': 'storage/videos/output.mp4', 'scenes': scenes}
        )
    
    def _select_motion(self, parameters: Dict[str, Any]) -> EngineResult:
        """모션 선택"""
        prompt = parameters.get('prompt', '').lower()
        
        motion = {
            'eye': 'blink_slow',
            'head': 'static',
            'breath': 'soft',
            'mouth': 'neutral'
        }
        
        # 프롬프트 기반 모션 선택
        if any(kw in prompt for kw in ['행복', 'happy', 'smile']):
            motion['mouth'] = 'smile'
        if any(kw in prompt for kw in ['고개', 'head', 'nod']):
            motion['head'] = 'tilt_left'
        if any(kw in prompt for kw in ['눈', 'eye', 'blink']):
            motion['eye'] = 'blink_slow'
        
        return EngineResult(
            success=True,
            data={'motion': motion}
        )
    
    def _apply_motion(self, parameters: Dict[str, Any]) -> EngineResult:
        """모션 적용"""
        motion_data = parameters.get('select_motion', {}).get('motion', {})
        image_path = parameters.get('image_path', 'templates/default_character.png')
        
        # FFmpeg 렌더링은 별도 모듈에서 처리
        return EngineResult(
            success=True,
            data={'file_path': 'storage/motion_videos/output.mp4', 'motion': motion_data}
        )
