"""
State Machine
"""

from typing import Dict, Any, Optional
from enum import Enum
from datetime import datetime

from ..utils.logger import get_logger

logger = get_logger(__name__)


class TaskState(Enum):
    """작업 상태"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class StateMachine:
    """State Machine"""
    
    def __init__(self):
        self.tasks: Dict[str, Dict[str, Any]] = {}
    
    def create_task(self, task_id: str, initial_state: TaskState):
        """작업 생성"""
        self.tasks[task_id] = {
            'state': initial_state,
            'progress': 0.0,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
    
    def update_task_state(self, task_id: str, state: TaskState):
        """작업 상태 업데이트"""
        if task_id in self.tasks:
            self.tasks[task_id]['state'] = state
            self.tasks[task_id]['updated_at'] = datetime.now().isoformat()
    
    def update_progress(self, task_id: str, progress: float):
        """진행률 업데이트"""
        if task_id in self.tasks:
            self.tasks[task_id]['progress'] = progress
            self.tasks[task_id]['updated_at'] = datetime.now().isoformat()
    
    def get_task_state(self, task_id: str) -> Optional[TaskState]:
        """작업 상태 조회"""
        if task_id in self.tasks:
            return self.tasks[task_id]['state']
        return None
    
    def get_progress(self, task_id: str) -> float:
        """진행률 조회"""
        if task_id in self.tasks:
            return self.tasks[task_id]['progress']
        return 0.0
