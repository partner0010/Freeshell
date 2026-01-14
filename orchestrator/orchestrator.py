"""
AI Orchestrator - 메인 컨트롤러
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid

from .core.state import StateMachine, TaskStatus, StepStatus
from .core.task import Task
from .core.step import Step
from .core.engine import Engine, EngineResult, EngineType
from .intent import IntentAnalyzer, AnalyzedIntent
from .planner import TaskPlanner
from .executor import StepExecutor
from .ethics.ethics_guard import EthicsGuard, RiskAssessment
from .utils.logger import get_logger

logger = get_logger(__name__)


class Orchestrator:
    """AI Orchestrator 메인 컨트롤러"""
    
    def __init__(self):
        self.engines: List[Engine] = []
        self.state_machine = StateMachine()
        self.intent_analyzer = IntentAnalyzer()
        self.task_planner = TaskPlanner()
        self.step_executor = StepExecutor()
        self.ethics_guard = EthicsGuard()
        self.active_tasks: Dict[str, Task] = {}
    
    def register_engine(self, engine: Engine):
        """엔진 등록"""
        if engine not in self.engines:
            self.engines.append(engine)
            # 우선순위순 정렬
            self.engines.sort(key=lambda e: e.priority, reverse=True)
            logger.info(f"Engine registered: {engine.name} (priority: {engine.priority})")
    
    def get_engine(self, engine_type: EngineType) -> Optional[Engine]:
        """엔진 조회"""
        for engine in self.engines:
            if engine.engine_type == engine_type:
                return engine
        return None
    
    async def process(
        self,
        intent: str,
        context: Dict[str, Any]
    ) -> EngineResult:
        """
        요청 처리
        
        Args:
            intent: 사용자 의도 (예: "create_shortform")
            context: 컨텍스트 데이터
            
        Returns:
            EngineResult: 처리 결과
        """
        task_id = str(uuid.uuid4())
        start_time = datetime.now()
        
        try:
            # 1. Ethics Guard 검증
            ethics_result: RiskAssessment = self.ethics_guard.assess_risk(context)
            if ethics_result.blocked:
                return EngineResult(
                    success=False,
                    data=None,
                    engine_name="ethics_guard",
                    engine_type=EngineType.RULE,
                    execution_time=0.0,
                    error="Request blocked by ethics guard",
                    fallback_available=False
                )
            
            # 2. Intent 분석
            analyzed_intent: AnalyzedIntent = self.intent_analyzer.analyze(intent, context)
            logger.info(f"Intent analyzed: {analyzed_intent.intent_type.value}")
            
            # 3. Task Plan 생성
            task = self.task_planner.plan(analyzed_intent, context)
            task.id = task_id
            self.active_tasks[task_id] = task
            
            # 4. State Machine 초기화
            self.state_machine.create_task_state(task_id)
            
            # 5. Step 실행
            result = await self.step_executor.execute(task, self.engines, self.state_machine)
            
            # 6. 결과 통합
            execution_time = (datetime.now() - start_time).total_seconds()
            
            return EngineResult(
                success=result.success,
                data=result.data,
                engine_name="orchestrator",
                engine_type=EngineType.AI,
                execution_time=execution_time,
                error=result.error,
                fallback_used=result.fallback_used
            )
            
        except Exception as e:
            logger.error(f"Orchestrator error: {e}")
            execution_time = (datetime.now() - start_time).total_seconds()
            
            # Fallback 시도
            fallback_result = await self._handle_fallback(intent, context)
            
            return EngineResult(
                success=fallback_result.success,
                data=fallback_result.data,
                engine_name="orchestrator",
                engine_type=EngineType.AI,
                execution_time=execution_time,
                error=str(e),
                fallback_used=True
            )
    
    async def _handle_fallback(
        self,
        intent: str,
        context: Dict[str, Any]
    ) -> EngineResult:
        """Fallback 처리"""
        # Rule Engine 시도
        rule_engine = self.get_engine(EngineType.RULE)
        if rule_engine:
            try:
                result = await rule_engine.execute(context)
                if result.success:
                    logger.info("Fallback to rule engine succeeded")
                    return result
            except Exception as e:
                logger.warning(f"Rule engine fallback failed: {e}")
        
        # Template Engine 시도
        template_engine = self.get_engine(EngineType.TEMPLATE)
        if template_engine:
            try:
                result = await template_engine.execute(context)
                if result.success:
                    logger.info("Fallback to template engine succeeded")
                    return result
            except Exception as e:
                logger.warning(f"Template engine fallback failed: {e}")
        
        # 최종 실패
        return EngineResult(
            success=False,
            data=None,
            engine_name="fallback",
            engine_type=EngineType.RULE,
            execution_time=0.0,
            error="All engines failed",
            fallback_available=False
        )
    
    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """작업 상태 조회"""
        task = self.active_tasks.get(task_id)
        if not task:
            return None
        
        state = self.state_machine.get_task_state(task_id)
        
        return {
            'task_id': task_id,
            'status': state.status.value if state else 'unknown',
            'current_step': state.current_step if state else None,
            'progress': state.progress if state else 0.0
        }
