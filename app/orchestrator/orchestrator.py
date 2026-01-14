"""
AI Orchestrator - 핵심 뇌
"""

from typing import Dict, Any, Optional
from datetime import datetime
import uuid

from .intent import analyze_intent
from .planner import build_plan
from .executor import execute_plan
from .state import StateMachine, TaskState
from ..ethics.ethics_guard import check_ethics
from ..utils.logger import get_logger

logger = get_logger(__name__)


class Orchestrator:
    """중앙 Orchestrator"""
    
    def __init__(self):
        self.state_machine = StateMachine()
        self.active_tasks: Dict[str, Dict[str, Any]] = {}
    
    def handle(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        요청 처리
        
        Args:
            request: 사용자 요청
                - prompt: 프롬프트
                - type: 콘텐츠 타입 (shortform, image, motion, voice)
                - options: 추가 옵션
        
        Returns:
            처리 결과
        """
        task_id = str(uuid.uuid4())
        start_time = datetime.now()
        
        try:
            # 1. Ethics Guard 검증
            ethics_result = check_ethics(request)
            if not ethics_result['allowed']:
                return {
                    'success': False,
                    'error': ethics_result['message'],
                    'blocked': True
                }
            
            # 2. Intent 분석
            intent = analyze_intent(request)
            logger.info(f"[{task_id}] Intent: {intent['type']}")
            
            # 3. Task Plan 생성
            plan = build_plan(intent, request)
            logger.info(f"[{task_id}] Plan created: {len(plan)} tasks")
            
            # 4. State Machine 초기화
            self.state_machine.create_task(task_id, TaskState.PENDING)
            
            # 5. Plan 실행
            result = execute_plan(plan, request, task_id, self.state_machine)
            
            # 6. 결과 반환
            execution_time = (datetime.now() - start_time).total_seconds()
            
            return {
                'success': result['success'],
                'data': result.get('data'),
                'task_id': task_id,
                'execution_time': execution_time,
                'fallback_used': result.get('fallback_used', False),
                'error': result.get('error')
            }
            
        except Exception as e:
            logger.error(f"[{task_id}] Orchestrator error: {e}")
            execution_time = (datetime.now() - start_time).total_seconds()
            
            return {
                'success': False,
                'error': str(e),
                'task_id': task_id,
                'execution_time': execution_time
            }
    
    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """작업 상태 조회"""
        state = self.state_machine.get_task_state(task_id)
        if not state:
            return None
        
        return {
            'task_id': task_id,
            'state': state.value,
            'progress': self.state_machine.get_progress(task_id)
        }
