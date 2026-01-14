"""
Step 실행기
"""

from typing import Dict, Any, List, Optional
from datetime import datetime

from .core.task import Task
from .core.step import Step
from .core.engine import Engine, EngineResult, EngineType
from .core.state import StateMachine, State, StateContext, TaskStatus, StepStatus
from .utils.logger import get_logger

logger = get_logger(__name__)


class StepExecutor:
    """Step 실행기"""
    
    async def execute(
        self,
        task: Task,
        engines: List[Engine],
        state_machine: StateMachine
    ) -> EngineResult:
        """
        Task 실행
        
        Args:
            task: 실행할 Task
            engines: 사용 가능한 엔진 목록
            state_machine: State Machine
            
        Returns:
            EngineResult: 실행 결과
        """
        task_id = task.task_id
        # StateMachine은 Task 내부에 있음
        task.update_state(State.EXECUTING, StateContext(state=State.EXECUTING, task_id=task_id))
        
        accumulated_data = {}
        fallback_used = False
        
        try:
            # 각 Step 순차 실행
            for i, step in enumerate(task.steps):
                step_start_time = datetime.now()
                
                # Step 실행 (상태는 Step 내부에서 관리)
                step.status = StepStatus.RUNNING
                
                # 엔진 선택
                engine = self._select_engine(step, engines)
                if not engine:
                    logger.warning(f"No engine found for step: {step.step_id}")
                    if step.required:
                        # 필수 Step 실패 시 Fallback
                        fallback_result = await self._execute_fallback(step, engines)
                        if fallback_result.success:
                            accumulated_data[step.step_id] = fallback_result.data
                            fallback_used = True
                            continue
                        else:
                            raise Exception(f"Required step failed: {step.step_id}")
                    else:
                        # 선택적 Step은 건너뛰기
                        continue
                
                # Step 실행
                step_params = getattr(step, 'parameters', {})
                step_context = {
                    **step_params,
                    **accumulated_data  # 이전 Step 결과 포함
                }
                
                result = await engine.execute(step_context)
                
                step_execution_time = (datetime.now() - step_start_time).total_seconds()
                
                if result.success:
                    # 성공
                    step.status = StepStatus.SUCCESS
                    accumulated_data[step.step_id] = result.data
                    logger.info(f"Step completed: {step.step_id} ({step_execution_time:.2f}s)")
                else:
                    # 실패
                    if step.is_required():
                        # Fallback 시도
                        logger.warning(f"Step failed: {step.step_id}, trying fallback")
                        fallback_result = await self._execute_fallback(step, engines)
                        
                        if fallback_result.success:
                            accumulated_data[step.step_id] = fallback_result.data
                            fallback_used = True
                            step.status = StepStatus.SUCCESS
                        else:
                            step.status = StepStatus.FAILED
                            raise Exception(f"Step failed and fallback failed: {step.step_id}")
                    else:
                        # 선택적 Step 실패는 무시
                        step.status = StepStatus.SKIPPED
                        logger.warning(f"Optional step failed: {step.step_id}")
            
            # 모든 Step 완료
            task.update_state(State.SUCCESS, StateContext(state=State.SUCCESS, task_id=task_id))
            
            # 최종 결과 통합
            final_data = self._aggregate_results(accumulated_data, task)
            
            return EngineResult(
                success=True,
                data=final_data,
                engine_name="executor",
                engine_type=EngineType.AI,
                execution_time=0.0,
                fallback_used=fallback_used
            )
            
        except Exception as e:
            logger.error(f"Task execution failed: {e}")
            task.update_state(State.FAILED, StateContext(state=State.FAILED, task_id=task_id, error=str(e)))
            
            return EngineResult(
                success=False,
                data=accumulated_data,
                engine_name="executor",
                engine_type=EngineType.AI,
                execution_time=0.0,
                error=str(e),
                fallback_used=fallback_used
            )
    
    def _select_engine(self, step: Step, engines: List[Engine]) -> Optional[Engine]:
        """엔진 선택"""
        # Step의 engine_type 속성 확인
        step_engine_type = getattr(step, 'engine_type', None)
        if not step_engine_type:
            return None
        
        # Step의 engine_type에 맞는 엔진 찾기
        for engine in engines:
            if engine.engine_type.value == step_engine_type:
                # 엔진이 Step을 처리할 수 있는지 확인
                step_params = getattr(step, 'parameters', {})
                if hasattr(engine, 'can_handle'):
                    if engine.can_handle(step.step_id, step_params):
                        return engine
                else:
                    return engine
        
        return None
    
    async def _execute_fallback(self, step: Step, engines: List[Engine]) -> EngineResult:
        """Fallback 실행"""
        step_params = getattr(step, 'parameters', {})
        
        # Rule Engine 시도
        for engine in engines:
            if engine.engine_type == EngineType.RULE:
                try:
                    result = await engine.execute(step_params)
                    if result.success:
                        logger.info(f"Fallback succeeded for step: {step.step_id}")
                        return result
                except Exception as e:
                    logger.warning(f"Fallback engine failed: {e}")
        
        return EngineResult(
            success=False,
            data=None,
            engine_name="fallback",
            engine_type=EngineType.RULE,
            execution_time=0.0,
            error="Fallback failed"
        )
    
    def _aggregate_results(self, accumulated_data: Dict[str, Any], task: Task) -> Dict[str, Any]:
        """결과 통합"""
        # Task 이름에 따라 결과 구조 결정
        if "shortform" in task.name:
            return {
                'type': 'shortform',
                'scenes': accumulated_data.get('create_scenes', []),
                'video_path': accumulated_data.get('render_video', {}).get('file_path'),
                'metadata': accumulated_data
            }
        elif "image" in task.name:
            return {
                'type': 'image',
                'image_path': accumulated_data.get('generate_image', {}).get('file_path'),
                'metadata': accumulated_data
            }
        elif "motion" in task.name:
            return {
                'type': 'motion',
                'motion_data': accumulated_data.get('generate_motion', {}),
                'video_path': accumulated_data.get('apply_motion', {}).get('file_path'),
                'metadata': accumulated_data
            }
        else:
            return accumulated_data
