"""
Intent 분석
"""

import re
from typing import Dict, Any
from ..utils.logger import get_logger

logger = get_logger(__name__)


class IntentAnalyzer:
    """Intent Analyzer"""
    
    # Intent 패턴
    INTENT_PATTERNS = {
        'create_text': [
            r'글.*작성', r'텍스트.*생성', r'블로그', r'포스트',
            r'write', r'create.*text', r'blog'
        ],
        'create_image': [
            r'이미지.*생성', r'그림.*만들', r'사진',
            r'image', r'picture', r'generate.*image'
        ],
        'create_video': [
            r'영상.*만들', r'비디오.*생성', r'동영상',
            r'video', r'create.*video'
        ],
        'edit_content': [
            r'수정', r'편집', r'edit', r'modify'
        ],
        'translate': [
            r'번역', r'translate'
        ],
        'summarize': [
            r'요약', r'정리', r'summarize', r'summary'
        ]
    }
    
    async def analyze(self, user_input: Dict[str, Any]) -> str:
        """Intent 분석"""
        prompt = user_input.get('prompt', '').lower()
        content_type = user_input.get('type', '')
        
        # 타입 기반 Intent
        if content_type:
            if content_type == 'text':
                return 'create_text'
            elif content_type == 'image':
                return 'create_image'
            elif content_type == 'video':
                return 'create_video'
        
        # 프롬프트 기반 Intent 분석
        for intent, patterns in self.INTENT_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, prompt):
                    logger.info(f"Intent detected: {intent} (pattern: {pattern})")
                    return intent
        
        # 기본 Intent
        return 'create_text'
