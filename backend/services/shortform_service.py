"""
숏폼 생성 서비스 (AI 없이 동작)
"""

import os
import subprocess
import tempfile
import json
from typing import Dict, Any, List, Optional
from pathlib import Path
from datetime import datetime

from ..utils.logger import get_logger

logger = get_logger(__name__)


class ShortformService:
    """숏폼 생성 서비스 (AI 독립)"""
    
    def __init__(self, output_dir: str = "storage/videos"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        self.temp_dir = os.path.join(output_dir, "temp")
        os.makedirs(self.temp_dir, exist_ok=True)
    
    def generate_from_scene_json(
        self,
        scene_json: Dict[str, Any],
        output_filename: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Scene JSON으로부터 숏폼 생성
        
        Args:
            scene_json: Scene JSON 데이터
            output_filename: 출력 파일명 (선택)
        
        Returns:
            생성 결과
        """
        try:
            # Scene JSON 검증
            scenes = scene_json.get('scenes', [])
            if not scenes:
                return {
                    'success': False,
                    'error': 'No scenes provided'
                }
            
            # 출력 파일명 생성
            if not output_filename:
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                output_filename = f"shortform_{timestamp}.mp4"
            
            output_path = os.path.join(self.output_dir, output_filename)
            
            # FFmpeg 렌더링
            result = self._render_video(scenes, output_path)
            
            if result['success']:
                return {
                    'success': True,
                    'file_path': output_path,
                    'filename': output_filename,
                    'duration': result.get('duration', 0),
                    'scenes_count': len(scenes)
                }
            else:
                return result
                
        except Exception as e:
            logger.error(f"Shortform generation error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _render_video(
        self,
        scenes: List[Dict[str, Any]],
        output_path: str
    ) -> Dict[str, Any]:
        """
        FFmpeg로 영상 렌더링
        
        Args:
            scenes: Scene 배열
            output_path: 출력 경로
        
        Returns:
            렌더링 결과
        """
        try:
            # 총 길이 계산
            total_duration = sum(s.get('duration', 5) for s in scenes)
            
            # 첫 번째 Scene의 이미지 사용 (간단화)
            first_scene = scenes[0]
            image_path = first_scene.get('image', 'templates/default_character.png')
            
            # 이미지 파일 존재 확인
            if not os.path.exists(image_path):
                logger.warning(f"Image not found: {image_path}, using default")
                image_path = 'templates/default_character.png'
            
            # 자막 파일 생성
            subtitle_path = self._create_subtitle_file(scenes)
            
            # FFmpeg 명령 생성
            command = self._build_ffmpeg_command(
                image_path,
                subtitle_path,
                total_duration,
                output_path
            )
            
            # FFmpeg 실행
            logger.info(f"Executing FFmpeg: {' '.join(command)}")
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=300
            )
            
            if result.returncode != 0:
                logger.error(f"FFmpeg error: {result.stderr}")
                return {
                    'success': False,
                    'error': f"FFmpeg failed: {result.stderr}"
                }
            
            if not os.path.exists(output_path):
                return {
                    'success': False,
                    'error': 'Video file not created'
                }
            
            # 파일 크기 확인
            file_size = os.path.getsize(output_path)
            
            return {
                'success': True,
                'duration': total_duration,
                'file_size': file_size
            }
            
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'error': 'FFmpeg timeout'
            }
        except Exception as e:
            logger.error(f"Video rendering error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _create_subtitle_file(self, scenes: List[Dict[str, Any]]) -> str:
        """자막 파일 생성 (SRT 형식)"""
        subtitle_path = os.path.join(self.temp_dir, f"subtitles_{datetime.now().strftime('%Y%m%d_%H%M%S')}.srt")
        
        with open(subtitle_path, 'w', encoding='utf-8') as f:
            subtitle_index = 1
            current_time = 0.0
            
            for scene in scenes:
                if 'subtitle' in scene and scene['subtitle']:
                    sub = scene['subtitle']
                    start_time = sub.get('start', current_time)
                    end_time = sub.get('end', start_time + scene.get('duration', 5))
                    text = sub.get('text', '')
                    
                    f.write(f"{subtitle_index}\n")
                    f.write(f"{self._format_srt_time(start_time)} --> {self._format_srt_time(end_time)}\n")
                    f.write(f"{text}\n\n")
                    subtitle_index += 1
                    current_time = end_time
        
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
        image_path: str,
        subtitle_path: str,
        duration: float,
        output_path: str
    ) -> List[str]:
        """
        FFmpeg 명령 생성 (최적화된 버전)
        
        최신 FFmpeg 베스트 프랙티스 적용:
        - H.264 코덱 (libx264)
        - CRF 23 (고품질)
        - 9:16 비율 (1080x1920)
        - 30fps
        - 하드웨어 가속 지원 (가능한 경우)
        """
        command = [
            'ffmpeg', '-y',
            '-loop', '1',
            '-t', str(duration),
            '-i', image_path
        ]
        
        # 필터 생성
        filters = []
        
        # 스케일 (9:16 비율)
        filters.append('scale=1080:1920:force_original_aspect_ratio=decrease')
        filters.append('pad=1080:1920:(ow-iw)/2:(oh-ih)/2')
        
        # 자막 추가
        if os.path.exists(subtitle_path):
            # 자막 스타일링
            subtitle_filter = f"subtitles={subtitle_path}:force_style='FontName=Arial,FontSize=24,PrimaryColour=&Hffffff,OutlineColour=&H000000,Outline=2'"
            filters.append(subtitle_filter)
        
        # 필터 적용
        if filters:
            command.extend(['-vf', ','.join(filters)])
        
        # 코덱 설정 (최적화)
        command.extend([
            '-c:v', 'libx264',
            '-preset', 'medium',  # 속도/품질 균형
            '-crf', '23',  # 고품질
            '-pix_fmt', 'yuv420p',
            '-r', '30',  # 30fps
            '-movflags', '+faststart',  # 웹 스트리밍 최적화
            output_path
        ])
        
        return command
    
    def get_default_scene_json(self) -> Dict[str, Any]:
        """기본 Scene JSON 반환"""
        return {
            'type': 'shortform',
            'scenes': [
                {
                    'id': 'scene_001',
                    'duration': 5,
                    'image': 'templates/default_character.png',
                    'motion': 'slow_breath',
                    'emotion': 'warm',
                    'subtitle': {
                        'text': '안녕하세요',
                        'start': 0,
                        'end': 4
                    }
                },
                {
                    'id': 'scene_002',
                    'duration': 5,
                    'image': 'templates/default_character.png',
                    'motion': 'slow_breath',
                    'emotion': 'warm',
                    'subtitle': {
                        'text': '이것은 테스트 영상입니다',
                        'start': 5,
                        'end': 9
                    }
                }
            ]
        }
