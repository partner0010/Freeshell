"""
Intent 분석
"""

from typing import Dict, Any
import re

from ..utils.logger import get_logger

logger = get_logger(__name__)


def analyze_intent(request: Dict[str, Any]) -> Dict[str, Any]:
    """
    Intent 분석
    
    Args:
        request: 사용자 요청
        
    Returns:
        분석된 Intent
    """
    prompt = request.get('prompt', '').lower()
    content_type = request.get('type', '').lower()
    
    # 타입이 명시되어 있으면 사용
    if content_type:
        intent_type = content_type
    else:
        # 프롬프트에서 타입 추출
        intent_type = _extract_type_from_prompt(prompt)
    
    # 파라미터 추출
    parameters = _extract_parameters(prompt, request)
    
    return {
        'type': intent_type,
        'confidence': 1.0,
        'parameters': parameters,
        'original_prompt': request.get('prompt', '')
    }


def _extract_type_from_prompt(prompt: str) -> str:
    """프롬프트에서 타입 추출"""
    if any(kw in prompt for kw in ['숏폼', 'shortform', 'short-form', '15초', '30초', '60초']):
        return 'shortform'
    elif any(kw in prompt for kw in ['이미지', 'image', '사진', 'picture']):
        return 'image'
    elif any(kw in prompt for kw in ['모션', 'motion', '움직임', '애니메이션']):
        return 'motion'
    elif any(kw in prompt for kw in ['음성', 'voice', 'tts', '목소리']):
        return 'voice'
    else:
        return 'shortform'  # 기본값


def _extract_parameters(prompt: str, request: Dict[str, Any]) -> Dict[str, Any]:
    """파라미터 추출"""
    parameters = {}
    
    # Duration 추출
    duration_match = re.search(r'(\d+)\s*(초|seconds?|s)', prompt)
    if duration_match:
        parameters['duration'] = int(duration_match.group(1))
    elif 'duration' in request:
        parameters['duration'] = request['duration']
    else:
        parameters['duration'] = 30  # 기본값
    
    # Style 추출
    style_keywords = {
        'animation': ['애니메이션', 'animation', '만화'],
        'realistic': ['실사', 'realistic', '사진'],
        'cinematic': ['영화', 'cinematic', '영화적']
    }
    
    for style, keywords in style_keywords.items():
        if any(kw in prompt for kw in keywords):
            parameters['style'] = style
            break
    
    if 'style' not in parameters:
        parameters['style'] = request.get('style', 'animation')
    
    # Emotion 추출
    emotion_keywords = {
        'happy': ['행복', '기쁨', 'happy', 'joy'],
        'sad': ['슬픔', 'sad', 'depressed'],
        'calm': ['차분', 'calm', 'peaceful'],
        'excited': ['흥분', 'excited', 'thrilled']
    }
    
    for emotion, keywords in emotion_keywords.items():
        if any(kw in prompt for kw in keywords):
            parameters['emotion'] = emotion
            break
    
    # Request의 options 병합
    if 'options' in request:
        parameters.update(request['options'])
    
    return parameters
