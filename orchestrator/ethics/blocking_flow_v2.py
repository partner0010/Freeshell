"""
위험 차단 플로우 (기술적 차단 버전)
"""

from typing import Dict, Any, Optional, List, Tuple
from enum import Enum
from datetime import datetime

from .ethics_guard_v2 import EthicsGuardV2, RiskLevel, RiskAssessment, ConsentData, ContentType, PurposeType
from ..utils.logger import get_logger

logger = get_logger(__name__)


class BlockingAction(Enum):
    """차단 액션"""
    ALLOW = "allow"
    WARN = "warn"
    REQUIRE_CONSENT = "require_consent"
    BLOCK = "block"
    ESCALATE = "escalate"  # 관리자 검토


class BlockingFlowV2:
    """차단 플로우 관리 (기술적 차단)"""
    
    def __init__(self, ethics_guard: EthicsGuardV2):
        self.ethics_guard = ethics_guard
        self.escalation_queue: List[Dict[str, Any]] = []
    
    async def process_request(
        self,
        user_input: Dict[str, Any],
        user_id: str
    ) -> Dict[str, Any]:
        """
        요청 처리 및 차단 플로우
        
        Returns:
            {
                'allowed': bool,
                'action': BlockingAction,
                'risk_assessment': RiskAssessment,
                'message': str,
                'required_consent': Optional[ConsentData]
            }
        """
        # 1. 기본 검증
        basic_check = self._basic_validation(user_input)
        if not basic_check['valid']:
            return {
                'allowed': False,
                'action': BlockingAction.BLOCK.value,
                'risk_assessment': None,
                'message': basic_check['reason'],
                'required_consent': None
            }
        
        # 2. 동의 확인
        content_type = ContentType(user_input.get('content_type', 'text'))
        purpose = PurposeType(user_input.get('purpose', 'unknown'))
        subject_name = user_input.get('subject_name', '')
        
        consent = None
        has_consent = False
        
        if subject_name:
            has_consent, consent = self.ethics_guard.check_consent(
                user_id, subject_name, content_type, purpose
            )
        
        # 3. 위험 평가 (기술적 차단)
        risk_assessment = self.ethics_guard.assess_risk(user_input, consent)
        
        # 4. 즉시 차단 (CRITICAL)
        if risk_assessment.blocked and risk_assessment.risk_level == RiskLevel.CRITICAL:
            self._execute_block(user_id, user_input, risk_assessment)
            return {
                'allowed': False,
                'action': BlockingAction.BLOCK.value,
                'risk_assessment': risk_assessment.to_dict(),
                'message': f"요청이 차단되었습니다: {', '.join(risk_assessment.reasons)}",
                'required_consent': None
            }
        
        # 5. 차단 결정
        action, message = self._determine_action(risk_assessment, has_consent, purpose)
        
        # 6. 액션 실행
        if action == BlockingAction.BLOCK:
            self._execute_block(user_id, user_input, risk_assessment)
        elif action == BlockingAction.REQUIRE_CONSENT:
            # 동의 필요 안내
            pass
        elif action == BlockingAction.ESCALATE:
            self._escalate_to_admin(user_id, user_input, risk_assessment)
        
        return {
            'allowed': action == BlockingAction.ALLOW,
            'action': action.value,
            'risk_assessment': risk_assessment.to_dict(),
            'message': message,
            'required_consent': consent.to_dict() if consent else None
        }
    
    def _basic_validation(self, user_input: Dict[str, Any]) -> Dict[str, Any]:
        """기본 검증"""
        if not user_input.get('prompt'):
            return {'valid': False, 'reason': '프롬프트가 필요합니다'}
        
        purpose = user_input.get('purpose', 'unknown')
        if purpose == 'unknown':
            return {'valid': False, 'reason': '사용 목적을 명시해야 합니다'}
        
        return {'valid': True}
    
    def _determine_action(
        self,
        risk_assessment: RiskAssessment,
        has_consent: bool,
        purpose: PurposeType
    ) -> tuple[BlockingAction, str]:
        """차단 액션 결정"""
        if risk_assessment.blocked:
            return BlockingAction.BLOCK, "요청이 차단되었습니다"
        
        if risk_assessment.risk_level == RiskLevel.CRITICAL:
            return BlockingAction.BLOCK, "위험 수준이 높아 차단되었습니다"
        
        if risk_assessment.risk_level == RiskLevel.HIGH:
            if not has_consent:
                if purpose == PurposeType.MEMORIAL:
                    return BlockingAction.REQUIRE_CONSENT, "추모 콘텐츠는 법정 대리인 동의가 필요합니다"
                elif purpose == PurposeType.COMMERCIAL:
                    return BlockingAction.REQUIRE_CONSENT, "상업적 이용은 별도 동의가 필요합니다"
                else:
                    return BlockingAction.REQUIRE_CONSENT, "동의가 필요합니다"
            else:
                return BlockingAction.ESCALATE, "관리자 검토가 필요합니다"
        
        if risk_assessment.risk_level == RiskLevel.MEDIUM:
            if risk_assessment.warnings:
                return BlockingAction.WARN, f"경고: {', '.join(risk_assessment.warnings)}"
            return BlockingAction.ALLOW, "허용됨 (주의 필요)"
        
        # SAFE or LOW
        return BlockingAction.ALLOW, "허용됨"
    
    def _execute_block(
        self,
        user_id: str,
        user_input: Dict[str, Any],
        risk_assessment: RiskAssessment
    ):
        """차단 실행"""
        logger.warning(f"Request blocked for user {user_id}: {risk_assessment.reasons}")
        
        # 반복적인 위험 요청 시 사용자 차단
        if len(risk_assessment.reasons) > 2:
            self.ethics_guard.block_user(user_id, "반복적인 위험 요청")
    
    def _escalate_to_admin(
        self,
        user_id: str,
        user_input: Dict[str, Any],
        risk_assessment: RiskAssessment
    ):
        """관리자에게 에스컬레이션"""
        escalation = {
            'user_id': user_id,
            'user_input': user_input,
            'risk_assessment': risk_assessment.to_dict(),
            'timestamp': datetime.now().isoformat()
        }
        self.escalation_queue.append(escalation)
        logger.info(f"Request escalated to admin: {user_id}")
    
    def get_escalation_queue(self) -> List[Dict[str, Any]]:
        """에스컬레이션 큐 조회"""
        return self.escalation_queue
    
    def resolve_escalation(self, escalation_id: int, decision: str):
        """에스컬레이션 해결"""
        if 0 <= escalation_id < len(self.escalation_queue):
            escalation = self.escalation_queue[escalation_id]
            escalation['decision'] = decision
            escalation['resolved_at'] = datetime.now().isoformat()
            logger.info(f"Escalation resolved: {escalation_id}, decision: {decision}")
