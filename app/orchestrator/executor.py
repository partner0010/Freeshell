"""
Plan 실행기
"""

from typing import Dict, Any, List, Optional
from datetime import datetime

from .planner import Task
from .state import StateMachine, TaskState
from ..engines.base import BaseEngine, EngineResult
from ..engines.ai_engine import AIEngine
from ..engines.rule_engine import RuleEngine
from ..engines.fallback_engine import FallbackEngine
from ..utils.logger import get_logger

logger = get_logger(__name__)


def execute_plan(
    plan: List[Task],
    request: Dict[str, Any],
    task_id: str,
    state_machine: StateMachine
) -> Dict[str, Any]:
    """
    Plan 실행
    
    Args:
        plan: Task Plan
        request: 원본 요청
        task_id: 작업 ID
        state_machine: State Machine
        
    Returns:
        실행 결과
    """
    state_machine.update_task_state(task_id, TaskState.RUNNING)
    
    context = {}
    fallback_used = False
    
    try:
        for i, task in enumerate(plan):
            logger.info(f"[{task_id}] Executing task: {task.name}")
            
            # Task 실행
            result = _execute_task(task, context, request)
            
            if result.success:
                context[task.name] = result.data
                logger.info(f"[{task_id}] Task {task.name} completed")
            else:
                # Fallback 시도
                logger.warning(f"[{task_id}] Task {task.name} failed, trying fallback")
                fallback_result = _execute_fallback(task, context, request)
                
                if fallback_result.success:
                    context[task.name] = fallback_result.data
                    fallback_used = True
                    logger.info(f"[{task_id}] Task {task.name} completed with fallback")
                else:
                    if task.required:
                        # 필수 Task 실패
                        raise Exception(f"Required task failed: {task.name}")
                    else:
                        # 선택적 Task 실패는 무시
                        logger.warning(f"[{task_id}] Optional task {task.name} failed, skipping")
            
            # 진행률 업데이트
            progress = ((i + 1) / len(plan)) * 100
            state_machine.update_progress(task_id, progress)
        
        # 모든 Task 완료
        state_machine.update_task_state(task_id, TaskState.COMPLETED)
        
        # 최종 결과 통합
        final_data = _aggregate_results(context, plan)
        
        return {
            'success': True,
            'data': final_data,
            'fallback_used': fallback_used
        }
        
    except Exception as e:
        logger.error(f"[{task_id}] Plan execution failed: {e}")
        state_machine.update_task_state(task_id, TaskState.FAILED)
        
        return {
            'success': False,
            'error': str(e),
            'fallback_used': fallback_used
        }


def _execute_task(
    task: Task,
    context: Dict[str, Any],
    request: Dict[str, Any]
) -> EngineResult:
    """Task 실행"""
    # Task 파라미터에 컨텍스트 병합
    task_params = {**(task.parameters or {}), **context, **request}
    
    # Engine 선택
    engine = _select_engine(task.engine_type)
    
    # 실행
    return engine.run(task.name, task_params)


def _execute_fallback(
    task: Task,
    context: Dict[str, Any],
    request: Dict[str, Any]
) -> EngineResult:
    """Fallback 실행"""
    # Fallback 순서: Rule → Fallback
    fallback_engines = [
        RuleEngine(),
        FallbackEngine()
    ]
    
    task_params = {**(task.parameters or {}), **context, **request}
    
    for engine in fallback_engines:
        result = engine.run(task.name, task_params)
        if result.success:
            return result
    
    return EngineResult(success=False, error="All fallback engines failed")


def _select_engine(engine_type: str) -> BaseEngine:
    """Engine 선택"""
    engines = {
        'ai': AIEngine(),
        'rule': RuleEngine(),
        'fallback': FallbackEngine()
    }
    
    return engines.get(engine_type, FallbackEngine())


def _aggregate_results(context: Dict[str, Any], plan: List[Task]) -> Dict[str, Any]:
    """결과 통합"""
    # Plan의 첫 번째 Task 타입으로 결과 구조 결정
    if plan and 'shortform' in plan[0].name or 'scene' in context:
        return {
            'type': 'shortform',
            'scenes': context.get('create_scenes', []),
            'video_path': context.get('render_video', {}).get('file_path'),
            'metadata': context
        }
    elif 'image' in context:
        return {
            'type': 'image',
            'image_path': context.get('generate_image', {}).get('file_path'),
            'metadata': context
        }
    elif 'motion' in context:
        return {
            'type': 'motion',
            'motion_data': context.get('select_motion', {}),
            'video_path': context.get('apply_motion', {}).get('file_path'),
            'metadata': context
        }
    else:
        return context
