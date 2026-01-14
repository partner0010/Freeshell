"""
모션 서비스 (STEP C: 사진→모션)
기존 숏폼 파이프라인에 옵션으로 추가
"""

import os
import subprocess
import tempfile
from typing import Dict, Any, Optional, List
from datetime import datetime
from pathlib import Path

from ..utils.logger import get_logger

logger = get_logger(__name__)


class MotionService:
    """모션 서비스"""
    
    def __init__(self, output_dir: str = "storage/motion_videos"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        self.temp_dir = os.path.join(output_dir, "temp")
        os.makedirs(self.temp_dir, exist_ok=True)
    
    def apply_motion_to_image(
        self,
        image_path: str,
        motion_type: str = "soft_breath",
        duration: float = 5.0,
        output_path: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        이미지에 모션 적용
        
        Args:
            image_path: 이미지 경로
            motion_type: 모션 타입 (soft_breath, slow_blink, gentle_nod 등)
            duration: 영상 길이
            output_path: 출력 경로
        
        Returns:
            생성 결과
        """
        try:
            if not os.path.exists(image_path):
                return {
                    'success': False,
                    'error': f'Image not found: {image_path}'
                }
            
            if not output_path:
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                output_path = os.path.join(self.output_dir, f"motion_{timestamp}.mp4")
            
            # 모션 필터 생성
            filters = self._build_motion_filters(motion_type, duration)
            
            # FFmpeg 명령 생성
            command = [
                'ffmpeg', '-y',
                '-loop', '1',
                '-t', str(duration),
                '-i', image_path,
                '-vf', filters,
                '-r', '30',
                '-c:v', 'libx264',
                '-preset', 'medium',
                '-crf', '23',
                '-pix_fmt', 'yuv420p',
                '-movflags', '+faststart',
                output_path
            ]
            
            # FFmpeg 실행
            logger.info(f"Applying motion {motion_type} to {image_path}")
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
            
            return {
                'success': True,
                'file_path': output_path,
                'duration': duration,
                'motion_type': motion_type
            }
            
        except Exception as e:
            logger.error(f"Motion application error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _build_motion_filters(self, motion_type: str, duration: float) -> str:
        """
        모션 필터 생성
        
        최신 FFmpeg 필터 기법 적용:
        - 부드러운 호흡 효과 (scale 변화)
        - 자연스러운 눈 깜빡임 (crop 변화)
        - 미세한 고개 움직임 (crop offset)
        """
        filters = []
        input_stream = "[0:v]"
        
        # 모션 타입별 필터
        if motion_type == "soft_breath":
            # 부드러운 호흡 (스케일 변화)
            scale_expr = f"scale=iw*(1+0.02*sin(2*PI*t/{duration*0.5})):ih*(1+0.02*sin(2*PI*t/{duration*0.5}))"
            filters.append(f"{input_stream}{scale_expr}[breath]")
            input_stream = "[breath]"
        
        elif motion_type == "slow_blink":
            # 느린 눈 깜빡임 (상하 크롭 변화)
            crop_expr = f"crop=iw:ih*(1-0.05*abs(sin(2*PI*t/{duration*2}))):0:ih*0.05*abs(sin(2*PI*t/{duration*2}))/2"
            filters.append(f"{input_stream}{crop_expr}[blink]")
            input_stream = "[blink]"
        
        elif motion_type == "gentle_nod":
            # 부드러운 고개 끄덕임 (상하 이동)
            crop_expr = f"crop=iw:ih-20:0:10*sin(2*PI*t/{duration*1.5})"
            filters.append(f"{input_stream}{crop_expr}[nod]")
            input_stream = "[nod]"
        
        elif motion_type == "subtle_movement":
            # 미세한 전체 움직임 (호흡 + 고개)
            scale_expr = f"scale=iw*(1+0.015*sin(2*PI*t/{duration*0.6})):ih*(1+0.015*sin(2*PI*t/{duration*0.6}))"
            filters.append(f"{input_stream}{scale_expr}[scale]")
            input_stream = "[scale]"
            crop_expr = f"crop=iw:ih-15:0:7*sin(2*PI*t/{duration*1.2})"
            filters.append(f"{input_stream}{crop_expr}[move]")
            input_stream = "[move]"
        
        # 최종 스케일 (9:16)
        filters.append(f"{input_stream}scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2[out]")
        
        return ';'.join(filters)
    
    def get_available_motions(self) -> List[str]:
        """사용 가능한 모션 타입 목록"""
        return [
            "soft_breath",
            "slow_blink",
            "gentle_nod",
            "subtle_movement"
        ]
