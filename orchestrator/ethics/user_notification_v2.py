"""
사용자 고지 UX (기술적 통합 버전)
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from enum import Enum

from .ethics_guard_v2 import ConsentData, PurposeType, ContentType, RiskLevel


class NotificationType(Enum):
    """고지 타입"""
    CONSENT_REQUIRED = "consent_required"
    AI_GENERATED = "ai_generated"
    PURPOSE_RESTRICTION = "purpose_restriction"
    DATA_RETENTION = "data_retention"
    RISK_WARNING = "risk_warning"
    BLOCKED = "blocked"
    DISPUTE_INFO = "dispute_info"


@dataclass
class UserNotification:
    """사용자 고지"""
    type: NotificationType
    title: str
    message: str
    required_action: Optional[str] = None
    buttons: List[Dict[str, str]] = None
    dismissible: bool = True
    priority: str = "normal"  # low, normal, high, critical
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': self.type.value,
            'title': self.title,
            'message': self.message,
            'required_action': self.required_action,
            'buttons': self.buttons or [],
            'dismissible': self.dismissible,
            'priority': self.priority
        }


class NotificationManagerV2:
    """고지 관리자 (기술적 통합)"""
    
    def get_consent_notification(
        self,
        purpose: PurposeType,
        content_type: ContentType,
        subject_status: str,
        risk_level: RiskLevel
    ) -> UserNotification:
        """동의 필요 고지"""
        if purpose == PurposeType.MEMORIAL:
            if subject_status == "deceased":
                return UserNotification(
                    type=NotificationType.CONSENT_REQUIRED,
                    title="추모 콘텐츠 생성 동의 필요",
                    message=(
                        "고인에 대한 추모 콘텐츠를 생성하려면 "
                        "법정 대리인(유족)의 동의가 필요합니다.\n\n"
                        "필요한 서류:\n"
                        "☑ 유족 관계 증명서\n"
                        "☑ 추모 목적 확인서\n"
                        "☑ 동의서 (서명)\n\n"
                        "⚠️ 중요: 생존 중인 인물은 추모 목적으로 사용할 수 없습니다."
                    ),
                    required_action="consent_upload",
                    buttons=[
                        {'label': '동의서 업로드', 'action': 'upload_consent'},
                        {'label': '취소', 'action': 'cancel'}
                    ],
                    dismissible=False,
                    priority="high"
                )
        
        elif purpose == PurposeType.COMMERCIAL:
            return UserNotification(
                type=NotificationType.CONSENT_REQUIRED,
                title="상업적 이용 동의 필요",
                message=(
                    "상업적 목적으로 콘텐츠를 사용하려면 "
                    "별도의 라이선스 동의가 필요합니다.\n\n"
                    "상업적 이용 포함:\n"
                    "• 광고, 마케팅\n"
                    "• 상품 판매\n"
                    "• 브랜드 홍보\n"
                    "• 수익 창출"
                ),
                required_action="commercial_consent",
                buttons=[
                    {'label': '동의서 작성', 'action': 'create_consent'},
                    {'label': '취소', 'action': 'cancel'}
                ],
                dismissible=False,
                priority="high"
            )
        
        elif subject_status == "living":
            return UserNotification(
                type=NotificationType.CONSENT_REQUIRED,
                title="생존 인물 동의 필요",
                message=(
                    "생존 중인 인물의 콘텐츠를 생성하려면 "
                    "본인의 직접 동의가 필요합니다.\n\n"
                    "⚠️ 중요:\n"
                    "• 본인만 동의할 수 있습니다\n"
                    "• 대리인 동의는 인정되지 않습니다\n"
                    "• 동의서는 법적 효력이 있습니다"
                ),
                required_action="self_consent",
                buttons=[
                    {'label': '본인 동의하기', 'action': 'self_consent'},
                    {'label': '취소', 'action': 'cancel'}
                ],
                dismissible=False,
                priority="critical"
            )
        
        else:
            return UserNotification(
                type=NotificationType.CONSENT_REQUIRED,
                title="동의 권장",
                message=(
                    "개인 정보 보호를 위해 동의를 권장합니다.\n\n"
                    "동의 시 더 안전하게 콘텐츠를 생성할 수 있습니다."
                ),
                required_action="optional_consent",
                buttons=[
                    {'label': '동의하기', 'action': 'consent'},
                    {'label': '건너뛰기', 'action': 'skip'}
                ],
                dismissible=True,
                priority="normal"
            )
    
    def get_ai_generated_notification(self) -> UserNotification:
        """AI 생성물 고지"""
        return UserNotification(
            type=NotificationType.AI_GENERATED,
            title="⚠️ AI 생성 콘텐츠",
            message=(
                "이 콘텐츠는 AI로 생성되었습니다.\n\n"
                "중요 고지:\n"
                "• 실제 인물이 아닙니다\n"
                "• 실제 음성/이미지가 아닙니다\n"
                "• 교육/추모 목적으로만 사용하세요\n"
                "• 상업적 이용 시 별도 동의 필요"
            ),
            dismissible=True,
            priority="normal"
        )
    
    def get_blocked_notification(
        self,
        reasons: List[str],
        risk_level: RiskLevel
    ) -> UserNotification:
        """차단 고지"""
        if risk_level == RiskLevel.CRITICAL:
            return UserNotification(
                type=NotificationType.BLOCKED,
                title="❌ 요청이 차단되었습니다",
                message=(
                    f"요청이 차단되었습니다.\n\n"
                    f"사유:\n" + "\n".join(f"• {r}" for r in reasons) + "\n\n"
                    f"문의사항이 있으시면 고객지원에 연락해주세요."
                ),
                dismissible=False,
                buttons=[
                    {'label': '고객지원 문의', 'action': 'contact_support'},
                    {'label': '확인', 'action': 'close'}
                ],
                priority="critical"
            )
        else:
            return UserNotification(
                type=NotificationType.BLOCKED,
                title="요청이 차단되었습니다",
                message=f"사유: {', '.join(reasons)}",
                dismissible=False,
                priority="high"
            )
    
    def get_dispute_notification(self) -> UserNotification:
        """분쟁 대응 안내"""
        return UserNotification(
            type=NotificationType.DISPUTE_INFO,
            title="분쟁 대응 안내",
            message=(
                "콘텐츠 사용에 대한 분쟁이 발생한 경우:\n\n"
                "1. 즉시 사용 중단\n"
                "2. 고객지원에 신고\n"
                "3. 관련 증거 자료 제출\n"
                "4. 법적 절차 진행 (필요 시)\n\n"
                "플랫폼은 분쟁 해결을 위해 최선을 다합니다."
            ),
            dismissible=True,
            priority="normal"
        )
    
    def get_notification_sequence(
        self,
        purpose: PurposeType,
        content_type: ContentType,
        subject_status: str,
        has_consent: bool,
        risk_assessment: Optional[Dict[str, Any]] = None
    ) -> List[UserNotification]:
        """고지 시퀀스 생성"""
        notifications = []
        
        # 1. 동의 필요 고지
        if not has_consent:
            risk_level = RiskLevel(risk_assessment.get('risk_level', 'safe')) if risk_assessment else RiskLevel.SAFE
            notifications.append(
                self.get_consent_notification(purpose, content_type, subject_status, risk_level)
            )
        
        # 2. AI 생성물 고지
        notifications.append(self.get_ai_generated_notification())
        
        # 3. 차단 고지 (차단된 경우)
        if risk_assessment and risk_assessment.get('blocked'):
            notifications.append(
                self.get_blocked_notification(
                    risk_assessment.get('reasons', []),
                    RiskLevel(risk_assessment.get('risk_level', 'critical'))
                )
            )
        
        # 4. 분쟁 대응 안내
        notifications.append(self.get_dispute_notification())
        
        return notifications
