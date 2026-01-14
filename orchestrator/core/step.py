"""
Step 추상 클래스
"""

from abc import ABC, abstractmethod
from enum import Enum
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from datetime import datetime
from .engine import Engine, EngineResult, EngineType


class StepStatus(Enum):
    """Step 상태"""
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class StepResult:
    """Step 실행 결과"""
    step_id: str
    status: StepStatus
    result: Any = None
    error: Optional[str] = None
    engine_used: Optional[str] = None
    execution_time: float = 0.0
    attempts: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)


class Step(ABC):
    """Step 추상 클래스"""
    
    def __init__(
        self,
        step_id: str,
        name: str,
        description: str = "",
        required: bool = True,
        engines: Optional[List[Engine]] = None
    ):
        self.step_id = step_id
        self.name = name
        self.description = description
        self.required = required
        self.engines = engines or []
        self.status = StepStatus.PENDING
        self.result: Optional[StepResult] = None
    
    @abstractmethod
    async def execute(self, context: Dict[str, Any]) -> StepResult:
        """
        Step 실행
        
        Args:
            context: 실행 컨텍스트
            
        Returns:
            StepResult: 실행 결과
        """
        pass
    
    def add_engine(self, engine: Engine):
        """Engine 추가"""
        if engine not in self.engines:
            self.engines.append(engine)
            # 우선순위로 정렬
            self.engines.sort(key=lambda e: e.get_priority())
    
    def get_engines(self) -> List[Engine]:
        """사용 가능한 Engine 목록 반환"""
        return [e for e in self.engines if e.is_enabled()]
    
    def is_required(self) -> bool:
        """필수 Step 여부"""
        return self.required
    
    def __repr__(self) -> str:
        return f"<Step: {self.step_id} ({self.name})>"
