"""
Ollama 클라이언트 서비스
"""
import httpx
import time
from typing import Optional, Dict, Any, List
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class OllamaClient:
    """Ollama API 클라이언트"""
    
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.timeout = settings.OLLAMA_TIMEOUT
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=self.timeout
        )
        self._available_models: Optional[List[str]] = None
    
    async def check_connection(self) -> bool:
        """Ollama 서버 연결 확인"""
        try:
            response = await self.client.get("/api/tags")
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Ollama 연결 실패: {e}")
            return False
    
    async def get_available_models(self) -> List[str]:
        """사용 가능한 모델 목록 조회"""
        if self._available_models:
            return self._available_models
        
        try:
            response = await self.client.get("/api/tags")
            if response.status_code == 200:
                data = response.json()
                models = [model["name"] for model in data.get("models", [])]
                self._available_models = models
                return models
        except Exception as e:
            logger.error(f"모델 목록 조회 실패: {e}")
        
        return []
    
    async def generate(
        self,
        prompt: str,
        model: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 2000,
        temperature: float = 0.7,
        top_p: float = 0.9,
        **kwargs
    ) -> Dict[str, Any]:
        """
        텍스트 생성
        
        Args:
            prompt: 사용자 프롬프트
            model: 사용할 모델명
            system_prompt: 시스템 프롬프트
            max_tokens: 최대 토큰 수
            temperature: 생성 온도
            top_p: Top-p 샘플링
            **kwargs: 추가 옵션
        
        Returns:
            생성 결과 딕셔너리
        """
        start_time = time.time()
        
        try:
            # 메시지 구성
            messages = []
            if system_prompt:
                messages.append({
                    "role": "system",
                    "content": system_prompt
                })
            messages.append({
                "role": "user",
                "content": prompt
            })
            
            # 요청 데이터
            request_data = {
                "model": model,
                "messages": messages,
                "stream": False,
                "options": {
                    "num_predict": max_tokens,
                    "temperature": temperature,
                    "top_p": top_p,
                    **kwargs
                }
            }
            
            # API 호출
            response = await self.client.post(
                "/api/chat",
                json=request_data
            )
            
            if response.status_code != 200:
                error_data = response.json() if response.content else {}
                raise Exception(f"Ollama API 오류: {error_data.get('error', 'Unknown error')}")
            
            data = response.json()
            
            # 응답 파싱
            content = data.get("message", {}).get("content", "")
            tokens_used = data.get("eval_count", 0) + data.get("prompt_eval_count", 0)
            
            response_time = time.time() - start_time
            
            return {
                "content": content,
                "tokens_used": tokens_used,
                "response_time": response_time,
                "model": model,
                "raw_response": data
            }
            
        except httpx.TimeoutException:
            raise Exception("Ollama 요청 타임아웃")
        except httpx.RequestError as e:
            raise Exception(f"Ollama 요청 실패: {str(e)}")
        except Exception as e:
            logger.error(f"텍스트 생성 오류: {e}")
            raise
    
    async def check_model_exists(self, model: str) -> bool:
        """모델 존재 여부 확인"""
        available_models = await self.get_available_models()
        return model in available_models
    
    async def pull_model(self, model: str) -> bool:
        """모델 다운로드"""
        try:
            response = await self.client.post(
                "/api/pull",
                json={"name": model},
                timeout=300.0  # 모델 다운로드는 시간이 걸릴 수 있음
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"모델 다운로드 실패: {e}")
            return False
    
    async def close(self):
        """클라이언트 종료"""
        await self.client.aclose()


# 전역 인스턴스
ollama_client = OllamaClient()
