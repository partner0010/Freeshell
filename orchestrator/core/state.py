"""
State Machine 관리
"""

from enum import Enum
from typing import Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
import json


class State(Enum):
    """Task 실행 상태"""
    PENDING = "pending"
    PLANNING = "planning"
    EXECUTING = "executing"
    SUCCESS = "success"
    FAILED = "failed"
    FALLBACK = "fallback"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


@dataclass
class StateContext:
    """상태 컨텍스트"""
    state: State
    task_id: str
    step_id: Optional[str] = None
    engine_name: Optional[str] = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환"""
        return {
            'state': self.state.value,
            'task_id': self.task_id,
            'step_id': self.step_id,
            'engine_name': self.engine_name,
            'error': self.error,
            'metadata': self.metadata,
            'timestamp': self.timestamp.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'StateContext':
        """딕셔너리에서 생성"""
        return cls(
            state=State(data['state']),
            task_id=data['task_id'],
            step_id=data.get('step_id'),
            engine_name=data.get('engine_name'),
            error=data.get('error'),
            metadata=data.get('metadata', {}),
            timestamp=datetime.fromisoformat(data['timestamp'])
        )


class StateMachine:
    """상태 머신 관리"""
    
    # 상태 전이 규칙
    TRANSITIONS = {
        State.PENDING: [State.PLANNING, State.CANCELLED],
        State.PLANNING: [State.EXECUTING, State.FAILED, State.CANCELLED],
        State.EXECUTING: [State.SUCCESS, State.FAILED, State.FALLBACK, State.CANCELLED],
        State.SUCCESS: [State.COMPLETED, State.FALLBACK],
        State.FAILED: [State.FALLBACK, State.CANCELLED],
        State.FALLBACK: [State.EXECUTING, State.FAILED, State.CANCELLED],
        State.COMPLETED: [],
        State.CANCELLED: [],
    }
    
    def __init__(self, initial_state: State = State.PENDING):
        self.current_state = initial_state
        self.history: list[StateContext] = []
    
    def can_transition(self, target_state: State) -> bool:
        """상태 전이 가능 여부 확인"""
        return target_state in self.TRANSITIONS.get(self.current_state, [])
    
    def transition(self, target_state: State, context: StateContext) -> bool:
        """상태 전이"""
        if not self.can_transition(target_state):
            return False
        
        self.current_state = target_state
        context.state = target_state
        self.history.append(context)
        return True
    
    def get_history(self) -> list[Dict[str, Any]]:
        """상태 이력 반환"""
        return [ctx.to_dict() for ctx in self.history]
    
    def get_current_context(self) -> Optional[StateContext]:
        """현재 상태 컨텍스트 반환"""
        return self.history[-1] if self.history else None
