"""
스크립트 생성기
"""

from typing import Dict, Any
import re

from ..orchestrator import Orchestrator
from ..utils.logger import get_logger

logger = get_logger(__name__)


class ScriptGenerator:
    """스크립트 생성기"""
    
    def __init__(self, orchestrator: Orchestrator):
        self.orchestrator = orchestrator
    
    async def generate(self, prompt: str, duration: int) -> Dict[str, Any]:
        """
        스크립트 생성
        
        Args:
            prompt: 프롬프트
            duration: 영상 길이 (초)
            
        Returns:
            생성 결과
        """
        try:
            # AI Orchestrator를 통한 스크립트 생성
            context = {
                'prompt': prompt,
                'duration': duration,
                'type': 'script',
                'output_format': 'text'
            }
            
            result = await self.orchestrator.process(
                intent="generate_script",
                context=context
            )
            
            if result.success:
                script = result.data
                if isinstance(script, dict):
                    script = script.get('text', str(script))
                
                # 스크립트 정제
                script = self._clean_script(script)
                
                return {
                    'success': True,
                    'script': script
                }
            else:
                # Fallback: 규칙 기반 스크립트
                logger.warning("AI script generation failed, using fallback")
                return self._generate_fallback_script(prompt, duration)
                
        except Exception as e:
            logger.error(f"Script generation error: {e}")
            return self._generate_fallback_script(prompt, duration)
    
    def _clean_script(self, script: str) -> str:
        """스크립트 정제"""
        # 불필요한 문자 제거
        script = re.sub(r'\n{3,}', '\n\n', script)
        script = script.strip()
        return script
    
    def _generate_fallback_script(self, prompt: str, duration: int) -> Dict[str, Any]:
        """Fallback 스크립트 생성"""
        # 간단한 템플릿 기반 스크립트
        words_per_second = 2.5  # 초당 단어 수
        total_words = int(duration * words_per_second)
        
        # 프롬프트에서 키워드 추출
        keywords = prompt.split()[:5]
        
        # 기본 스크립트 생성
        script = f"{' '.join(keywords)}에 대한 이야기입니다. "
        script += f"이 영상에서는 {keywords[0] if keywords else '주제'}에 대해 알아보겠습니다. "
        script += "감사합니다."
        
        # 길이 조정
        if len(script) < total_words * 2:  # 한글은 평균 2자 = 1단어
            script = script * (total_words // len(script.split()) + 1)
        
        script = ' '.join(script.split()[:total_words])
        
        return {
            'success': True,
            'script': script,
            'fallback': True
        }
