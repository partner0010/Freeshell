"""
Task Plan 생성
"""

from typing import Dict, Any, List
from dataclasses import dataclass

from ..utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class Task:
    """작업 단위"""
    name: str
    engine_type: str  # "ai", "rule", "fallback"
    required: bool = True
    parameters: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.parameters is None:
            self.parameters = {}


def build_plan(intent: Dict[str, Any], request: Dict[str, Any]) -> List[Task]:
    """
    Task Plan 생성
    
    Args:
        intent: 분석된 Intent
        request: 원본 요청
        
    Returns:
        Task 리스트
    """
    intent_type = intent['type']
    parameters = intent['parameters']
    
    # Intent 타입별 Plan 정의
    plans = {
        'shortform': _build_shortform_plan(parameters),
        'image': _build_image_plan(parameters),
        'motion': _build_motion_plan(parameters),
        'voice': _build_voice_plan(parameters)
    }
    
    plan = plans.get(intent_type, _build_shortform_plan(parameters))
    
    logger.info(f"Plan built: {len(plan)} tasks for {intent_type}")
    return plan


def _build_shortform_plan(parameters: Dict[str, Any]) -> List[Task]:
    """숏폼 생성 Plan"""
    return [
        Task(
            name="generate_script",
            engine_type="ai",
            required=True,
            parameters={'prompt': parameters.get('prompt', '')}
        ),
        Task(
            name="create_scenes",
            engine_type="ai",
            required=True,
            parameters={
                'duration': parameters.get('duration', 30),
                'style': parameters.get('style', 'animation')
            }
        ),
        Task(
            name="generate_voice",
            engine_type="ai",
            required=True,
            parameters={}
        ),
        Task(
            name="generate_subtitles",
            engine_type="rule",
            required=True,
            parameters={}
        ),
        Task(
            name="render_video",
            engine_type="rule",
            required=True,
            parameters={
                'duration': parameters.get('duration', 30)
            }
        )
    ]


def _build_image_plan(parameters: Dict[str, Any]) -> List[Task]:
    """이미지 생성 Plan"""
    return [
        Task(
            name="generate_image",
            engine_type="ai",
            required=True,
            parameters={
                'prompt': parameters.get('prompt', ''),
                'style': parameters.get('style', 'animation')
            }
        )
    ]


def _build_motion_plan(parameters: Dict[str, Any]) -> List[Task]:
    """모션 생성 Plan"""
    return [
        Task(
            name="analyze_image",
            engine_type="rule",
            required=True,
            parameters={}
        ),
        Task(
            name="select_motion",
            engine_type="rule",
            required=True,
            parameters={
                'prompt': parameters.get('prompt', '')
            }
        ),
        Task(
            name="apply_motion",
            engine_type="rule",
            required=True,
            parameters={}
        )
    ]


def _build_voice_plan(parameters: Dict[str, Any]) -> List[Task]:
    """음성 생성 Plan"""
    return [
        Task(
            name="generate_voice",
            engine_type="ai",
            required=True,
            parameters={
                'text': parameters.get('text', ''),
                'emotion': parameters.get('emotion', 'neutral')
            }
        )
    ]
