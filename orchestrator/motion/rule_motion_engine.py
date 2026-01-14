"""
Rule 기반 모션 엔진
"""

import re
from typing import Dict, Any
from datetime import datetime

from ..core.engine import Engine, EngineType, EngineResult
from .motion_schema import ExpressionType, MotionType
from ..utils.logger import get_logger

logger = get_logger(__name__)


class RuleMotionEngine(Engine):
    """Rule 기반 모션 엔진"""
    
    def __init__(self, name: str = "rule_motion_engine", priority: int = 10):
        super().__init__(name, EngineType.RULE, priority)
        self.motion_rules = self._load_rules()
    
    def _load_rules(self) -> Dict[str, Any]:
        """모션 규칙 로드"""
        return {
            'expression_rules': {
                'happy': {
                    'keywords': ['행복', '기쁨', '웃음', 'happy', 'smile', 'joy'],
                    'expression': ExpressionType.HAPPY,
                    'intensity': 0.8
                },
                'sad': {
                    'keywords': ['슬픔', '우울', 'sad', 'depressed'],
                    'expression': ExpressionType.SAD,
                    'intensity': 0.7
                },
                'excited': {
                    'keywords': ['흥분', '신남', 'excited', 'thrilled'],
                    'expression': ExpressionType.EXCITED,
                    'intensity': 0.9
                },
                'calm': {
                    'keywords': ['차분', '평온', 'calm', 'peaceful'],
                    'expression': ExpressionType.CALM,
                    'intensity': 0.5
                }
            },
            'motion_rules': {
                'eye': {
                    'keywords': ['눈', '깜빡', 'eye', 'blink'],
                    'default': {
                        'blink_interval': 3.0,
                        'blink_duration': 0.15
                    }
                },
                'breath': {
                    'keywords': ['호흡', '숨', 'breath'],
                    'default': {
                        'cycle_duration': 3.0,
                        'intensity': 0.02
                    }
                },
                'head': {
                    'keywords': ['고개', '끄덕', 'head', 'nod'],
                    'default': {
                        'nod_enabled': True,
                        'duration': 1.0
                    }
                }
            }
        }
    
    async def execute(self, input_data: Dict[str, Any]) -> EngineResult:
        """Rule 모션 생성"""
        start_time = datetime.now()
        prompt = input_data.get('prompt', '').lower()
        duration = input_data.get('duration', 5.0)
        motion_types = input_data.get('motion_types', [])
        
        motion_data = {}
        
        # 표정 규칙 매칭
        if MotionType.EXPRESSION.value in motion_types:
            expression = self._match_expression(prompt)
            if expression:
                motion_data['expressions'] = [{
                    'type': expression['type'].value,
                    'intensity': expression['intensity'],
                    'duration': duration * 0.5,
                    'start_time': 0.0
                }]
        
        # 눈 모션
        if MotionType.EYE.value in motion_types:
            if any(kw in prompt for kw in self.motion_rules['motion_rules']['eye']['keywords']):
                motion_data['eye'] = self.motion_rules['motion_rules']['eye']['default']
        
        # 호흡 모션
        if MotionType.BREATH.value in motion_types:
            if any(kw in prompt for kw in self.motion_rules['motion_rules']['breath']['keywords']):
                motion_data['breath'] = self.motion_rules['motion_rules']['breath']['default']
        
        # 고개 모션
        if MotionType.HEAD.value in motion_types:
            if any(kw in prompt for kw in self.motion_rules['motion_rules']['head']['keywords']):
                motion_data['head'] = self.motion_rules['motion_rules']['head']['default']
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        if motion_data:
            return EngineResult(
                success=True,
                data=motion_data,
                engine_name=self.name,
                engine_type=self.engine_type,
                execution_time=execution_time,
                fallback_available=False
            )
        else:
            return EngineResult(
                success=False,
                data=None,
                engine_name=self.name,
                engine_type=self.engine_type,
                execution_time=execution_time,
                error="No matching rules",
                fallback_available=True
            )
    
    def _match_expression(self, prompt: str) -> Optional[Dict[str, Any]]:
        """표정 규칙 매칭"""
        for expr_name, rule in self.motion_rules['expression_rules'].items():
            for keyword in rule['keywords']:
                if keyword in prompt:
                    return {
                        'type': rule['expression'],
                        'intensity': rule['intensity']
                    }
        return None
    
    def can_handle(self, intent: str, context: Dict[str, Any]) -> bool:
        """처리 가능 여부"""
        return 'image' in context or 'image_path' in context
