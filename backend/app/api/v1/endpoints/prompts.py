"""
프롬프트 분석 API 엔드포인트
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from ....schemas.prompt import PromptAnalyzeRequest, PromptAnalyzeResponse
from ....services.ai_orchestrator import AIOrchestrator
from ....database.connection import get_db
from ....utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()


def get_orchestrator() -> AIOrchestrator:
    """AI 오케스트레이터 의존성"""
    try:
        return AIOrchestrator()
    except ValueError as e:
        logger.error(f"Failed to initialize AIOrchestrator: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI service is not available. Please check OPENAI_API_KEY configuration."
        )


@router.post("/analyze", response_model=PromptAnalyzeResponse, status_code=status.HTTP_200_OK)
async def analyze_prompt(
    request: PromptAnalyzeRequest,
    orchestrator: AIOrchestrator = Depends(get_orchestrator),
    db: AsyncSession = Depends(get_db),
):
    """
    프롬프트 분석
    
    프롬프트를 분석하고 콘텐츠 계획을 생성합니다.
    """
    try:
        # 타입 검증
        if request.type not in ["short", "long"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="type must be 'short' or 'long'"
            )
        
        logger.info(f"Analyzing prompt: {request.text[:100]}... (type: {request.type})")
        
        # 프롬프트 분석
        analysis = orchestrator.analyze_prompt(request.text)
        
        # 콘텐츠 타입에 따라 길이 조정
        if request.type == "short":
            # 짧은 영상: 15-60초
            if analysis.duration_estimate and analysis.duration_estimate > 60:
                analysis.duration_estimate = 60
            elif not analysis.duration_estimate:
                analysis.duration_estimate = 30
        else:
            # 긴 영상: 60초 이상
            if analysis.duration_estimate and analysis.duration_estimate < 60:
                analysis.duration_estimate = 120
            elif not analysis.duration_estimate:
                analysis.duration_estimate = 120
        
        # 계획 생성
        plan = orchestrator.generate_plan(analysis)
        
        # 응답 포맷팅
        # topic 추출 (intent의 첫 부분 또는 key_points의 첫 번째)
        topic = "General"
        if analysis.key_points:
            topic = analysis.key_points[0]
        elif analysis.intent:
            # intent에서 첫 번째 명사/주제 추출
            words = analysis.intent.split()
            if words:
                topic = words[0]
        
        content_type_value = analysis.content_type.value if hasattr(analysis.content_type, 'value') else str(analysis.content_type)
        
        analysis_response = {
            "topic": topic,
            "tone": analysis.tone,
            "keywords": analysis.key_points[:10],  # 최대 10개
            "suggested_duration": analysis.duration_estimate or 30,
            "content_type": content_type_value,
            "intent": analysis.intent,
            "target_audience": analysis.target_audience,
            "complexity": analysis.complexity,
        }
        
        # 스크립트 아웃라인 생성 (씬 설명 기반)
        script_outline = "\n".join([
            f"Scene {s.scene_number}: {s.description}"
            for s in plan.scenes
        ])
        
        plan_response = {
            "scenes": [
                {
                    "scene_number": s.scene_number,
                    "description": s.description,
                    "visual_elements": s.visual_elements,
                    "audio_elements": s.audio_elements,
                    "duration": s.duration,
                    "transitions": s.transitions,
                }
                for s in plan.scenes
            ],
            "script_outline": script_outline,
            "visual_style": plan.style,
            "title": plan.title,
            "description": plan.description,
            "total_duration": plan.total_duration,
            "color_palette": plan.color_palette,
            "music_suggestion": plan.music_suggestion,
        }
        
        return PromptAnalyzeResponse(
            analysis=analysis_response,
            plan=plan_response,
        )
        
    except ValueError as e:
        logger.error(f"Validation error in analyze_prompt: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error in analyze_prompt: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze prompt: {str(e)}"
        )
