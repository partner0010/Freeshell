"""
숏폼 서비스 V2 (STEP C: 모션 옵션 통합)
기존 파이프라인에 photo_motion 옵션 추가
"""

import os
from typing import Dict, Any, List, Optional
from datetime import datetime

from .shortform_service import ShortformService
from .motion_service import MotionService
from ..utils.logger import get_logger

logger = get_logger(__name__)


class ShortformServiceV2(ShortformService):
    """숏폼 서비스 V2 (모션 옵션 포함)"""
    
    def __init__(self, output_dir: str = "storage/videos"):
        super().__init__(output_dir)
        self.motion_service = MotionService()
    
    def generate_from_scene_json(
        self,
        scene_json: Dict[str, Any],
        output_filename: Optional[str] = None,
        photo_motion: bool = False
    ) -> Dict[str, Any]:
        """
        Scene JSON으로부터 숏폼 생성 (모션 옵션 포함)
        
        Args:
            scene_json: Scene JSON 데이터
            output_filename: 출력 파일명 (선택)
            photo_motion: 사진 모션 적용 여부
        
        Returns:
            생성 결과
        """
        try:
            scenes = scene_json.get('scenes', [])
            if not scenes:
                return {
                    'success': False,
                    'error': 'No scenes provided'
                }
            
            # photo_motion 옵션이 활성화된 경우
            if photo_motion:
                return self._generate_with_motion(scenes, output_filename)
            else:
                # 기존 로직 유지
                return super().generate_from_scene_json(scene_json, output_filename)
                
        except Exception as e:
            logger.error(f"Shortform V2 generation error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _generate_with_motion(
        self,
        scenes: List[Dict[str, Any]],
        output_filename: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        모션을 적용한 숏폼 생성
        
        각 Scene의 이미지에 모션을 적용한 후 합성
        """
        try:
            motion_videos = []
            
            # 각 Scene에 모션 적용
            for i, scene in enumerate(scenes):
                image_path = scene.get('image', 'templates/default_character.png')
                motion_type = scene.get('motion', 'soft_breath')
                duration = scene.get('duration', 5)
                
                # 모션 적용
                motion_result = self.motion_service.apply_motion_to_image(
                    image_path,
                    motion_type,
                    duration
                )
                
                if not motion_result['success']:
                    logger.warning(f"Motion failed for scene {i}, using original image")
                    # 모션 실패 시 원본 이미지 사용
                    motion_videos.append(image_path)
                else:
                    motion_videos.append(motion_result['file_path'])
            
            # 모션 적용된 비디오들을 합성
            if not output_filename:
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                output_filename = f"shortform_motion_{timestamp}.mp4"
            
            output_path = os.path.join(self.output_dir, output_filename)
            
            # 비디오 합성
            result = self._concatenate_videos(motion_videos, output_path, scenes)
            
            return result
            
        except Exception as e:
            logger.error(f"Motion generation error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _concatenate_videos(
        self,
        video_paths: List[str],
        output_path: str,
        scenes: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """비디오 합성"""
        import subprocess
        
        try:
            # concat 파일 생성
            concat_file = os.path.join(self.temp_dir, f"concat_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt")
            
            with open(concat_file, 'w') as f:
                for video_path in video_paths:
                    if os.path.exists(video_path):
                        f.write(f"file '{os.path.abspath(video_path)}'\n")
            
            # 자막 파일 생성
            subtitle_path = self._create_subtitle_file(scenes)
            
            # FFmpeg 합성 명령
            command = [
                'ffmpeg', '-y',
                '-f', 'concat',
                '-safe', '0',
                '-i', concat_file
            ]
            
            # 필터 생성
            filters = []
            
            # 자막 추가
            if os.path.exists(subtitle_path):
                subtitle_filter = f"subtitles={subtitle_path}:force_style='FontName=Arial,FontSize=24,PrimaryColour=&Hffffff,OutlineColour=&H000000,Outline=2'"
                filters.append(subtitle_filter)
            
            if filters:
                command.extend(['-vf', ','.join(filters)])
            
            command.extend([
                '-c:v', 'libx264',
                '-preset', 'medium',
                '-crf', '23',
                '-pix_fmt', 'yuv420p',
                '-movflags', '+faststart',
                output_path
            ])
            
            # 실행
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=300
            )
            
            if result.returncode != 0:
                return {
                    'success': False,
                    'error': f"FFmpeg concat failed: {result.stderr}"
                }
            
            if not os.path.exists(output_path):
                return {
                    'success': False,
                    'error': 'Video file not created'
                }
            
            total_duration = sum(s.get('duration', 5) for s in scenes)
            
            return {
                'success': True,
                'file_path': output_path,
                'filename': os.path.basename(output_path),
                'duration': total_duration,
                'scenes_count': len(scenes),
                'motion_applied': True
            }
            
        except Exception as e:
            logger.error(f"Video concatenation error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
