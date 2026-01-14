"""
Task Plan 생성
"""

from typing import Dict, Any, List
from dataclasses import dataclass

from .core.task import Task
from .core.step import Step, StepStatus
from .intent import AnalyzedIntent, IntentType
from .utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class StepDefinition:
    """Step 정의"""
    step_id: str
    name: str
    engine_type: str
    required: bool = True
    parameters: Dict[str, Any] = None


class TaskPlanner:
    """Task Planner"""
    
    # Intent별 Step 정의
    STEP_DEFINITIONS = {
        IntentType.CREATE_SHORTFORM: [
            StepDefinition("analyze_prompt", "프롬프트 분석", "ai", True),
            StepDefinition("generate_script", "스크립트 생성", "ai", True),
            StepDefinition("create_scenes", "Scene 생성", "ai", True),
            StepDefinition("generate_voice", "음성 생성", "ai", True),
            StepDefinition("render_video", "영상 렌더링", "rule", True),
        ],
        IntentType.CREATE_IMAGE: [
            StepDefinition("analyze_prompt", "프롬프트 분석", "ai", True),
            StepDefinition("generate_image", "이미지 생성", "ai", True),
        ],
        IntentType.CREATE_MOTION: [
            StepDefinition("analyze_image", "이미지 분석", "ai", True),
            StepDefinition("generate_motion", "모션 생성", "ai", True),
            StepDefinition("apply_motion", "모션 적용", "rule", True),
        ],
        IntentType.CREATE_VOICE: [
            StepDefinition("analyze_text", "텍스트 분석", "ai", True),
            StepDefinition("generate_voice", "음성 생성", "ai", True),
        ],
        IntentType.REQUEST_EXPERT: [
            StepDefinition("match_expert", "전문가 매칭", "rule", True),
            StepDefinition("create_request", "요청 생성", "rule", True),
        ],
    }
    
    def plan(self, analyzed_intent: AnalyzedIntent, context: Dict[str, Any]) -> Task:
        """
        Task Plan 생성
        
        Args:
            analyzed_intent: 분석된 Intent
            context: 컨텍스트 데이터
            
        Returns:
            Task: 생성된 Task
        """
        intent_type = analyzed_intent.intent_type
        
        # Step 정의 가져오기
        step_defs = self.STEP_DEFINITIONS.get(intent_type, [])
        
        # Task 생성
        task = Task(
            task_id=f"task_{intent_type.value}",
            intent=intent_type.value,
            user_input=context
        )
        
        # Step 추가
        for step_def in step_defs:
            # Step은 추상 클래스이므로 실제 구현 필요
            # 여기서는 간단한 래퍼 클래스 사용
            from .core.step import Step
            
            class SimpleStep(Step):
                def __init__(self, step_id, name, description, engine_type, required, parameters):
                    super().__init__(step_id, name, description, required)
                    self.engine_type = engine_type
                    self.parameters = parameters
                
                async def execute(self, context):
                    from .core.step import StepResult, StepStatus
                    # 실제 실행은 Executor에서 처리
                    return StepResult(
                        step_id=self.step_id,
                        status=StepStatus.PENDING,
                        result=None
                    )
            
            step = SimpleStep(
                step_id=step_def.step_id,
                name=step_def.name,
                description=f"Execute {step_def.name}",
                engine_type=step_def.engine_type,
                required=step_def.required,
                parameters=step_def.parameters or {}
            )
            
            # 파라미터는 이미 SimpleStep 생성자에서 설정됨
            
            task.add_step(step)
        
        logger.info(f"Task plan created: {task.name} with {len(task.steps)} steps")
        
        return task
