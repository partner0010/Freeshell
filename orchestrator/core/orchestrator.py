"""
Orchestrator 메인 클래스
"""

import asyncio
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid

from .task import Task, TaskStatus, TaskResult
from .step import Step, StepStatus, StepResult
from .engine import Engine, EngineResult, EngineType
from .state import State, StateContext
from ..intent.analyzer import IntentAnalyzer
from ..intent.planner import TaskPlanner
from ..fallback.fallback_manager import FallbackManager
from ..utils.logger import get_logger

logger = get_logger(__name__)


class Orchestrator:
    """중앙 Orchestrator 시스템"""
    
    def __init__(
        self,
        intent_analyzer: Optional[IntentAnalyzer] = None,
        task_planner: Optional[TaskPlanner] = None,
        fallback_manager: Optional[FallbackManager] = None
    ):
        self.intent_analyzer = intent_analyzer or IntentAnalyzer()
        self.task_planner = task_planner or TaskPlanner()
        self.fallback_manager = fallback_manager or FallbackManager()
        self.engines: List[Engine] = []
        self.tasks: Dict[str, Task] = {}
    
    def register_engine(self, engine: Engine):
        """Engine 등록"""
        if engine not in self.engines:
            self.engines.append(engine)
            # 우선순위로 정렬
            self.engines.sort(key=lambda e: e.get_priority())
            logger.info(f"Engine registered: {engine.name} ({engine.engine_type.value})")
    
    def get_engines(self, engine_type: Optional[EngineType] = None) -> List[Engine]:
        """Engine 목록 반환"""
        engines = [e for e in self.engines if e.is_enabled()]
        if engine_type:
            engines = [e for e in engines if e.engine_type == engine_type]
        return engines
    
    async def process(self, user_input: Dict[str, Any]) -> TaskResult:
        """
        사용자 요청 처리
        
        Args:
            user_input: 사용자 입력
                - intent: 사용자 의도 (선택)
                - prompt: 프롬프트
                - type: 콘텐츠 타입
                - options: 추가 옵션
        
        Returns:
            TaskResult: 처리 결과
        """
        task_id = str(uuid.uuid4())
        start_time = datetime.now()
        
        try:
            # 1. Intent 분석
            logger.info(f"[{task_id}] Starting intent analysis")
            intent = await self._analyze_intent(user_input)
            
            # 2. Task 생성
            task = Task(
                task_id=task_id,
                intent=intent,
                user_input=user_input
            )
            self.tasks[task_id] = task
            
            # 상태: PLANNING
            task.update_state(
                State.PLANNING,
                StateContext(
                    state=State.PLANNING,
                    task_id=task_id,
                    metadata={'intent': intent}
                )
            )
            
            # 3. Task Plan 생성
            logger.info(f"[{task_id}] Creating task plan for intent: {intent}")
            steps = await self._create_task_plan(intent, user_input)
            
            for step in steps:
                task.add_step(step)
            
            # 상태: EXECUTING
            task.update_state(
                State.EXECUTING,
                StateContext(
                    state=State.EXECUTING,
                    task_id=task_id,
                    metadata={'steps_count': len(steps)}
                )
            )
            
            # 4. Step 실행
            logger.info(f"[{task_id}] Executing {len(steps)} steps")
            context = {'task_id': task_id, 'intent': intent, **user_input}
            step_results = await self._execute_steps(task, context)
            
            # 5. 결과 통합
            result = await self._aggregate_results(task, step_results, start_time)
            
            # 상태: SUCCESS or FAILED
            final_state = State.SUCCESS if result.status == TaskStatus.SUCCESS else State.FAILED
            task.update_state(
                final_state,
                StateContext(
                    state=final_state,
                    task_id=task_id,
                    error=result.error,
                    metadata={'steps_completed': result.steps_completed}
                )
            )
            
            task.result = result
            result.task_id = task_id  # task_id 추가
            return result
            
        except Exception as e:
            logger.error(f"[{task_id}] Orchestrator error: {e}", exc_info=True)
            
            # Fallback 시도
            if task_id in self.tasks:
                task = self.tasks[task_id]
                fallback_result = await self._handle_fallback(task, str(e))
                if fallback_result:
                    return fallback_result
            
            # 최종 실패
            error_result = TaskResult(
                task_id=task_id,
                status=TaskStatus.FAILED,
                error=str(e),
                execution_time=(datetime.now() - start_time).total_seconds()
            )
            if task_id in self.tasks:
                self.tasks[task_id].result = error_result
            return error_result
    
    async def _analyze_intent(self, user_input: Dict[str, Any]) -> str:
        """Intent 분석"""
        if 'intent' in user_input:
            return user_input['intent']
        
        return await self.intent_analyzer.analyze(user_input)
    
    async def _create_task_plan(self, intent: str, user_input: Dict[str, Any]) -> List[Step]:
        """Task Plan 생성"""
        return await self.task_planner.create_plan(intent, user_input, self.engines)
    
    async def _execute_steps(self, task: Task, context: Dict[str, Any]) -> List[StepResult]:
        """Step 실행"""
        step_results = []
        
        for step in task.get_steps():
            step_start = datetime.now()
            
            try:
                logger.info(f"[{task.task_id}] Executing step: {step.step_id}")
                
                # Step 실행
                step_result = await step.execute(context)
                step_results.append(step_result)
                
                # 실패 시 Fallback
                if step_result.status == StepStatus.FAILED and step.is_required():
                    logger.warning(f"[{task.task_id}] Step {step.step_id} failed, trying fallback")
                    fallback_result = await self._handle_step_fallback(step, context, step_result)
                    if fallback_result:
                        step_results[-1] = fallback_result
                
                execution_time = (datetime.now() - step_start).total_seconds()
                logger.info(f"[{task.task_id}] Step {step.step_id} completed in {execution_time:.2f}s")
                
            except Exception as e:
                logger.error(f"[{task.task_id}] Step {step.step_id} error: {e}")
                step_results.append(StepResult(
                    step_id=step.step_id,
                    status=StepStatus.FAILED,
                    error=str(e)
                ))
        
        return step_results
    
    async def _handle_step_fallback(self, step: Step, context: Dict[str, Any], failed_result: StepResult) -> Optional[StepResult]:
        """Step Fallback 처리"""
        return await self.fallback_manager.handle_step_fallback(step, context, failed_result, self.engines)
    
    async def _handle_fallback(self, task: Task, error: str) -> Optional[TaskResult]:
        """Task Fallback 처리"""
        return await self.fallback_manager.handle_task_fallback(task, error, self.engines)
    
    async def _aggregate_results(self, task: Task, step_results: List[StepResult], start_time: datetime) -> TaskResult:
        """결과 통합"""
        success_count = sum(1 for r in step_results if r.status == StepStatus.SUCCESS)
        failed_count = sum(1 for r in step_results if r.status == StepStatus.FAILED)
        required_failed = any(
            r.status == StepStatus.FAILED 
            for r, s in zip(step_results, task.get_steps()) 
            if s.is_required()
        )
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        # 결과 데이터 통합
        result_data = {
            'steps': [r.__dict__ for r in step_results],
            'summary': {
                'total': len(step_results),
                'success': success_count,
                'failed': failed_count
            }
        }
        
        # 최종 결과 추출 (마지막 성공한 Step의 결과)
        final_result = None
        for result in reversed(step_results):
            if result.status == StepStatus.SUCCESS and result.result:
                final_result = result.result
                break
        
        status = TaskStatus.SUCCESS if not required_failed else TaskStatus.FAILED
        
        return TaskResult(
            task_id=task.task_id,
            status=status,
            result=final_result or result_data,
            steps_completed=success_count,
            steps_total=len(step_results),
            execution_time=execution_time,
            metadata=result_data
        )
    
    def get_task(self, task_id: str) -> Optional[Task]:
        """Task 조회"""
        return self.tasks.get(task_id)
    
    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Task 상태 조회"""
        task = self.get_task(task_id)
        if not task:
            return None
        
        return {
            'task_id': task.task_id,
            'intent': task.intent,
            'state': task.get_current_state().value,
            'status': task.result.status.value if task.result else 'pending',
            'steps': len(task.get_steps()),
            'created_at': task.created_at.isoformat(),
            'updated_at': task.updated_at.isoformat(),
            'state_history': task.get_state_history()
        }
