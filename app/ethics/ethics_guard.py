"""
Ethics Guard
"""

from typing import Dict, Any
import re

from ..utils.logger import get_logger

logger = get_logger(__name__)


# 금지 키워드
PROHIBITED_KEYWORDS = [
    '복제', '모방', '사기', '속임', '위조',
    'clone', 'impersonate', 'fraud', 'fake'
]

# 미성년자 관련
MINOR_KEYWORDS = [
    '미성년자', '아동', '청소년', '18세 미만',
    'minor', 'child', 'teenager', 'under 18'
]


def check_ethics(request: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ethics 검증
    
    Args:
        request: 사용자 요청
        
    Returns:
        검증 결과
    """
    prompt = request.get('prompt', '').lower()
    purpose = request.get('purpose', 'unknown')
    subject_status = request.get('subject_status', 'unknown')
    
    # 1. 금지 키워드 검사
    if any(kw in prompt for kw in PROHIBITED_KEYWORDS):
        return {
            'allowed': False,
            'message': '금지 키워드가 감지되었습니다'
        }
    
    # 2. 미성년자 관련
    if any(kw in prompt for kw in MINOR_KEYWORDS):
        return {
            'allowed': False,
            'message': '미성년자 관련 콘텐츠는 금지됩니다'
        }
    
    # 3. 추모 콘텐츠 검증
    if purpose == 'memorial':
        if subject_status == 'living':
            return {
                'allowed': False,
                'message': '생존자는 추모 목적으로 사용할 수 없습니다'
            }
        # 동의 확인은 별도로 처리
    
    # 4. 생존 인물 검증
    if subject_status == 'living':
        consent = request.get('consent')
        if not consent or consent.get('type') != 'self':
            return {
                'allowed': False,
                'message': '생존 인물은 본인 동의가 필요합니다'
            }
    
    return {
        'allowed': True,
        'message': 'Ethics check passed'
    }
