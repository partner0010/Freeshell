"""
FFmpeg 렌더러 (실제 명령)
"""

import os
import subprocess
import tempfile
import json
from typing import Dict, Any, List
from pathlib import Path

from ..utils.logger import get_logger

logger = get_logger(__name__)


class FFmpegRenderer:
    """FFmpeg 렌더러"""
    
    def __init__(self, output_dir: str = "storage/videos"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
    
    def render(self, scenes: List[Dict[str, Any]], voice_path: str = None, output_path: str = None) -> Dict[str, Any]:
        """
        Scene JSON을 영상으로 렌더링
        
        Args:
            scenes: Scene JSON 배열
            voice_path: 음성 파일 경로
            output_path: 출력 파일 경로
            
        Returns:
            렌더링 결과
        """
        if not output_path:
            output_path = self.output_path or os.path.join(self.output_dir, "output.mp4")
        
        try:
            # 1. 자막 파일 생성
            subtitle_path = self._create_subtitle_file(scenes)
            
            # 2. FFmpeg 명령 생성
            command = self._build_ffmpeg_command(scenes, voice_path, subtitle_path, output_path)
            
            # 3. FFmpeg 실행
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=300
            )
            
            if result.returncode != 0:
                raise Exception(f"FFmpeg error: {result.stderr}")
            
            if not os.path.exists(output_path):
                raise Exception("Video file not created")
            
            return {
                'success': True,
                'file_path': output_path,
                'duration': sum(s.get('duration', 5) for s in scenes)
            }
            
        except Exception as e:
            logger.error(f"FFmpeg rendering error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _create_subtitle_file(self, scenes: List[Dict[str, Any]]) -> str:
        """자막 파일 생성 (SRT 형식)"""
        subtitle_path = os.path.join(tempfile.gettempdir(), "subtitles.srt")
        
        with open(subtitle_path, 'w', encoding='utf-8') as f:
            subtitle_index = 1
            for scene in scenes:
                if 'subtitle' in scene and scene['subtitle']:
                    sub = scene['subtitle']
                    start_time = self._format_srt_time(sub.get('start', 0))
                    end_time = self._format_srt_time(sub.get('end', sub.get('start', 0) + 5))
                    text = sub.get('text', '')
                    
                    f.write(f"{subtitle_index}\n")
                    f.write(f"{start_time} --> {end_time}\n")
                    f.write(f"{text}\n\n")
                    subtitle_index += 1
        
        return subtitle_path
    
    def _format_srt_time(self, seconds: float) -> str:
        """SRT 시간 형식으로 변환"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"
    
    def _build_ffmpeg_command(
        self,
        scenes: List[Dict[str, Any]],
        voice_path: str,
        subtitle_path: str,
        output_path: str
    ) -> List[str]:
        """FFmpeg 명령 생성"""
        # 첫 번째 Scene의 이미지 사용 (간단화)
        first_scene = scenes[0]
        image_path = first_scene.get('image', 'templates/default_character.png')
        total_duration = sum(s.get('duration', 5) for s in scenes)
        
        # 기본 명령
        command = [
            'ffmpeg', '-y',
            '-loop', '1',
            '-t', str(total_duration),
            '-i', image_path
        ]
        
        # 음성 추가
        if voice_path and os.path.exists(voice_path):
            command.extend(['-i', voice_path])
        
        # 필터 생성
        filters = []
        
        # 스케일
        filters.append('scale=1080:1920')
        
        # 자막
        if os.path.exists(subtitle_path):
            filters.append(f"subtitles={subtitle_path}")
        
        # 필터 적용
        if filters:
            command.extend(['-vf', ','.join(filters)])
        
        # 오디오 믹싱
        if voice_path and os.path.exists(voice_path):
            command.extend(['-c:a', 'aac', '-b:a', '128k'])
        else:
            command.extend(['-an'])  # 오디오 없음
        
        # 출력 설정
        command.extend([
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-pix_fmt', 'yuv420p',
            output_path
        ])
        
        return command
