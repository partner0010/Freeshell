"""
모션 적용기 (FFmpeg 기반)
"""

from typing import Dict, Any, Optional
import os
import subprocess
import tempfile
from pathlib import Path

from .motion_schema import MotionData
from ..utils.logger import get_logger

logger = get_logger(__name__)


class MotionApplier:
    """모션 적용기 - FFmpeg를 사용한 실제 모션 적용"""
    
    def __init__(self, output_dir: str = "storage/motion_videos"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
    
    async def apply_motion(
        self,
        image_path: str,
        motion_data: MotionData,
        output_path: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        모션 적용
        
        Args:
            image_path: 이미지 경로
            motion_data: 모션 데이터
            output_path: 출력 경로 (선택)
            
        Returns:
            생성 결과
        """
        if not output_path:
            output_path = os.path.join(
                self.output_dir,
                f"motion_{hash(image_path) % 1000000}.mp4"
            )
        
        try:
            # FFmpeg 필터 생성
            filters = self._build_motion_filters(motion_data)
            
            # FFmpeg 명령 생성
            command = [
                'ffmpeg', '-y',
                '-loop', '1',
                '-t', str(motion_data.duration),
                '-i', image_path,
                '-vf', filters,
                '-r', '30',
                '-c:v', 'libx264',
                '-preset', 'medium',
                '-crf', '23',
                '-pix_fmt', 'yuv420p',
                output_path
            ]
            
            # FFmpeg 실행
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
                'video_path': output_path,
                'duration': motion_data.duration
            }
            
        except Exception as e:
            logger.error(f"Motion application failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _build_motion_filters(self, motion_data: MotionData) -> str:
        """FFmpeg 필터 생성"""
        filters = []
        input_stream = "[0:v]"
        
        # 1. 호흡 모션 (스케일 변화)
        if motion_data.breath:
            breath = motion_data.breath
            scale_expr = (
                f"scale=iw*(1+{breath.intensity}*"
                f"sin(2*PI*t/{breath.cycle_duration}+{breath.start_phase})):"
                f"ih*(1+{breath.intensity}*"
                f"sin(2*PI*t/{breath.cycle_duration}+{breath.start_phase}))"
            )
            filters.append(f"{input_stream}{scale_expr}[breath]")
            input_stream = "[breath]"
        
        # 2. 고개 모션 (회전)
        if motion_data.head and motion_data.head.nod_enabled:
            # 간단한 상하 움직임 (실제 회전은 복잡)
            nod_expr = (
                f"crop=iw:ih-20:0:10*sin(2*PI*t/{motion_data.head.duration})"
            )
            filters.append(f"{input_stream}{nod_expr}[head]")
            input_stream = "[head]"
        
        # 3. 최종 출력
        filters.append(f"{input_stream}scale=1080:1920[out]")
        
        return ';'.join(filters)
