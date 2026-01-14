"""
모션 적용기 (OpenCV/FFmpeg 기준)
"""

from typing import Dict, Any, Optional
import os
import subprocess
import tempfile
import json

from ..utils.logger import get_logger

logger = get_logger(__name__)


class MotionApplierV2:
    """모션 적용기 (MVP 수준)"""
    
    def __init__(self, output_dir: str = "storage/motion_videos"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
    
    def apply_motion(
        self,
        image_path: str,
        motion_json: Dict[str, Any],
        duration: float = 5.0,
        output_path: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        모션 적용
        
        Args:
            image_path: 이미지 경로
            motion_json: 모션 JSON
            duration: 영상 길이
            output_path: 출력 경로
            
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
            filters = self._build_motion_filters(motion_json, duration)
            
            # FFmpeg 명령
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
                output_path
            ]
            
            # 실행
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
                'duration': duration
            }
            
        except Exception as e:
            logger.error(f"Motion application failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _build_motion_filters(self, motion_json: Dict[str, Any], duration: float) -> str:
        """FFmpeg 필터 생성"""
        motion = motion_json.get('motion', {})
        filters = []
        input_stream = "[0:v]"
        
        # 호흡 모션 (스케일 변화)
        if motion.get('breath') == 'soft':
            scale_expr = "scale=iw*(1+0.02*sin(2*PI*t/3)):ih*(1+0.02*sin(2*PI*t/3))"
            filters.append(f"{input_stream}{scale_expr}[breath]")
            input_stream = "[breath]"
        
        # 고개 모션 (간단한 이동)
        if motion.get('head') == 'tilt_left':
            # 간단한 상하 이동
            crop_expr = "crop=iw:ih-20:0:10*sin(2*PI*t/2)"
            filters.append(f"{input_stream}{crop_expr}[head]")
            input_stream = "[head]"
        
        # 최종 출력
        filters.append(f"{input_stream}scale=1080:1920[out]")
        
        return ';'.join(filters)
