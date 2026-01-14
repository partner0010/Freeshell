"""
모션 데이터 스키마 정의
"""

from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
import json


class MotionType(Enum):
    """모션 타입"""
    EXPRESSION = "expression"  # 표정 변화
    EYE = "eye"  # 눈 깜빡임, 시선
    BREATH = "breath"  # 호흡
    HEAD = "head"  # 고개 움직임
    BODY = "body"  # 몸 움직임
    LIP_SYNC = "lip_sync"  # 입술 동기화
    CUSTOM = "custom"  # 사용자 정의


class ExpressionType(Enum):
    """표정 타입"""
    HAPPY = "happy"
    SAD = "sad"
    ANGRY = "angry"
    SURPRISED = "surprised"
    NEUTRAL = "neutral"
    EXCITED = "excited"
    CALM = "calm"
    WINK = "wink"
    SMILE = "smile"
    FROWN = "frown"


@dataclass
class ExpressionData:
    """표정 데이터"""
    type: ExpressionType
    intensity: float = 1.0  # 0.0 ~ 1.0
    duration: float = 1.0  # 초
    start_time: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': self.type.value,
            'intensity': self.intensity,
            'duration': self.duration,
            'start_time': self.start_time
        }


@dataclass
class EyeMotion:
    """눈 모션"""
    blink_interval: float = 3.0  # 깜빡임 간격 (초)
    blink_duration: float = 0.15  # 깜빡임 지속 시간
    gaze_direction: Tuple[float, float] = (0.0, 0.0)  # 시선 방향 (x, y)
    gaze_duration: float = 2.0  # 시선 유지 시간
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'blink_interval': self.blink_interval,
            'blink_duration': self.blink_duration,
            'gaze_direction': list(self.gaze_direction),
            'gaze_duration': self.gaze_duration
        }


@dataclass
class BreathMotion:
    """호흡 모션"""
    cycle_duration: float = 3.0  # 호흡 주기 (초)
    intensity: float = 0.02  # 움직임 강도 (0.0 ~ 1.0)
    start_phase: float = 0.0  # 시작 위상 (0.0 ~ 1.0)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'cycle_duration': self.cycle_duration,
            'intensity': self.intensity,
            'start_phase': self.start_phase
        }


@dataclass
class HeadMotion:
    """고개 모션"""
    nod_enabled: bool = False  # 고개 끄덕임
    shake_enabled: bool = False  # 고개 흔들기
    tilt_angle: float = 0.0  # 기울기 각도 (도)
    rotation_speed: float = 0.5  # 회전 속도
    duration: float = 1.0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'nod_enabled': self.nod_enabled,
            'shake_enabled': self.shake_enabled,
            'tilt_angle': self.tilt_angle,
            'rotation_speed': self.rotation_speed,
            'duration': self.duration
        }


@dataclass
class BodyMotion:
    """몸 움직임"""
    sway_enabled: bool = False  # 흔들림
    bounce_enabled: bool = False  # 튀는 움직임
    intensity: float = 0.05
    frequency: float = 1.0  # 주파수
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'sway_enabled': self.sway_enabled,
            'bounce_enabled': self.bounce_enabled,
            'intensity': self.intensity,
            'frequency': self.frequency
        }


@dataclass
class LipSyncData:
    """입술 동기화 데이터"""
    phonemes: List[Tuple[float, str]] = field(default_factory=list)  # (시간, 음소)
    viseme_map: Dict[str, str] = field(default_factory=lambda: {
        'A': 'open',
        'E': 'open',
        'I': 'smile',
        'O': 'round',
        'U': 'pucker',
        'M': 'closed',
        'P': 'closed',
        'B': 'closed',
        'F': 'teeth',
        'V': 'teeth',
        'TH': 'tongue',
        'S': 'smile',
        'Z': 'smile'
    })
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'phonemes': [(t, p) for t, p in self.phonemes],
            'viseme_map': self.viseme_map
        }


@dataclass
class MotionData:
    """모션 데이터 통합"""
    image_path: str
    duration: float
    expressions: List[ExpressionData] = field(default_factory=list)
    eye: Optional[EyeMotion] = None
    breath: Optional[BreathMotion] = None
    head: Optional[HeadMotion] = None
    body: Optional[BodyMotion] = None
    lip_sync: Optional[LipSyncData] = None
    custom_motions: List[Dict[str, Any]] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'image_path': self.image_path,
            'duration': self.duration,
            'expressions': [e.to_dict() for e in self.expressions],
            'eye': self.eye.to_dict() if self.eye else None,
            'breath': self.breath.to_dict() if self.breath else None,
            'head': self.head.to_dict() if self.head else None,
            'body': self.body.to_dict() if self.body else None,
            'lip_sync': self.lip_sync.to_dict() if self.lip_sync else None,
            'custom_motions': self.custom_motions
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'MotionData':
        """딕셔너리에서 생성"""
        motion = cls(
            image_path=data['image_path'],
            duration=data['duration']
        )
        
        # Expressions
        if 'expressions' in data:
            for expr_data in data['expressions']:
                motion.expressions.append(ExpressionData(
                    type=ExpressionType(expr_data['type']),
                    intensity=expr_data.get('intensity', 1.0),
                    duration=expr_data.get('duration', 1.0),
                    start_time=expr_data.get('start_time', 0.0)
                ))
        
        # Eye
        if 'eye' in data and data['eye']:
            eye_data = data['eye']
            motion.eye = EyeMotion(
                blink_interval=eye_data.get('blink_interval', 3.0),
                blink_duration=eye_data.get('blink_duration', 0.15),
                gaze_direction=tuple(eye_data.get('gaze_direction', [0.0, 0.0])),
                gaze_duration=eye_data.get('gaze_duration', 2.0)
            )
        
        # Breath
        if 'breath' in data and data['breath']:
            breath_data = data['breath']
            motion.breath = BreathMotion(
                cycle_duration=breath_data.get('cycle_duration', 3.0),
                intensity=breath_data.get('intensity', 0.02),
                start_phase=breath_data.get('start_phase', 0.0)
            )
        
        # Head
        if 'head' in data and data['head']:
            head_data = data['head']
            motion.head = HeadMotion(
                nod_enabled=head_data.get('nod_enabled', False),
                shake_enabled=head_data.get('shake_enabled', False),
                tilt_angle=head_data.get('tilt_angle', 0.0),
                rotation_speed=head_data.get('rotation_speed', 0.5),
                duration=head_data.get('duration', 1.0)
            )
        
        # Body
        if 'body' in data and data['body']:
            body_data = data['body']
            motion.body = BodyMotion(
                sway_enabled=body_data.get('sway_enabled', False),
                bounce_enabled=body_data.get('bounce_enabled', False),
                intensity=body_data.get('intensity', 0.05),
                frequency=body_data.get('frequency', 1.0)
            )
        
        # Lip Sync
        if 'lip_sync' in data and data['lip_sync']:
            lip_data = data['lip_sync']
            motion.lip_sync = LipSyncData(
                phonemes=[(t, p) for t, p in lip_data.get('phonemes', [])],
                viseme_map=lip_data.get('viseme_map', {})
            )
        
        # Custom
        motion.custom_motions = data.get('custom_motions', [])
        
        return motion
