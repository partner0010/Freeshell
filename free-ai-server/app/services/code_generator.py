"""
코드 생성 서비스
"""
from typing import Optional
from app.services.ollama_client import ollama_client
from app.config import settings
from app.models.request import GenerateCodeRequest
from app.models.response import GenerateResponse
import logging

logger = logging.getLogger(__name__)


class CodeGenerator:
    """코드 생성 서비스"""
    
    def __init__(self):
        self.default_model = settings.DEFAULT_CODE_MODEL
    
    async def generate(self, request: GenerateCodeRequest) -> GenerateResponse:
        """
        코드 생성
        
        Args:
            request: 코드 생성 요청
        
        Returns:
            생성된 코드 응답
        """
        model = request.model or self.default_model
        
        # 모델 존재 확인
        if not await ollama_client.check_model_exists(model):
            logger.warning(f"모델 {model}이 없습니다. 기본 모델 {self.default_model} 사용")
            model = self.default_model
        
        try:
            # 코드 생성용 프롬프트 구성
            prompt = self._build_code_prompt(request)
            
            # 시스템 프롬프트 구성
            system_prompt = self._get_code_system_prompt(request.language)
            
            # Ollama 호출
            result = await ollama_client.generate(
                prompt=prompt,
                model=model,
                system_prompt=system_prompt,
                max_tokens=request.max_tokens,
                temperature=request.temperature,
                top_p=0.9
            )
            
            # 코드 추출 및 정리
            code = self._extract_code(result["content"], request.language)
            
            return GenerateResponse(
                success=True,
                content=code,
                model=result["model"],
                tokens_used=result["tokens_used"],
                response_time=result["response_time"],
                cached=False
            )
            
        except Exception as e:
            logger.error(f"코드 생성 실패: {e}")
            raise Exception(f"코드 생성 중 오류 발생: {str(e)}")
    
    def _build_code_prompt(self, request: GenerateCodeRequest) -> str:
        """코드 생성 프롬프트 구성"""
        prompt_parts = [f"{request.language} 코드를 생성해주세요:"]
        prompt_parts.append(f"\n요구사항: {request.prompt}")
        
        if request.include_tests:
            prompt_parts.append("\n테스트 코드도 함께 작성해주세요.")
        
        if request.include_comments:
            prompt_parts.append("\n주석을 포함해서 작성해주세요.")
        
        return "\n".join(prompt_parts)
    
    def _get_code_system_prompt(self, language: str) -> str:
        """코드 생성용 시스템 프롬프트"""
        language_guides = {
            "python": "Python PEP 8 스타일 가이드를 따릅니다.",
            "javascript": "ES6+ 문법을 사용하고, 모던 JavaScript 패턴을 따릅니다.",
            "typescript": "TypeScript 타입 안정성을 최우선으로 합니다.",
            "java": "Java 코딩 컨벤션을 따릅니다.",
            "cpp": "C++17 표준을 사용합니다.",
        }
        
        guide = language_guides.get(language, f"{language} 모범 사례를 따릅니다.")
        
        return f"""당신은 전문 {language} 개발자입니다.
- {guide}
- 깔끔하고 읽기 쉬운 코드를 작성합니다
- 에러 처리를 포함합니다
- 효율적이고 최적화된 코드를 작성합니다
- 코드 블록만 반환하고 설명은 최소화합니다"""
    
    def _extract_code(self, content: str, language: str) -> str:
        """응답에서 코드 추출"""
        # 코드 블록 찾기
        code_block_markers = [
            f"```{language}",
            f"```{language.lower()}",
            "```",
        ]
        
        for marker in code_block_markers:
            if marker in content:
                # 코드 블록 추출
                start = content.find(marker) + len(marker)
                end = content.find("```", start)
                if end != -1:
                    return content[start:end].strip()
        
        # 코드 블록이 없으면 전체 내용 반환
        return content.strip()
