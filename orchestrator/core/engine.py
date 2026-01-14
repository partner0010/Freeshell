"""
Engine 추상 클래스
"""

from abc import ABC, abstractmethod
from enum import Enum
from typing import Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime


class EngineType(Enum):
    """Engine 타입"""
    AI = "ai"
    RULE = "rule"
    TEMPLATE = "template"
    EXPERT = "expert"


@dataclass
class EngineResult:
    """Engine 실행 결과"""
    success: bool
    data: Any
    engine_name: str
    engine_type: EngineType
    execution_time: float
    error: Optional[str] = None
    metadata: Dict[str, Any] = None
    fallback_available: bool = True
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


class Engine(ABC):
    """Engine 추상 클래스"""
    
    def __init__(self, name: str, engine_type: EngineType, priority: int = 0):
        self.name = name
        self.engine_type = engine_type
        self.priority = priority  # 낮을수록 우선순위 높음
        self.enabled = True
    
    @abstractmethod
    async def execute(self, input_data: Dict[str, Any]) -> EngineResult:
        """
        Engine 실행
        
        Args:
            input_data: 입력 데이터
            
        Returns:
            EngineResult: 실행 결과
        """
        pass
    
    @abstractmethod
    def can_handle(self, intent: str, context: Dict[str, Any]) -> bool:
        """
        처리 가능 여부 확인
        
        Args:
            intent: 사용자 의도
            context: 컨텍스트
            
        Returns:
            bool: 처리 가능 여부
        """
        pass
    
    def get_priority(self) -> int:
        """우선순위 반환"""
        return self.priority
    
    def is_enabled(self) -> bool:
        """활성화 여부"""
        return self.enabled
    
    def disable(self):
        """비활성화"""
        self.enabled = False
    
    def enable(self):
        """활성화"""
        self.enabled = True
    
    def __repr__(self) -> str:
        return f"<Engine: {self.name} ({self.engine_type.value})>"
