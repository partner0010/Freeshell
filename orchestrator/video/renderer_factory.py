"""
Renderer Factory - GPU/CPU 자동 선택
"""

import os
from typing import Optional
from .ffmpeg_renderer import FFmpegRenderer
from .gpu_renderer import GPURenderer
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
        audio_sample_rate: int = 44100,
        force_cpu: bool = False
    ) -> FFmpegRenderer:
        """
        Renderer 생성 (GPU/CPU 자동 선택)
        
        Args:
            output_path: 출력 파일 경로
            width: 영상 너비
            height: 영상 높이
            fps: 프레임레이트
            audio_sample_rate: 오디오 샘플레이트
            force_cpu: CPU 강제 사용
            
        Returns:
            FFmpegRenderer: Renderer 인스턴스
        """
        use_gpu = os.getenv('USE_GPU', 'auto').lower()
        
        if force_cpu or use_gpu == 'false':
            logger.info("Using CPU renderer")
            return FFmpegRenderer(
                output_path=output_path,
                width=width,
                height=height,
                fps=fps,
                audio_sample_rate=audio_sample_rate,
                use_gpu=False
            )
        
        if use_gpu == 'true' or use_gpu == 'auto':
            try:
                renderer = GPURenderer(
                    output_path=output_path,
                    width=width,
                    height=height,
                    fps=fps,
                    audio_sample_rate=audio_sample_rate,
                    use_gpu=True
                )
                if renderer.gpu_available:
                    logger.info("Using GPU renderer")
                    return renderer
                else:
                    logger.info("GPU not available, using CPU renderer")
                    return FFmpegRenderer(
                        output_path=output_path,
                        width=width,
                        height=height,
                        fps=fps,
                        audio_sample_rate=audio_sample_rate,
                        use_gpu=False
                    )
            except Exception as e:
                logger.warning(f"GPU renderer creation failed: {e}, falling back to CPU")
                return FFmpegRenderer(
                    output_path=output_path,
                    width=width,
                    height=height,
                    fps=fps,
                    audio_sample_rate=audio_sample_rate,
                    use_gpu=False
                )
        
        # 기본값: CPU
        return FFmpegRenderer(
            output_path=output_path,
            width=width,
            height=height,
            fps=fps,
            audio_sample_rate=audio_sample_rate,
            use_gpu=False
        )
