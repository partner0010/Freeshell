"""
GPU 가속 렌더링 (선택적)
"""

import os
import subprocess
from typing import List
from .scene_schema import Scene
from .ffmpeg_renderer import FFmpegRenderer
from ..utils.logger import get_logger

logger = get_logger(__name__)


class GPURenderer(FFmpegRenderer):
    """GPU 가속 렌더러"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.gpu_available = self._check_gpu_availability()
    
    def _check_gpu_availability(self) -> bool:
        """GPU 사용 가능 여부 확인"""
        # NVIDIA GPU 확인
        try:
            result = subprocess.run(
                ['nvidia-smi'],
                capture_output=True,
                timeout=5
            )
            if result.returncode == 0:
                logger.info("NVIDIA GPU detected")
                return True
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass
        
        # AMD GPU 확인 (선택적)
        try:
            result = subprocess.run(
                ['rocm-smi'],
                capture_output=True,
                timeout=5
            )
            if result.returncode == 0:
                logger.info("AMD GPU detected")
                return True
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass
        
        logger.info("No GPU detected, using CPU")
        return False
    
    def _build_scene_command(self, scene: Scene, output_path: str) -> List[str]:
        """GPU 가속 명령 생성"""
        command = super()._build_scene_command(scene, output_path)
        
        if self.gpu_available and self.use_gpu:
            # GPU 인코더 사용
            # NVIDIA: h264_nvenc
            # AMD: h264_amf
            # Intel: h264_qsv
            
            # NVIDIA 우선 시도
            if self._has_nvidia():
                # h264_nvenc로 변경
                for i, arg in enumerate(command):
                    if arg == '-c:v' and i + 1 < len(command):
                        command[i + 1] = 'h264_nvenc'
                        # 추가 GPU 옵션
                        command.insert(i + 2, '-preset')
                        command.insert(i + 3, 'fast')
                        command.insert(i + 4, '-gpu')
                        command.insert(i + 5, '0')
                        break
            elif self._has_amd():
                # h264_amf로 변경
                for i, arg in enumerate(command):
                    if arg == '-c:v' and i + 1 < len(command):
                        command[i + 1] = 'h264_amf'
                        break
        
        return command
    
    def _has_nvidia(self) -> bool:
        """NVIDIA GPU 확인"""
        try:
            result = subprocess.run(
                ['nvidia-smi'],
                capture_output=True,
                timeout=5
            )
            return result.returncode == 0
        except:
            return False
    
    def _has_amd(self) -> bool:
        """AMD GPU 확인"""
        try:
            result = subprocess.run(
                ['rocm-smi'],
                capture_output=True,
                timeout=5
            )
            return result.returncode == 0
        except:
            return False
