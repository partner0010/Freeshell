"""
AI Engine 구현
"""

import asyncio
import httpx
import logging
from typing import Dict, Any, Optional
from datetime import datetime

from ..core.engine import Engine, EngineType, EngineResult
from ..utils.logger import get_logger

logger = get_logger(__name__)


class AIEngine(Engine):
    """AI Engine - 무료 AI API 통합"""
    
    def __init__(self, name: str = "ai_engine", priority: int = 0):
        super().__init__(name, EngineType.AI, priority)
        self.providers = [
            {'name': 'ollama', 'url': 'http://localhost:11434/api/generate', 'enabled': True},
            {'name': 'huggingface', 'url': 'https://api-inference.huggingface.co/models', 'enabled': True},
            {'name': 'groq', 'url': 'https://api.groq.com/openai/v1/chat/completions', 'enabled': True},
        ]
        self.timeout = 30.0
    
    async def execute(self, input_data: Dict[str, Any]) -> EngineResult:
        """AI 실행"""
        start_time = datetime.now()
        prompt = input_data.get('prompt', '')
        content_type = input_data.get('type', 'text')
        
        if not prompt:
            return EngineResult(
                success=False,
                data=None,
                engine_name=self.name,
                engine_type=self.engine_type,
                execution_time=0.0,
                error="Prompt is required",
                fallback_available=True
            )
        
        # Provider 순서대로 시도
        for provider in self.providers:
            if not provider.get('enabled', True):
                continue
            
            try:
                result = await self._call_provider(provider, prompt, content_type, input_data)
                if result:
                    execution_time = (datetime.now() - start_time).total_seconds()
                    return EngineResult(
                        success=True,
                        data=result,
                        engine_name=self.name,
                        engine_type=self.engine_type,
                        execution_time=execution_time,
                        metadata={'provider': provider['name']},
                        fallback_available=False
                    )
            except Exception as e:
                logger.warning(f"Provider {provider['name']} failed: {e}")
                continue
        
        # 모든 Provider 실패
        execution_time = (datetime.now() - start_time).total_seconds()
        return EngineResult(
            success=False,
            data=None,
            engine_name=self.name,
            engine_type=self.engine_type,
            execution_time=execution_time,
            error="All AI providers failed",
            fallback_available=True
        )
    
    async def _call_provider(self, provider: Dict[str, Any], prompt: str, content_type: str, input_data: Dict[str, Any]) -> Optional[Any]:
        """Provider 호출"""
        provider_name = provider['name']
        
        if provider_name == 'ollama':
            return await self._call_ollama(prompt, content_type)
        elif provider_name == 'huggingface':
            return await self._call_huggingface(prompt, content_type)
        elif provider_name == 'groq':
            return await self._call_groq(prompt, content_type)
        
        return None
    
    async def _call_ollama(self, prompt: str, content_type: str) -> Optional[str]:
        """Ollama 호출"""
        try:
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
                    return data.get('response', '')
        except Exception as e:
            logger.debug(f"Ollama error: {e}")
        return None
    
    async def _call_huggingface(self, prompt: str, content_type: str) -> Optional[str]:
        """HuggingFace 호출"""
        try:
            model = 'mistralai/Mistral-7B-Instruct-v0.2' if content_type == 'text' else 'stabilityai/stable-diffusion-2-1'
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {}
                # API 키가 있으면 사용
                api_key = input_data.get('hf_api_key')
                if api_key:
                    headers['Authorization'] = f'Bearer {api_key}'
                
                if content_type == 'text':
                    response = await client.post(
                        f'https://api-inference.huggingface.co/models/{model}',
                        headers=headers,
                        json={'inputs': prompt}
                    )
                else:
                    response = await client.post(
                        f'https://api-inference.huggingface.co/models/{model}',
                        headers=headers,
                        json={'inputs': prompt}
                    )
                
                if response.status_code == 200:
                    if content_type == 'text':
                        return response.text
                    else:
                        # 이미지 URL 반환
                        return response.url
        except Exception as e:
            logger.debug(f"HuggingFace error: {e}")
        return None
    
    async def _call_groq(self, prompt: str, content_type: str) -> Optional[str]:
        """Groq 호출"""
        try:
            api_key = input_data.get('groq_api_key')
            if not api_key:
                return None
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    'https://api.groq.com/openai/v1/chat/completions',
                    headers={
                        'Authorization': f'Bearer {api_key}',
                        'Content-Type': 'application/json'
                    },
                    json={
                        'model': 'llama-3.1-8b-instant',
                        'messages': [{'role': 'user', 'content': prompt}],
                        'temperature': 0.7
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    return data['choices'][0]['message']['content']
        except Exception as e:
            logger.debug(f"Groq error: {e}")
        return None
    
    def can_handle(self, intent: str, context: Dict[str, Any]) -> bool:
        """처리 가능 여부"""
        # AI는 대부분의 intent 처리 가능
        return True
