"""
Task 추상 클래스
"""

from enum import Enum
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
from datetime import datetime
from .step import Step, StepResult
from .state import State, StateMachine, StateContext


class TaskStatus(Enum):
    """Task 상태"""
    PENDING = "pending"
    PLANNING = "planning"
    EXECUTING = "executing"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class TaskResult:
    """Task 실행 결과"""
    task_id: str
    status: TaskStatus
    result: Any = None
    error: Optional[str] = None
    steps_completed: int = 0
    steps_total: int = 0
    execution_time: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)


class Task:
    """Task 클래스"""
    
    def __init__(
        self,
        task_id: str,
        intent: str,
        user_input: Dict[str, Any],
        steps: Optional[List[Step]] = None
    ):
        self.task_id = task_id
        self.intent = intent
        self.user_input = user_input
        self.steps = steps or []
        self.state_machine = StateMachine(initial_state=State.PENDING)
        self.result: Optional[TaskResult] = None
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
    
    def add_step(self, step: Step):
        """Step 추가"""
        if step not in self.steps:
            self.steps.append(step)
    
    def get_steps(self) -> List[Step]:
        """Step 목록 반환"""
        return self.steps
    
    def get_current_state(self) -> State:
        """현재 상태 반환"""
        return self.state_machine.current_state
    
    def update_state(self, new_state: State, context: StateContext):
        """상태 업데이트"""
        self.state_machine.transition(new_state, context)
        self.updated_at = datetime.now()
    
    def get_state_history(self) -> List[Dict[str, Any]]:
        """상태 이력 반환"""
        return self.state_machine.get_history()
    
    def __repr__(self) -> str:
        return f"<Task: {self.task_id} ({self.intent})>"
