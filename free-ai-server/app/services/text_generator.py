"""
텍스트 생성 서비스
"""
from typing import Optional
from app.services.ollama_client import ollama_client
from app.config import settings
from app.models.request import GenerateTextRequest
from app.models.response import GenerateResponse
import logging

logger = logging.getLogger(__name__)


class TextGenerator:
    """텍스트 생성 서비스"""
    
    def __init__(self):
        self.default_model = settings.DEFAULT_TEXT_MODEL
    
    async def generate(self, request: GenerateTextRequest) -> GenerateResponse:
        """
        텍스트 생성
        
        Args:
            request: 텍스트 생성 요청
        
        Returns:
            생성된 텍스트 응답
        """
        model = request.model or self.default_model
        
        # 모델 존재 확인
        if not await ollama_client.check_model_exists(model):
            logger.warning(f"모델 {model}이 없습니다. 기본 모델 {self.default_model} 사용")
            model = self.default_model
        
        try:
            # 시스템 프롬프트 구성
            system_prompt = request.system_prompt or self._get_default_system_prompt()
            
            # Ollama 호출
            result = await ollama_client.generate(
                prompt=request.prompt,
                model=model,
                system_prompt=system_prompt,
                max_tokens=request.max_tokens,
                temperature=request.temperature,
                top_p=request.top_p
            )
            
            return GenerateResponse(
                success=True,
                content=result["content"],
                model=result["model"],
                tokens_used=result["tokens_used"],
                response_time=result["response_time"],
                cached=False
            )
            
        except Exception as e:
            logger.error(f"텍스트 생성 실패: {e}")
            raise Exception(f"텍스트 생성 중 오류 발생: {str(e)}")
    
    def _get_default_system_prompt(self) -> str:
        """기본 시스템 프롬프트"""
        return """당신은 전문적인 텍스트 생성 AI입니다.
- 명확하고 구조화된 텍스트를 생성합니다
- 사용자의 요구사항을 정확히 이해하고 반영합니다
- 한국어로 자연스럽고 읽기 쉬운 텍스트를 작성합니다"""
