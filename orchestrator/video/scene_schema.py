"""
Scene JSON 스키마 정의
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from enum import Enum
import json


class EmotionType(Enum):
    """감정 타입"""
    HAPPY = "happy"
    SAD = "sad"
    ANGRY = "angry"
    SURPRISED = "surprised"
    NEUTRAL = "neutral"
    EXCITED = "excited"
    CALM = "calm"


class MotionType(Enum):
    """모션 타입"""
    STATIC = "static"
    FADE_IN = "fade_in"
    FADE_OUT = "fade_out"
    ZOOM_IN = "zoom_in"
    ZOOM_OUT = "zoom_out"
    PAN_LEFT = "pan_left"
    PAN_RIGHT = "pan_right"
    SLIDE_UP = "slide_up"
    SLIDE_DOWN = "slide_down"


@dataclass
class Position:
    """위치 정보"""
    x: float = 0.0
    y: float = 0.0
    z: float = 0.0  # 3D용
    
    def to_dict(self) -> Dict[str, float]:
        return {'x': self.x, 'y': self.y, 'z': self.z}


@dataclass
class Character:
    """캐릭터 정보"""
    id: str
    name: str
    image_path: str
    position: Position = field(default_factory=Position)
    scale: float = 1.0
    emotion: EmotionType = EmotionType.NEUTRAL
    motion: MotionType = MotionType.STATIC
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'name': self.name,
            'image_path': self.image_path,
            'position': self.position.to_dict(),
            'scale': self.scale,
            'emotion': self.emotion.value,
            'motion': self.motion.value
        }


@dataclass
class Voice:
    """음성 정보"""
    text: str
    file_path: str
    start_time: float = 0.0
    duration: float = 0.0
    emotion: EmotionType = EmotionType.NEUTRAL
    speaker_id: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'text': self.text,
            'file_path': self.file_path,
            'start_time': self.start_time,
            'duration': self.duration,
            'emotion': self.emotion.value,
            'speaker_id': self.speaker_id
        }


@dataclass
class Subtitle:
    """자막 정보"""
    text: str
    start_time: float
    duration: float
    position: str = "bottom"  # top, center, bottom
    style: Dict[str, Any] = field(default_factory=lambda: {
        'font_size': 24,
        'font_color': '#FFFFFF',
        'background_color': 'rgba(0,0,0,0.5)',
        'font_family': 'Arial'
    })
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'text': self.text,
            'start_time': self.start_time,
            'duration': self.duration,
            'position': self.position,
            'style': self.style
        }


@dataclass
class Background:
    """배경 정보"""
    type: str = "image"  # image, video, color, gradient
    source: str = ""  # 파일 경로 또는 색상 코드
    motion: MotionType = MotionType.STATIC
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': self.type,
            'source': self.source,
            'motion': self.motion.value
        }


@dataclass
class Scene:
    """Scene 정보"""
    id: str
    duration: float  # 초 단위
    background: Background = field(default_factory=Background)
    characters: List[Character] = field(default_factory=list)
    voice: Optional[Voice] = None
    subtitles: List[Subtitle] = field(default_factory=list)
    effects: List[str] = field(default_factory=list)  # 효과 이름 리스트
    transition: Optional[str] = None  # 다음 Scene으로의 전환 효과
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'duration': self.duration,
            'background': self.background.to_dict(),
            'characters': [c.to_dict() for c in self.characters],
            'voice': self.voice.to_dict() if self.voice else None,
            'subtitles': [s.to_dict() for s in self.subtitles],
            'effects': self.effects,
            'transition': self.transition
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Scene':
        """딕셔너리에서 생성"""
        scene = cls(
            id=data['id'],
            duration=data['duration']
        )
        
        # Background
        if 'background' in data:
            bg_data = data['background']
            scene.background = Background(
                type=bg_data.get('type', 'image'),
                source=bg_data.get('source', ''),
                motion=MotionType(bg_data.get('motion', 'static'))
            )
        
        # Characters
        if 'characters' in data:
            for char_data in data['characters']:
                char = Character(
                    id=char_data['id'],
                    name=char_data.get('name', ''),
                    image_path=char_data['image_path'],
                    position=Position(**char_data.get('position', {})),
                    scale=char_data.get('scale', 1.0),
                    emotion=EmotionType(char_data.get('emotion', 'neutral')),
                    motion=MotionType(char_data.get('motion', 'static'))
                )
                scene.characters.append(char)
        
        # Voice
        if 'voice' in data and data['voice']:
            voice_data = data['voice']
            scene.voice = Voice(
                text=voice_data['text'],
                file_path=voice_data['file_path'],
                start_time=voice_data.get('start_time', 0.0),
                duration=voice_data.get('duration', 0.0),
                emotion=EmotionType(voice_data.get('emotion', 'neutral')),
                speaker_id=voice_data.get('speaker_id')
            )
        
        # Subtitles
        if 'subtitles' in data:
            for sub_data in data['subtitles']:
                subtitle = Subtitle(
                    text=sub_data['text'],
                    start_time=sub_data['start_time'],
                    duration=sub_data['duration'],
                    position=sub_data.get('position', 'bottom'),
                    style=sub_data.get('style', {})
                )
                scene.subtitles.append(subtitle)
        
        # Effects & Transition
        scene.effects = data.get('effects', [])
        scene.transition = data.get('transition')
        
        return scene


def validate_scene_json(scene_data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """Scene JSON 유효성 검사"""
    required_fields = ['id', 'duration']
    for field in required_fields:
        if field not in scene_data:
            return False, f"Missing required field: {field}"
    
    if not isinstance(scene_data['duration'], (int, float)) or scene_data['duration'] <= 0:
        return False, "duration must be a positive number"
    
    return True, None
