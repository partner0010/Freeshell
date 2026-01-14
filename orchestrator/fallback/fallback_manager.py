"""
Fallback 처리 로직
"""

from typing import Dict, Any, Optional, List
from ..core.step import Step, StepResult, StepStatus
from ..core.task import Task, TaskResult, TaskStatus
from ..core.engine import Engine, EngineType, EngineResult
from ..fallback.chain import FallbackChain
from ..utils.logger import get_logger

logger = get_logger(__name__)


class FallbackManager:
    """Fallback Manager"""
    
    async def handle_step_fallback(
        self,
        step: Step,
        context: Dict[str, Any],
        failed_result: StepResult,
        available_engines: List[Engine]
    ) -> Optional[StepResult]:
        """Step Fallback 처리"""
        logger.info(f"Handling fallback for step: {step.step_id}")
        
        # 실패한 Engine 타입 확인
        failed_engine_type = None
        if failed_result.engine_used:
            for engine in available_engines:
                if engine.name == failed_result.engine_used:
                    failed_engine_type = engine.engine_type
                    break
        
        if not failed_engine_type:
            failed_engine_type = EngineType.AI  # 기본값
        
        # Fallback Chain 가져오기
        chain = FallbackChain.get_chain(failed_engine_type)
        tried_types = [failed_engine_type]
        
        # Step의 다른 Engine 시도
        for engine_type in chain:
            if engine_type in tried_types:
                continue
            
            # 해당 타입의 Engine 찾기
            engines = [e for e in available_engines if e.engine_type == engine_type and e.is_enabled()]
            if not engines:
                continue
            
            # Engine 시도
            for engine in engines:
                try:
                    logger.info(f"Trying fallback engine: {engine.name} ({engine.engine_type.value})")
                    
                    # Engine 실행
                    engine_result = await engine.execute(context)
                    
                    if engine_result.success:
                        # 성공
                        return StepResult(
                            step_id=step.step_id,
                            status=StepStatus.SUCCESS,
                            result=engine_result.data,
                            engine_used=engine.name,
                            attempts=failed_result.attempts + 1,
                            metadata={
                                **failed_result.metadata,
                                'fallback_used': True,
                                'fallback_engine': engine.name
                            }
                        )
                    else:
                        tried_types.append(engine_type)
                        logger.warning(f"Fallback engine {engine.name} failed: {engine_result.error}")
                        
                except Exception as e:
                    logger.error(f"Fallback engine {engine.name} error: {e}")
                    continue
        
        # 모든 Fallback 실패
        logger.error(f"All fallback attempts failed for step: {step.step_id}")
        return None
    
    async def handle_task_fallback(
        self,
        task: Task,
        error: str,
        available_engines: List[Engine]
    ) -> Optional[TaskResult]:
        """Task Fallback 처리"""
        logger.info(f"Handling fallback for task: {task.task_id}")
        
        # Expert Engine으로 최종 Fallback
        expert_engines = [e for e in available_engines if e.engine_type == EngineType.EXPERT and e.is_enabled()]
        
        if expert_engines:
            expert_engine = expert_engines[0]
            try:
                expert_result = await expert_engine.execute({
                    'intent': task.intent,
                    'error': error,
                    **task.user_input
                })
                
                if expert_result.success:
                    return TaskResult(
                        task_id=task.task_id,
                        status=TaskStatus.SUCCESS,
                        result=expert_result.data,
                        metadata={
                            'fallback_used': True,
                            'fallback_type': 'expert',
                            'original_error': error
                        }
                    )
            except Exception as e:
                logger.error(f"Expert fallback error: {e}")
        
        return None
