"""
FFmpeg 렌더링 파이프라인
"""

import os
import subprocess
import tempfile
from typing import List, Dict, Any, Optional, Union
from pathlib import Path
import json

from .scene_schema import Scene, validate_scene_json
from ..utils.logger import get_logger

logger = get_logger(__name__)


class FFmpegRenderer:
    """FFmpeg 기반 영상 렌더러"""
    
    def __init__(
        self,
        output_path: str,
        width: int = 1080,
        height: int = 1920,
        fps: int = 30,
        audio_sample_rate: int = 44100,
        use_gpu: bool = False
    ):
        self.output_path = output_path
        self.width = width
        self.height = height
        self.fps = fps
        self.audio_sample_rate = audio_sample_rate
        self.use_gpu = use_gpu
        self.temp_dir = tempfile.mkdtemp()
    
    async def render(self, scenes: List[Scene]) -> str:
        """
        Scene 리스트를 영상으로 렌더링
        
        Args:
            scenes: Scene 리스트
            
        Returns:
            str: 생성된 영상 파일 경로
        """
        logger.info(f"Starting render of {len(scenes)} scenes")
        
        # 1. 각 Scene을 개별 영상으로 렌더링
        scene_videos = []
        for i, scene in enumerate(scenes):
            scene_video = await self._render_scene(scene, i)
            if scene_video:
                scene_videos.append(scene_video)
        
        if not scene_videos:
            raise Exception("No scenes rendered successfully")
        
        # 2. Scene 영상들을 연결
        final_video = await self._concatenate_scenes(scene_videos)
        
        # 3. 최종 영상 생성
        logger.info(f"Final video saved to: {self.output_path}")
        return self.output_path
    
    async def _render_scene(self, scene: Scene, scene_index: int) -> Optional[str]:
        """단일 Scene 렌더링"""
        scene_video_path = os.path.join(self.temp_dir, f"scene_{scene_index:03d}.mp4")
        
        try:
            # FFmpeg 명령 생성
            command = self._build_scene_command(scene, scene_video_path)
            
            # FFmpeg 실행
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=300  # 5분 타임아웃
            )
            
            if result.returncode != 0:
                logger.error(f"FFmpeg error for scene {scene.id}: {result.stderr}")
                return None
            
            if not os.path.exists(scene_video_path):
                logger.error(f"Scene video not created: {scene_video_path}")
                return None
            
            logger.info(f"Scene {scene.id} rendered successfully")
            return scene_video_path
            
        except subprocess.TimeoutExpired:
            logger.error(f"FFmpeg timeout for scene {scene.id}")
            return None
        except Exception as e:
            logger.error(f"Error rendering scene {scene.id}: {e}")
            return None
    
    def _build_scene_command(self, scene: Scene, output_path: str) -> List[str]:
        """Scene 렌더링 FFmpeg 명령 생성"""
        command = ['ffmpeg', '-y']  # -y: 덮어쓰기
        
        # 입력 파일들
        inputs = []
        filter_inputs = []
        
        # 1. 배경 이미지/비디오
        bg_path = scene.background.source
        if not bg_path or not os.path.exists(bg_path):
            # 기본 배경 생성 (단색)
            bg_path = self._create_default_background(scene)
        
        command.extend(['-loop', '1', '-t', str(scene.duration), '-i', bg_path])
        inputs.append(0)  # 배경은 입력 0
        
        # 2. 캐릭터 이미지들
        char_input_index = 1
        for char in scene.characters:
            if os.path.exists(char.image_path):
                command.extend(['-loop', '1', '-t', str(scene.duration), '-i', char.image_path])
                inputs.append(char_input_index)
                char_input_index += 1
        
        # 3. 음성 파일
        audio_input_index = char_input_index
        if scene.voice and os.path.exists(scene.voice.file_path):
            command.extend(['-i', scene.voice.file_path])
            inputs.append(audio_input_index)
        
        # Filter Complex 생성
        filter_complex = self._build_filter_complex(scene, inputs, audio_input_index)
        if filter_complex:
            command.extend(['-filter_complex', filter_complex])
        
        # 출력 설정
        command.extend([
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-pix_fmt', 'yuv420p',
            '-r', str(self.fps),
            '-s', f'{self.width}x{self.height}'
        ])
        
        # 오디오 설정
        if scene.voice and os.path.exists(scene.voice.file_path):
            command.extend([
                '-c:a', 'aac',
                '-b:a', '128k',
                '-ar', str(self.audio_sample_rate),
                '-map', f'[{audio_input_index}:a]'
            ])
        else:
            # 무음 오디오 생성
            command.extend([
                '-f', 'lavfi',
                '-i', f'anullsrc=channel_layout=stereo:sample_rate={self.audio_sample_rate}',
                '-c:a', 'aac',
                '-b:a', '128k',
                '-shortest'
            ])
        
        command.append(output_path)
        
        return command
    
    def _build_filter_complex(self, scene: Scene, inputs: List[int], audio_input_index: int) -> str:
        """Filter Complex 생성"""
        filters = []
        
        # 배경 처리
        bg_input = f"[{inputs[0]}:v]"
        current_stream = bg_input
        
        # 배경 모션 적용
        if scene.background.motion.value != 'static':
            motion_filter = self._get_motion_filter(scene.background.motion, scene.duration)
            if motion_filter:
                current_stream = f"[bg_motion]"
                filters.append(f"{bg_input}{motion_filter}{current_stream}")
        
        # 캐릭터 오버레이
        char_input_idx = 1
        for char in scene.characters:
            if char_input_idx < len(inputs):
                char_input = f"[{inputs[char_input_idx]}:v]"
                
                # 캐릭터 위치 및 스케일
                x_pos = int(char.position.x * self.width)
                y_pos = int(char.position.y * self.height)
                scale = char.scale
                
                # 캐릭터 모션
                char_motion = self._get_character_motion(char.motion, scene.duration, x_pos, y_pos, scale)
                
                # 오버레이 필터
                overlay_filter = f"{char_input}scale={int(self.width * scale)}:-1[char_{char_input_idx}]"
                filters.append(overlay_filter)
                
                overlay = f"{current_stream}[char_{char_input_idx}]overlay={x_pos}:{y_pos}:enable='between(t,0,{scene.duration})'"
                current_stream = f"[overlay_{char_input_idx}]"
                filters.append(f"{overlay}{current_stream}")
                
                char_input_idx += 1
        
        # 자막 추가
        if scene.subtitles:
            subtitle_filter = self._build_subtitle_filter(scene.subtitles, current_stream)
            if subtitle_filter:
                filters.append(subtitle_filter)
                current_stream = "[final]"
        
        # 최종 출력
        filters.append(f"{current_stream}scale={self.width}:{self.height}[outv]")
        
        return ";".join(filters)
    
    def _get_motion_filter(self, motion_type: str, duration: float) -> Optional[str]:
        """배경 모션 필터"""
        motion_filters = {
            'pan_left': f'crop=iw*0.8:ih:iw*0.1+iw*0.2*t/{duration}:0,scale={self.width}:{self.height}',
            'pan_right': f'crop=iw*0.8:ih:iw*0.1-iw*0.2*t/{duration}:0,scale={self.width}:{self.height}',
            'zoom_in': f'zoompan=z=\'min(zoom+0.0015,1.5)\':d={int(duration * self.fps)}:x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2):s={self.width}x{self.height}',
            'zoom_out': f'zoompan=z=\'if(lte(zoom,1.0),1.5,max(1.001,zoom-0.0015))\'::d={int(duration * self.fps)}:x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2):s={self.width}x{self.height}',
            'fade_in': f'fade=t=in:st=0:d=1',
            'fade_out': f'fade=t=out:st={duration-1}:d=1'
        }
        return motion_filters.get(motion_type)
    
    def _get_character_motion(self, motion_type: str, duration: float, x: int, y: int, scale: float) -> str:
        """캐릭터 모션"""
        # 간단한 모션 (실제로는 더 복잡한 애니메이션 가능)
        return ""  # 기본은 static
    
    def _build_subtitle_filter(self, subtitles: List, current_stream: str) -> Optional[str]:
        """자막 필터 생성"""
        if not subtitles:
            return None
        
        # 자막을 시간순으로 정렬
        sorted_subs = sorted(subtitles, key=lambda s: s.start_time)
        
        subtitle_filters = []
        for sub in sorted_subs:
            # 자막 텍스트 이스케이프
            text = sub.text.replace("'", "\\'").replace(":", "\\:").replace("[", "\\[").replace("]", "\\]")
            
            # 위치 계산
            if sub.position == "top":
                y_pos = f"h-th-{self.height - 100}"
            elif sub.position == "center":
                y_pos = "(h-text_h)/2"
            else:  # bottom
                y_pos = f"h-th-{50}"
            
            # 스타일
            style = sub.style
            font_size = style.get('font_size', 24)
            font_color = style.get('font_color', '#FFFFFF').replace('#', '0x')
            bg_color = style.get('background_color', 'rgba(0,0,0,0.5)')
            
            # drawtext 필터
            drawtext = (
                f"drawtext=text='{text}':"
                f"fontsize={font_size}:"
                f"fontcolor={font_color}:"
                f"x=(w-text_w)/2:"
                f"y={y_pos}:"
                f"enable='between(t,{sub.start_time},{sub.start_time + sub.duration})':"
                f"box=1:boxcolor={bg_color}:boxborderw=5"
            )
            subtitle_filters.append(drawtext)
        
        # 모든 자막 필터 연결
        if subtitle_filters:
            filter_chain = f"{current_stream}" + ":".join(subtitle_filters) + "[final]"
            return filter_chain
        
        return None
    
    async def _concatenate_scenes(self, scene_videos: List[str]) -> str:
        """Scene 영상들을 연결"""
        # concat 파일 생성
        concat_file = os.path.join(self.temp_dir, "concat.txt")
        with open(concat_file, 'w') as f:
            for video in scene_videos:
                f.write(f"file '{os.path.abspath(video)}'\n")
        
        # FFmpeg concat 명령
        command = [
            'ffmpeg',
            '-y',
            '-f', 'concat',
            '-safe', '0',
            '-i', concat_file,
            '-c', 'copy',
            self.output_path
        ]
        
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if result.returncode != 0:
            raise Exception(f"FFmpeg concat error: {result.stderr}")
        
        return self.output_path
    
    def _create_default_background(self, scene: Scene) -> str:
        """기본 배경 생성"""
        bg_path = os.path.join(self.temp_dir, f"bg_{scene.id}.png")
        
        # FFmpeg로 단색 배경 생성
        color = "0x333333"  # 기본 회색
        command = [
            'ffmpeg',
            '-y',
            '-f', 'lavfi',
            '-i', f'color=c={color}:size={self.width}x{self.height}:duration=1',
            '-frames:v', '1',
            bg_path
        ]
        
        subprocess.run(command, capture_output=True, timeout=10)
        return bg_path
    
    def cleanup(self):
        """임시 파일 정리"""
        import shutil
        if os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)
