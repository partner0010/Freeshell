"""
Intent 분석
"""

from typing import Dict, Any
from dataclasses import dataclass
from enum import Enum

from .utils.logger import get_logger

logger = get_logger(__name__)


class IntentType(Enum):
    """Intent 타입"""
    CREATE_SHORTFORM = "create_shortform"
    CREATE_IMAGE = "create_image"
    CREATE_VIDEO = "create_video"
    CREATE_MOTION = "create_motion"
    CREATE_VOICE = "create_voice"
    REQUEST_EXPERT = "request_expert"
    UNKNOWN = "unknown"


@dataclass
class AnalyzedIntent:
    """분석된 Intent"""
    intent_type: IntentType
    confidence: float
    parameters: Dict[str, Any]
    original_intent: str


class IntentAnalyzer:
    """Intent 분석기"""
    
    # Intent 키워드 매핑
    INTENT_KEYWORDS = {
        IntentType.CREATE_SHORTFORM: [
            'shortform', 'short-form', 'short form',
            '숏폼', '짧은 영상', '15초', '30초', '60초'
        ],
        IntentType.CREATE_IMAGE: [
            'image', 'picture', 'photo',
            '이미지', '사진', '그림'
        ],
        IntentType.CREATE_VIDEO: [
            'video', 'movie', 'film',
            '영상', '동영상', '영화'
        ],
        IntentType.CREATE_MOTION: [
            'motion', 'animate', 'animation',
            '모션', '애니메이션', '움직임'
        ],
        IntentType.CREATE_VOICE: [
            'voice', 'audio', 'sound', 'tts',
            '음성', '소리', '목소리'
        ],
        IntentType.REQUEST_EXPERT: [
            'expert', 'help', 'support', 'assistance',
            '전문가', '도움', '지원', '상담'
        ]
    }
    
    def analyze(self, intent: str, context: Dict[str, Any]) -> AnalyzedIntent:
        """
        Intent 분석
        
        Args:
            intent: 사용자 의도 문자열
            context: 컨텍스트 데이터
            
        Returns:
            AnalyzedIntent: 분석 결과
        """
        intent_lower = intent.lower()
        
        # 키워드 매칭
        best_match = IntentType.UNKNOWN
        best_confidence = 0.0
        matched_keywords = []
        
        for intent_type, keywords in self.INTENT_KEYWORDS.items():
            matches = [kw for kw in keywords if kw in intent_lower]
            if matches:
                confidence = len(matches) / len(keywords)
                if confidence > best_confidence:
                    best_confidence = confidence
                    best_match = intent_type
                    matched_keywords = matches
        
        # 컨텍스트에서 추가 정보 추출
        parameters = self._extract_parameters(intent, context)
        
        logger.info(f"Intent analyzed: {best_match.value} (confidence: {best_confidence:.2f})")
        
        return AnalyzedIntent(
            intent_type=best_match,
            confidence=best_confidence,
            parameters=parameters,
            original_intent=intent
        )
    
    def _extract_parameters(self, intent: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """파라미터 추출"""
        parameters = {}
        
        # 컨텍스트에서 파라미터 복사
        if 'duration' in context:
            parameters['duration'] = context['duration']
        if 'style' in context:
            parameters['style'] = context['style']
        if 'prompt' in context:
            parameters['prompt'] = context['prompt']
        if 'image_path' in context:
            parameters['image_path'] = context['image_path']
        
        # Intent 문자열에서 파라미터 추출
        import re
        
        # Duration 추출 (예: "30초", "60 seconds")
        duration_match = re.search(r'(\d+)\s*(초|seconds?|s)', intent, re.IGNORECASE)
        if duration_match:
            parameters['duration'] = int(duration_match.group(1))
        
        # Style 추출 (예: "애니메이션 스타일", "realistic style")
        style_keywords = ['애니메이션', 'animation', '실사', 'realistic', '영화', 'cinematic']
        for keyword in style_keywords:
            if keyword in intent.lower():
                parameters['style'] = keyword
                break
        
        return parameters
