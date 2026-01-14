"""
사전 정의 모션 템플릿
"""

from typing import Dict, Any
from .motion_schema import (
    MotionData, ExpressionData, EyeMotion, BreathMotion,
    HeadMotion, ExpressionType
)


class MotionTemplates:
    """모션 템플릿 관리"""
    
    def get_default_motion(self, duration: float = 5.0) -> MotionData:
        """기본 모션 (항상 사용 가능)"""
        return MotionData(
            image_path="",
            duration=duration,
            expressions=[
                ExpressionData(
                    type=ExpressionType.NEUTRAL,
                    intensity=1.0,
                    duration=duration,
                    start_time=0.0
                )
            ],
            eye=EyeMotion(
                blink_interval=3.0,
                blink_duration=0.15
            ),
            breath=BreathMotion(
                cycle_duration=3.0,
                intensity=0.02
            )
        )
    
    def get_happy_motion(self, duration: float = 5.0) -> MotionData:
        """행복한 모션"""
        motion = self.get_default_motion(duration)
        motion.expressions = [
            ExpressionData(
                type=ExpressionType.HAPPY,
                intensity=0.8,
                duration=duration,
                start_time=0.0
            )
        ]
        return motion
    
    def get_calm_motion(self, duration: float = 5.0) -> MotionData:
        """차분한 모션"""
        motion = self.get_default_motion(duration)
        motion.expressions = [
            ExpressionData(
                type=ExpressionType.CALM,
                intensity=0.6,
                duration=duration,
                start_time=0.0
            )
        ]
        motion.breath.intensity = 0.01  # 더 약한 호흡
        return motion
    
    def get_excited_motion(self, duration: float = 5.0) -> MotionData:
        """흥분한 모션"""
        motion = self.get_default_motion(duration)
        motion.expressions = [
            ExpressionData(
                type=ExpressionType.EXCITED,
                intensity=0.9,
                duration=duration,
                start_time=0.0
            )
        ]
        motion.breath.intensity = 0.05  # 더 강한 호흡
        motion.head = HeadMotion(
            nod_enabled=True,
            duration=0.5,
            rotation_speed=1.0
        )
        return motion
    
    def get_template(self, template_name: str, duration: float = 5.0) -> MotionData:
        """템플릿 조회"""
        templates = {
            'default': self.get_default_motion,
            'happy': self.get_happy_motion,
            'calm': self.get_calm_motion,
            'excited': self.get_excited_motion
        }
        
        template_func = templates.get(template_name, self.get_default_motion)
        return template_func(duration)
