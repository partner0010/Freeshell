"""
프롬프트 최적화 서비스
"""
from typing import Optional
from app.services.ollama_client import ollama_client
from app.config import settings
from app.models.request import GeneratePromptRequest
from app.models.response import GenerateResponse
import logging

logger = logging.getLogger(__name__)


class PromptOptimizer:
    """프롬프트 최적화 서비스"""
    
    def __init__(self):
        self.default_model = settings.DEFAULT_PROMPT_MODEL
    
    async def optimize(self, request: GeneratePromptRequest) -> GenerateResponse:
        """
        프롬프트 최적화
        
        Args:
            request: 프롬프트 최적화 요청
        
        Returns:
            최적화된 프롬프트 응답
        """
        model = request.model or self.default_model
        
        # 모델 존재 확인
        if not await ollama_client.check_model_exists(model):
            logger.warning(f"모델 {model}이 없습니다. 기본 모델 {self.default_model} 사용")
            model = self.default_model
        
        try:
            # 최적화 프롬프트 구성
            optimization_prompt = self._build_optimization_prompt(request)
            
            # 시스템 프롬프트
            system_prompt = self._get_optimization_system_prompt(request.purpose, request.style)
            
            # Ollama 호출
            result = await ollama_client.generate(
                prompt=optimization_prompt,
                model=model,
                system_prompt=system_prompt,
                max_tokens=request.max_tokens,
                temperature=request.temperature,
                top_p=0.9
            )
            
            # 최적화된 프롬프트 추출
            optimized_prompt = self._extract_prompt(result["content"])
            
            return GenerateResponse(
                success=True,
                content=optimized_prompt,
                model=result["model"],
                tokens_used=result["tokens_used"],
                response_time=result["response_time"],
                cached=False
            )
            
        except Exception as e:
            logger.error(f"프롬프트 최적화 실패: {e}")
            raise Exception(f"프롬프트 최적화 중 오류 발생: {str(e)}")
    
    def _build_optimization_prompt(self, request: GeneratePromptRequest) -> str:
        """최적화 프롬프트 구성"""
        return f"""다음 프롬프트를 {request.purpose} 목적에 맞게 최적화해주세요:

원본 프롬프트:
{request.original_prompt}

요구사항:
- 목적: {request.purpose}
- 스타일: {request.style}
- 명확하고 구체적으로 작성
- AI가 이해하기 쉽게 구성"""
    
    def _get_optimization_system_prompt(self, purpose: str, style: str) -> str:
        """최적화용 시스템 프롬프트"""
        purpose_guides = {
            "text": "텍스트 생성에 최적화된 프롬프트를 작성합니다.",
            "code": "코드 생성에 최적화된 프롬프트를 작성합니다.",
            "analysis": "분석 작업에 최적화된 프롬프트를 작성합니다.",
            "creative": "창의적 작업에 최적화된 프롬프트를 작성합니다.",
            "technical": "기술적 작업에 최적화된 프롬프트를 작성합니다.",
        }
        
        style_guides = {
            "professional": "전문적이고 정중한 톤으로 작성합니다.",
            "casual": "캐주얼하고 친근한 톤으로 작성합니다.",
            "technical": "기술적이고 정확한 용어를 사용합니다.",
        }
        
        purpose_guide = purpose_guides.get(purpose, "일반적인 목적에 맞게 작성합니다.")
        style_guide = style_guides.get(style, "적절한 톤으로 작성합니다.")
        
        return f"""당신은 프롬프트 최적화 전문가입니다.
- {purpose_guide}
- {style_guide}
- 원본 프롬프트의 의도를 유지하면서 더 효과적으로 개선합니다
- 최적화된 프롬프트만 반환하고 설명은 제외합니다"""
    
    def _extract_prompt(self, content: str) -> str:
        """응답에서 프롬프트 추출"""
        # 따옴표나 코드 블록 제거
        content = content.strip()
        
        # 따옴표로 감싸진 경우
        if (content.startswith('"') and content.endswith('"')) or \
           (content.startswith("'") and content.endswith("'")):
            content = content[1:-1]
        
        # 코드 블록 제거
        if content.startswith("```"):
            lines = content.split("\n")
            if len(lines) > 1:
                content = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])
        
        return content.strip()
