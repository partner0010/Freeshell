"""
숏폼 생성기
"""

from typing import Dict, Any, Optional
import os
import json
from datetime import datetime

from ..orchestrator import Orchestrator
from ..video.scene_schema import Scene, Character, Background, Voice, Subtitle
from ..video.ffmpeg_renderer import FFmpegRenderer
from ..video.renderer_factory import RendererFactory
from .script_generator import ScriptGenerator
from .scene_generator import SceneGenerator
from .voice_generator import VoiceGenerator
from .subtitle_generator import SubtitleGenerator
from ..utils.logger import get_logger

logger = get_logger(__name__)


class ShortformGenerator:
    """숏폼 생성기"""
    
    def __init__(self, orchestrator: Orchestrator):
        self.orchestrator = orchestrator
        self.script_generator = ScriptGenerator(orchestrator)
        self.scene_generator = SceneGenerator(orchestrator)
        self.voice_generator = VoiceGenerator()
        self.subtitle_generator = SubtitleGenerator()
        self.output_dir = "storage/videos"
        os.makedirs(self.output_dir, exist_ok=True)
    
    async def generate(
        self,
        prompt: str,
        duration: int,
        style: str,
        job_id: str
    ) -> Dict[str, Any]:
        """
        숏폼 생성
        
        Args:
            prompt: 프롬프트
            duration: 영상 길이 (초)
            style: 스타일
            job_id: 작업 ID
            
        Returns:
            생성 결과
        """
        try:
            # 1. Script 생성
            logger.info(f"[{job_id}] Generating script...")
            script_result = await self.script_generator.generate(prompt, duration)
            if not script_result['success']:
                return {'success': False, 'error': 'Script generation failed'}
            
            script = script_result['script']
            logger.info(f"[{job_id}] Script generated: {len(script)} characters")
            
            # 2. Scene JSON 생성
            logger.info(f"[{job_id}] Generating scenes...")
            scenes_result = await self.scene_generator.generate(
                script=script,
                duration=duration,
                style=style
            )
            if not scenes_result['success']:
                return {'success': False, 'error': 'Scene generation failed'}
            
            scenes = scenes_result['scenes']
            logger.info(f"[{job_id}] {len(scenes)} scenes generated")
            
            # 3. 음성 생성
            logger.info(f"[{job_id}] Generating voice...")
            voice_result = await self.voice_generator.generate(script, duration)
            if not voice_result['success']:
                return {'success': False, 'error': 'Voice generation failed'}
            
            voice_path = voice_result['voice_path']
            logger.info(f"[{job_id}] Voice generated: {voice_path}")
            
            # 4. 자막 생성
            logger.info(f"[{job_id}] Generating subtitles...")
            subtitles = self.subtitle_generator.generate(script, scenes)
            logger.info(f"[{job_id}] {len(subtitles)} subtitles generated")
            
            # 5. Scene에 음성 및 자막 추가
            for i, scene in enumerate(scenes):
                scene.voice = Voice(
                    text=script,
                    file_path=voice_path,
                    start_time=sum(s.duration for s in scenes[:i]),
                    duration=scene.duration
                )
                scene.subtitles = [
                    Subtitle(
                        text=sub['text'],
                        start_time=sub['start_time'],
                        duration=sub['duration']
                    )
                    for sub in subtitles
                    if sub['scene_id'] == scene.id
                ]
            
            # 6. FFmpeg 렌더링
            logger.info(f"[{job_id}] Rendering video...")
            renderer = RendererFactory.create_renderer(
                output_path=os.path.join(self.output_dir, f"{job_id}.mp4"),
                width=1080,
                height=1920,
                fps=30
            )
            
            video_path = await renderer.render(scenes)
            logger.info(f"[{job_id}] Video rendered: {video_path}")
            
            # 7. 결과 반환
            return {
                'success': True,
                'video_path': video_path,
                'scenes': [scene.to_dict() for scene in scenes],
                'script': script,
                'duration': duration,
                'metadata': {
                    'job_id': job_id,
                    'style': style,
                    'created_at': datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"[{job_id}] Generation failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
