"""
Rule-based Engine 구현
"""

import re
from typing import Dict, Any
from datetime import datetime

from ..core.engine import Engine, EngineType, EngineResult
from ..utils.logger import get_logger

logger = get_logger(__name__)


class RuleEngine(Engine):
    """Rule-based Engine - 규칙 기반 생성"""
    
    def __init__(self, name: str = "rule_engine", priority: int = 10):
        super().__init__(name, EngineType.RULE, priority)
        self.rules = self._load_rules()
    
    def _load_rules(self) -> Dict[str, Any]:
        """규칙 로드"""
        return {
            'greeting': {
                'patterns': [r'안녕', r'hello', r'hi'],
                'response': '안녕하세요! 무엇을 도와드릴까요?'
            },
            'blog_intro': {
                'patterns': [r'블로그.*소개', r'블로그.*인트로'],
                'template': '안녕하세요, {topic}에 대해 이야기하겠습니다. 이 글에서는 {points}를 다루겠습니다.'
            },
            'email_template': {
                'patterns': [r'이메일', r'email'],
                'template': '''제목: {subject}

안녕하세요 {name}님,

{content}

감사합니다.
{signature}'''
            }
        }
    
    async def execute(self, input_data: Dict[str, Any]) -> EngineResult:
        """Rule 실행"""
        start_time = datetime.now()
        prompt = input_data.get('prompt', '').lower()
        intent = input_data.get('intent', '')
        
        # 규칙 매칭
        for rule_name, rule in self.rules.items():
            for pattern in rule.get('patterns', []):
                if re.search(pattern, prompt) or (intent and intent == rule_name):
                    # 템플릿 처리
                    if 'template' in rule:
                        result = self._apply_template(rule['template'], input_data)
                    else:
                        result = rule.get('response', '')
                    
                    execution_time = (datetime.now() - start_time).total_seconds()
                    return EngineResult(
                        success=True,
                        data=result,
                        engine_name=self.name,
                        engine_type=self.engine_type,
                        execution_time=execution_time,
                        metadata={'rule': rule_name},
                        fallback_available=False
                    )
        
        # 매칭되는 규칙 없음
        execution_time = (datetime.now() - start_time).total_seconds()
        return EngineResult(
            success=False,
            data=None,
            engine_name=self.name,
            engine_type=self.engine_type,
            execution_time=execution_time,
            error="No matching rule found",
            fallback_available=True
        )
    
    def _apply_template(self, template: str, input_data: Dict[str, Any]) -> str:
        """템플릿 적용"""
        result = template
        for key, value in input_data.items():
            result = result.replace(f'{{{key}}}', str(value))
        return result
    
    def can_handle(self, intent: str, context: Dict[str, Any]) -> bool:
        """처리 가능 여부"""
        prompt = context.get('prompt', '').lower()
        for rule in self.rules.values():
            for pattern in rule.get('patterns', []):
                if re.search(pattern, prompt):
                    return True
        return False
