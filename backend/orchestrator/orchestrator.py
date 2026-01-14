"""
AI Orchestrator - 핵심 뇌 (확장 버전)
"""

from typing import Dict, Any, Optional
from datetime import datetime
import uuid

from .intent import analyze_intent
from .planner import build_plan
from .executor import execute_plan
from .state import StateMachine, TaskState
from .memory import MemoryManager
from ..ethics.guard import check_ethics
from ..utils.logger import get_logger

logger = get_logger(__name__)


class Orchestrator:
    """중앙 Orchestrator (확장 버전)"""
    
    def __init__(self):
        self.state_machine = StateMachine()
        self.memory_manager = MemoryManager()
        self.active_tasks: Dict[str, Dict[str, Any]] = {}
    
    def handle(
        self,
        request: Dict[str, Any],
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        요청 처리 (Memory 통합)
        
        Args:
            request: 사용자 요청
            user_id: 사용자 ID (선택)
        
        Returns:
            처리 결과
        """
        task_id = str(uuid.uuid4())
        start_time = datetime.now()
        
        try:
            # 0. 사용자 Memory 로드
            if user_id:
                self.memory_manager.load_user(user_id)
                user_context = self.memory_manager.get_context(user_id)
                request['user_context'] = user_context
                logger.info(f"[{task_id}] User context loaded: {len(user_context)} memories")
            
            # 1. Ethics Guard 검증
            ethics_result = check_ethics(request)
            if not ethics_result['allowed']:
                return {
                    'success': False,
                    'error': ethics_result['message'],
                    'blocked': True
                }
            
            # 2. Intent 분석 (Memory 기반)
            intent = analyze_intent(request, user_context if user_id else None)
            logger.info(f"[{task_id}] Intent: {intent['type']}")
            
            # 3. Task Plan 생성
            plan = build_plan(intent, request)
            logger.info(f"[{task_id}] Plan created: {len(plan)} tasks")
            
            # 4. State Machine 초기화
            self.state_machine.create_task(task_id, TaskState.PENDING)
            
            # 5. Plan 실행
            result = execute_plan(plan, request, task_id, self.state_machine)
            
            # 6. Memory 업데이트
            if user_id and result['success']:
                self._update_memory(user_id, request, result)
            
            # 7. 결과 반환
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
    
    def _update_memory(self, user_id: str, request: Dict[str, Any], result: Dict[str, Any]):
        """Memory 업데이트"""
        # 상호작용 기록
        self.memory_manager.add_interaction(
            user_id,
            request.get('type', 'unknown'),
            {
                'success': result['success'],
                'task_id': result.get('task_id'),
                'data_type': result.get('data', {}).get('type') if result.get('data') else None
            }
        )
        
        # 선호도 업데이트 (성공한 경우)
        if result['success'] and 'preference' in request.get('options', {}):
            self.memory_manager.update_preference(
                user_id,
                request['options']['preference']
            )
    
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
    
    def get_user_context(self, user_id: str) -> Dict[str, Any]:
        """사용자 컨텍스트 조회"""
        self.memory_manager.load_user(user_id)
        return self.memory_manager.get_context(user_id)
