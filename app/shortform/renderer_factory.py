"""
Renderer Factory - GPU/CPU 자동 선택
"""

import os
import subprocess
from typing import Optional

from .ffmpeg_renderer import FFmpegRenderer
from ..utils.logger import get_logger

logger = get_logger(__name__)


class RendererFactory:
    """Renderer Factory"""
    
    @staticmethod
    def create_renderer(
        output_path: str,
        width: int = 1080,
        height: int = 1920,
        fps: int = 30,
        force_cpu: bool = False
    ) -> FFmpegRenderer:
        """
        Renderer 생성 (GPU/CPU 자동 선택)
        
        Args:
            output_path: 출력 파일 경로
            width: 영상 너비
            height: 영상 높이
            fps: 프레임레이트
            force_cpu: CPU 강제 사용
            
        Returns:
            FFmpegRenderer: Renderer 인스턴스
        """
        use_gpu = os.getenv('USE_GPU', 'auto').lower()
        
        if force_cpu or use_gpu == 'false':
            logger.info("Using CPU renderer")
            return FFmpegRenderer(output_path)
        
        if use_gpu == 'true' or use_gpu == 'auto':
            # GPU 사용 가능 여부 확인
            if RendererFactory._check_gpu_available():
                logger.info("Using GPU renderer")
                # GPU 렌더러는 별도 구현 필요
                # 현재는 CPU 사용
                return FFmpegRenderer(output_path)
            else:
                logger.info("GPU not available, using CPU renderer")
                return FFmpegRenderer(output_path)
        
        return FFmpegRenderer(output_path)
    
    @staticmethod
    def _check_gpu_available() -> bool:
        """GPU 사용 가능 여부 확인"""
        try:
            # NVIDIA GPU 확인
            result = subprocess.run(
                ['nvidia-smi'],
                capture_output=True,
                timeout=5
            )
            if result.returncode == 0:
                return True
        except:
            pass
        
        try:
            # AMD GPU 확인
            result = subprocess.run(
                ['rocm-smi'],
                capture_output=True,
                timeout=5
            )
            if result.returncode == 0:
                return True
        except:
            pass
        
        return False
