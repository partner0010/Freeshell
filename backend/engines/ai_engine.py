"""
AI Engine
"""

from typing import Dict, Any
import httpx
import asyncio

from .base import BaseEngine, EngineResult
from ..utils.logger import get_logger

logger = get_logger(__name__)


class AIEngine(BaseEngine):
    """AI Engine - 무료 AI API 통합"""
    
    def __init__(self):
        super().__init__("ai_engine")
        self.providers = [
            {'name': 'ollama', 'url': 'http://localhost:11434/api/generate', 'enabled': True},
            {'name': 'huggingface', 'url': 'https://api-inference.huggingface.co/models', 'enabled': True},
        ]
        self.timeout = 30.0
    
    def run(self, task_name: str, parameters: Dict[str, Any]) -> EngineResult:
        """AI 실행"""
        try:
            # 비동기 호출을 동기로 변환
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        return loop.run_until_complete(self._run_async(task_name, parameters))
    
    async def _run_async(self, task_name: str, parameters: Dict[str, Any]) -> EngineResult:
        """비동기 실행"""
        prompt = parameters.get('prompt', '')
        
        if not prompt and task_name != 'generate_voice':
            return EngineResult(
                success=False,
                error="Prompt is required",
                fallback_available=True
            )
        
        # Provider 순서대로 시도
        for provider in self.providers:
            if not provider.get('enabled', True):
                continue
            
            try:
                result = await self._call_provider(provider, task_name, parameters)
                if result:
                    return EngineResult(
                        success=True,
                        data=result,
                        fallback_available=False
                    )
            except Exception as e:
                logger.warning(f"Provider {provider['name']} failed: {e}")
                continue
        
        # 모든 Provider 실패
        return EngineResult(
            success=False,
            error="All AI providers failed",
            fallback_available=True
        )
    
    async def _call_provider(self, provider: Dict[str, Any], task_name: str, parameters: Dict[str, Any]) -> Any:
        """Provider 호출"""
        provider_name = provider['name']
        
        if provider_name == 'ollama':
            return await self._call_ollama(task_name, parameters)
        elif provider_name == 'huggingface':
            return await self._call_huggingface(task_name, parameters)
        
        return None
    
    async def _call_ollama(self, task_name: str, parameters: Dict[str, Any]) -> Any:
        """Ollama 호출"""
        try:
            prompt = self._build_prompt(task_name, parameters)
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    'http://localhost:11434/api/generate',
                    json={
                        'model': 'llama3.1:8b',
                        'prompt': prompt,
                        'stream': False
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    return self._parse_result(task_name, data.get('response', ''))
        except Exception as e:
            logger.debug(f"Ollama error: {e}")
        return None
    
    async def _call_huggingface(self, task_name: str, parameters: Dict[str, Any]) -> Any:
        """HuggingFace 호출"""
        try:
            model = 'mistralai/Mistral-7B-Instruct-v0.2'
            prompt = self._build_prompt(task_name, parameters)
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f'https://api-inference.huggingface.co/models/{model}',
                    json={'inputs': prompt}
                )
                if response.status_code == 200:
                    return self._parse_result(task_name, response.text)
        except Exception as e:
            logger.debug(f"HuggingFace error: {e}")
        return None
    
    def _build_prompt(self, task_name: str, parameters: Dict[str, Any]) -> str:
        """프롬프트 생성"""
        if task_name == 'generate_script':
            return f"다음 주제로 30초 숏폼 스크립트를 작성하세요: {parameters.get('prompt', '')}"
        elif task_name == 'create_scenes':
            return f"다음 스크립트를 Scene으로 분할하세요: {parameters.get('script', '')}"
        elif task_name == 'generate_voice':
            return f"다음 텍스트를 음성으로 변환하세요: {parameters.get('text', '')}"
        else:
            return parameters.get('prompt', '')
    
    def _parse_result(self, task_name: str, result: str) -> Any:
        """결과 파싱"""
        if task_name == 'generate_script':
            return {'script': result}
        elif task_name == 'create_scenes':
            # JSON 파싱 시도
            import json
            try:
                return json.loads(result)
            except:
                return {'scenes': []}
        elif task_name == 'generate_voice':
            return {'text': result}
        else:
            return {'result': result}
