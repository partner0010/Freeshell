"""
FFmpeg 공통 유틸리티 (코드 중복 제거)
"""

import os
from typing import List, Dict, Any
from datetime import datetime

from .logger import get_logger

logger = get_logger(__name__)


class FFmpegCommandBuilder:
    """FFmpeg 명령 생성 유틸리티"""
    
    @staticmethod
    def build_video_command(
        input_path: str,
        output_path: str,
        duration: float,
        width: int = 1080,
        height: int = 1920,
        fps: int = 30,
        subtitle_path: str = None,
        audio_path: str = None,
        filters: List[str] = None
    ) -> List[str]:
        """
        비디오 렌더링 명령 생성
        
        Args:
            input_path: 입력 파일 경로
            output_path: 출력 파일 경로
            duration: 영상 길이
            width: 너비
            height: 높이
            fps: 프레임레이트
            subtitle_path: 자막 파일 경로
            audio_path: 오디오 파일 경로
            filters: 추가 필터
        
        Returns:
            FFmpeg 명령 리스트
        """
        command = [
            'ffmpeg', '-y',
            '-loop', '1',
            '-t', str(duration),
            '-i', input_path
        ]
        
        # 오디오 추가
        if audio_path and os.path.exists(audio_path):
            command.extend(['-i', audio_path])
        
        # 필터 생성
        filter_list = []
        
        # 기본 스케일 (9:16)
        filter_list.append(f'scale={width}:{height}:force_original_aspect_ratio=decrease')
        filter_list.append(f'pad={width}:{height}:(ow-iw)/2:(oh-ih)/2')
        
        # 자막 추가
        if subtitle_path and os.path.exists(subtitle_path):
            subtitle_filter = f"subtitles={subtitle_path}:force_style='FontName=Arial,FontSize=24,PrimaryColour=&Hffffff,OutlineColour=&H000000,Outline=2'"
            filter_list.append(subtitle_filter)
        
        # 추가 필터
        if filters:
            filter_list.extend(filters)
        
        # 필터 적용
        if filter_list:
            command.extend(['-vf', ','.join(filter_list)])
        
        # 오디오 설정
        if audio_path and os.path.exists(audio_path):
            command.extend(['-c:a', 'aac', '-b:a', '128k'])
        else:
            command.extend(['-an'])
        
        # 출력 설정
        command.extend([
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-pix_fmt', 'yuv420p',
            '-r', str(fps),
            '-movflags', '+faststart',
            output_path
        ])
        
        return command
    
    @staticmethod
    def format_srt_time(seconds: float) -> str:
        """SRT 시간 형식으로 변환"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"
