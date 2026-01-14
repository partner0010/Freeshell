"""
Fallback Chain 정의
"""

from enum import Enum
from typing import List, Dict, Any
from ..core.engine import EngineType


class FallbackChain:
    """Fallback Chain 정의"""
    
    # Engine 타입별 Fallback 순서
    CHAINS = {
        EngineType.AI: [
            EngineType.AI,      # 다른 AI 시도
            EngineType.RULE,    # Rule Engine
            EngineType.TEMPLATE, # Template Engine
            EngineType.EXPERT   # Expert 매칭
        ],
        EngineType.RULE: [
            EngineType.RULE,    # 다른 Rule 시도
            EngineType.TEMPLATE,
            EngineType.EXPERT
        ],
        EngineType.TEMPLATE: [
            EngineType.TEMPLATE, # 다른 Template 시도
            EngineType.EXPERT
        ],
        EngineType.EXPERT: [
            EngineType.EXPERT   # 다른 Expert 시도
        ]
    }
    
    @classmethod
    def get_chain(cls, engine_type: EngineType) -> List[EngineType]:
        """Fallback Chain 반환"""
        return cls.CHAINS.get(engine_type, [EngineType.EXPERT])
    
    @classmethod
    def get_next_engine_type(cls, current_type: EngineType, tried_types: List[EngineType]) -> EngineType:
        """다음 Engine 타입 반환"""
        chain = cls.get_chain(current_type)
        
        for engine_type in chain:
            if engine_type not in tried_types:
                return engine_type
        
        # 모든 타입 시도했으면 Expert 반환
        return EngineType.EXPERT
