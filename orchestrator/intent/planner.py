"""
Task Plan 생성
"""

from typing import Dict, Any, List
from ..core.step import Step, StepStatus
from ..core.engine import Engine, EngineType
from ..engines.ai_engine import AIEngine
from ..engines.rule_engine import RuleEngine
from ..engines.template_engine import TemplateEngine
from ..engines.expert_engine import ExpertEngine
from ..utils.logger import get_logger

logger = get_logger(__name__)


class SimpleStep(Step):
    """간단한 Step 구현"""
    
    async def execute(self, context: Dict[str, Any]) -> StepResult:
        """Step 실행"""
        from ..core.step import StepResult
        from datetime import datetime
        
        start_time = datetime.now()
        
        # Engine 선택 및 실행
        engines = self.get_engines()
        if not engines:
            return StepResult(
                step_id=self.step_id,
                status=StepStatus.FAILED,
                error="No engines available"
            )
        
        # 우선순위 순으로 Engine 시도
        for engine in engines:
            try:
                engine_result = await engine.execute(context)
                
                if engine_result.success:
                    execution_time = (datetime.now() - start_time).total_seconds()
                    return StepResult(
                        step_id=self.step_id,
                        status=StepStatus.SUCCESS,
                        result=engine_result.data,
                        engine_used=engine.name,
                        execution_time=execution_time,
                        metadata=engine_result.metadata
                    )
            except Exception as e:
                logger.warning(f"Engine {engine.name} failed: {e}")
                continue
        
        # 모든 Engine 실패
        execution_time = (datetime.now() - start_time).total_seconds()
        return StepResult(
            step_id=self.step_id,
            status=StepStatus.FAILED,
            error="All engines failed",
            execution_time=execution_time
        )


class TaskPlanner:
    """Task Planner"""
    
    async def create_plan(
        self,
        intent: str,
        user_input: Dict[str, Any],
        available_engines: List[Engine]
    ) -> List[Step]:
        """Task Plan 생성"""
        steps = []
        
        # Intent별 Step 생성
        if intent == 'create_text':
            step = SimpleStep(
                step_id='generate_text',
                name='텍스트 생성',
                description='텍스트 콘텐츠 생성',
                required=True
            )
            # Engine 추가
            for engine in available_engines:
                if engine.can_handle(intent, user_input):
                    step.add_engine(engine)
            steps.append(step)
        
        elif intent == 'create_image':
            step = SimpleStep(
                step_id='generate_image',
                name='이미지 생성',
                description='이미지 콘텐츠 생성',
                required=True
            )
            for engine in available_engines:
                if engine.can_handle(intent, user_input):
                    step.add_engine(engine)
            steps.append(step)
        
        else:
            # 기본 Step
            step = SimpleStep(
                step_id='generate_content',
                name='콘텐츠 생성',
                description='콘텐츠 생성',
                required=True
            )
            for engine in available_engines:
                if engine.can_handle(intent, user_input):
                    step.add_engine(engine)
            steps.append(step)
        
        logger.info(f"Created plan with {len(steps)} steps for intent: {intent}")
        return steps
