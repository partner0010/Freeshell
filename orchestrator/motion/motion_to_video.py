"""
모션 데이터를 영상으로 변환
"""

import os
import subprocess
import tempfile
from typing import Dict, Any, Optional
from pathlib import Path

from .motion_schema import MotionData
from ..video.scene_schema import Scene, Character, Position
from ..utils.logger import get_logger

logger = get_logger(__name__)


class MotionToVideoConverter:
    """모션 데이터를 영상으로 변환"""
    
    def __init__(self, output_dir: str = "output"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
    
    async def convert_to_scene(
        self,
        motion_data: MotionData,
        voice_path: Optional[str] = None
    ) -> Scene:
        """
        MotionData를 Scene으로 변환
        
        Args:
            motion_data: 모션 데이터
            voice_path: 음성 파일 경로 (선택)
            
        Returns:
            Scene: Scene 객체
        """
        from ..video.scene_schema import Background, Voice as SceneVoice
        
        # Character 생성
        character = Character(
            id="char_001",
            name="Character",
            image_path=motion_data.image_path,
            position=Position(x=0.5, y=0.5),
            scale=1.0
        )
        
        # 모션 데이터를 Character에 적용
        if motion_data.expressions:
            # 첫 번째 표정 사용
            first_expr = motion_data.expressions[0]
            from .motion_schema import ExpressionType
            emotion_map = {
                ExpressionType.HAPPY: "happy",
                ExpressionType.SAD: "sad",
                ExpressionType.ANGRY: "angry",
                ExpressionType.SURPRISED: "surprised",
                ExpressionType.EXCITED: "excited",
                ExpressionType.CALM: "calm"
            }
            character.emotion = emotion_map.get(first_expr.type, "neutral")
        
        # Background
        background = Background(
            type="color",
            source="0x000000"  # 검은 배경
        )
        
        # Voice
        scene_voice = None
        if voice_path and os.path.exists(voice_path):
            scene_voice = SceneVoice(
                text="",  # 자막에서 처리
                file_path=voice_path,
                start_time=0.0,
                duration=motion_data.duration
            )
        
        # Scene 생성
        scene = Scene(
            id="motion_scene",
            duration=motion_data.duration,
            background=background,
            characters=[character],
            voice=scene_voice
        )
        
        # 모션 데이터를 Scene의 effects에 표시
        scene.effects.append('motion_applied')
        # motion_data는 별도로 관리 (Scene 확장 필요 시)
        
        return scene
    
    def apply_motion_to_video(
        self,
        image_path: str,
        motion_data: MotionData,
        output_path: str,
        fps: int = 30
    ) -> str:
        """
        모션을 적용한 영상 생성 (FFmpeg 직접 사용)
        
        Args:
            image_path: 이미지 경로
            motion_data: 모션 데이터
            output_path: 출력 경로
            fps: 프레임레이트
            
        Returns:
            str: 생성된 영상 경로
        """
        # FFmpeg 필터 생성
        filters = []
        
        # 기본 이미지 입력
        input_stream = "[0:v]"
        
        # 호흡 모션 (스케일 변화)
        if motion_data.breath:
            breath = motion_data.breath
            scale_filter = (
                f"scale=iw*(1+{breath.intensity}*sin(2*PI*t/{breath.cycle_duration}+{breath.start_phase})):"
                f"ih*(1+{breath.intensity}*sin(2*PI*t/{breath.cycle_duration}+{breath.start_phase}))"
            )
            filters.append(f"{input_stream}{scale_filter}[breath]")
            input_stream = "[breath]"
        
        # 고개 모션 (회전)
        if motion_data.head and motion_data.head.nod_enabled:
            rotation = f"rotate={motion_data.head.tilt_angle}*PI/180:fillcolor=black@0"
            filters.append(f"{input_stream}{rotation}[head]")
            input_stream = "[head]"
        
        # 최종 출력
        filters.append(f"{input_stream}scale=1080:1920[out]")
        
        # FFmpeg 명령
        command = [
            'ffmpeg', '-y',
            '-loop', '1',
            '-t', str(motion_data.duration),
            '-i', image_path,
            '-vf', ';'.join(filters),
            '-r', str(fps),
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
        
        return output_path
