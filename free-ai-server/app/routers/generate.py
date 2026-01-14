"""
생성 API 라우터
"""
from fastapi import APIRouter, HTTPException
from app.models.request import (
    GenerateTextRequest,
    GenerateCodeRequest,
    GeneratePromptRequest
)
from app.models.response import GenerateResponse, ErrorResponse
from app.services.text_generator import TextGenerator
from app.services.code_generator import CodeGenerator
from app.services.prompt_optimizer import PromptOptimizer
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/generate", tags=["generate"])

# 서비스 인스턴스
text_generator = TextGenerator()
code_generator = CodeGenerator()
prompt_optimizer = PromptOptimizer()


@router.post("/text", response_model=GenerateResponse)
async def generate_text(request: GenerateTextRequest):
    """
    텍스트 생성 API
    
    - **prompt**: 생성할 텍스트의 프롬프트
    - **model**: 사용할 모델 (선택사항)
    - **max_tokens**: 최대 토큰 수 (기본값: 2000)
    - **temperature**: 생성 온도 (기본값: 0.7)
    """
    try:
        result = await text_generator.generate(request)
        return result
    except Exception as e:
        logger.error(f"텍스트 생성 오류: {e}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.post("/code", response_model=GenerateResponse)
async def generate_code(request: GenerateCodeRequest):
    """
    코드 생성 API
    
    - **prompt**: 코드 생성 프롬프트
    - **language**: 프로그래밍 언어
    - **model**: 사용할 모델 (선택사항)
    - **max_tokens**: 최대 토큰 수 (기본값: 4000)
    - **temperature**: 생성 온도 (기본값: 0.2)
    - **include_tests**: 테스트 코드 포함 여부
    - **include_comments**: 주석 포함 여부
    """
    try:
        result = await code_generator.generate(request)
        return result
    except Exception as e:
        logger.error(f"코드 생성 오류: {e}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.post("/prompt", response_model=GenerateResponse)
async def optimize_prompt(request: GeneratePromptRequest):
    """
    프롬프트 최적화 API
    
    - **original_prompt**: 원본 프롬프트
    - **purpose**: 목적 (text, code, analysis, creative, technical)
    - **model**: 사용할 모델 (선택사항)
    - **max_tokens**: 최대 토큰 수 (기본값: 2000)
    - **temperature**: 생성 온도 (기본값: 0.5)
    - **style**: 스타일 (professional, casual, technical)
    """
    try:
        result = await prompt_optimizer.optimize(request)
        return result
    except Exception as e:
        logger.error(f"프롬프트 최적화 오류: {e}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
