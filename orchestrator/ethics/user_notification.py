"""
사용자 고지 UX
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from enum import Enum

from .ethics_guard import ConsentData, PurposeType, ContentType


class NotificationType(Enum):
    """고지 타입"""
    CONSENT_REQUIRED = "consent_required"
    AI_GENERATED = "ai_generated"
    PURPOSE_RESTRICTION = "purpose_restriction"
    DATA_RETENTION = "data_retention"
    RISK_WARNING = "risk_warning"
    BLOCKED = "blocked"


@dataclass
class UserNotification:
    """사용자 고지"""
    type: NotificationType
    title: str
    message: str
    required_action: Optional[str] = None
    buttons: List[Dict[str, str]] = None
    dismissible: bool = True
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': self.type.value,
            'title': self.title,
            'message': self.message,
            'required_action': self.required_action,
            'buttons': self.buttons or [],
            'dismissible': self.dismissible
        }


class NotificationManager:
    """고지 관리자"""
    
    def get_consent_notification(
        self,
        purpose: PurposeType,
        content_type: ContentType,
        subject_status: str
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
                        "- 유족 관계 증명서\n"
                        "- 추모 목적 확인서\n"
                        "- 동의서"
                    ),
                    required_action="consent_upload",
                    buttons=[
                        {'label': '동의서 업로드', 'action': 'upload_consent'},
                        {'label': '취소', 'action': 'cancel'}
                    ],
                    dismissible=False
                )
        
        elif purpose == PurposeType.COMMERCIAL:
            return UserNotification(
                type=NotificationType.CONSENT_REQUIRED,
                title="상업적 이용 동의 필요",
                message=(
                    "상업적 목적으로 콘텐츠를 사용하려면 "
                    "별도의 라이선스 동의가 필요합니다.\n\n"
                    "상업적 이용에는 다음이 포함됩니다:\n"
                    "- 광고, 마케팅\n"
                    "- 상품 판매\n"
                    "- 브랜드 홍보"
                ),
                required_action="commercial_consent",
                buttons=[
                    {'label': '동의서 작성', 'action': 'create_consent'},
                    {'label': '취소', 'action': 'cancel'}
                ],
                dismissible=False
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
                dismissible=True
            )
    
    def get_ai_generated_notification(self) -> UserNotification:
        """AI 생성물 고지"""
        return UserNotification(
            type=NotificationType.AI_GENERATED,
            title="AI 생성 콘텐츠",
            message=(
                "이 콘텐츠는 AI로 생성되었습니다.\n\n"
                "⚠️ 중요:\n"
                "- 실제 인물이 아닙니다\n"
                "- 실제 음성/이미지가 아닙니다\n"
                "- 교육/추모 목적으로만 사용하세요"
            ),
            dismissible=True
        )
    
    def get_purpose_restriction_notification(
        self,
        purpose: PurposeType
    ) -> UserNotification:
        """목적 제한 고지"""
        restrictions = {
            PurposeType.MEMORIAL: (
                "추모 콘텐츠는 추모 및 기억 보존 목적으로만 사용할 수 있습니다.\n\n"
                "금지 사항:\n"
                "- 상업적 이용\n"
                "- 제3자 공유 (동의 없이)\n"
                "- 오용 목적"
            ),
            PurposeType.PERSONAL_ARCHIVE: (
                "개인 보관 콘텐츠는 본인 및 가족만 사용할 수 있습니다.\n\n"
                "금지 사항:\n"
                "- 공개 공유\n"
                "- 상업적 이용\n"
                "- 제3자 전송"
            ),
            PurposeType.EDUCATIONAL: (
                "교육 콘텐츠는 교육 및 연구 목적으로만 사용할 수 있습니다.\n\n"
                "요구사항:\n"
                "- 사실 기반 재현\n"
                "- 교육 목적 명시\n"
                "- 출처 표기"
            )
        }
        
        return UserNotification(
            type=NotificationType.PURPOSE_RESTRICTION,
            title="사용 목적 제한",
            message=restrictions.get(purpose, "사용 목적에 따라 제한이 적용됩니다."),
            dismissible=True
        )
    
    def get_data_retention_notification(
        self,
        purpose: PurposeType
    ) -> UserNotification:
        """데이터 보관 고지"""
        retention_info = {
            PurposeType.MEMORIAL: (
                "추모 콘텐츠는 요청 시까지 보관됩니다.\n\n"
                "삭제를 원하시면 언제든지 요청하실 수 있습니다."
            ),
            PurposeType.PERSONAL_ARCHIVE: (
                "개인 보관 콘텐츠는 계정 삭제 시 함께 삭제됩니다.\n\n"
                "데이터는 암호화되어 안전하게 보관됩니다."
            ),
            PurposeType.EDUCATIONAL: (
                "교육 콘텐츠는 공개 도메인으로 전환될 수 있습니다.\n\n"
                "전환 전 별도 안내를 드립니다."
            )
        }
        
        return UserNotification(
            type=NotificationType.DATA_RETENTION,
            title="데이터 보관 정책",
            message=retention_info.get(purpose, "데이터는 사용 목적에 따라 보관됩니다."),
            dismissible=True
        )
    
    def get_risk_warning_notification(
        self,
        warnings: List[str]
    ) -> UserNotification:
        """위험 경고"""
        return UserNotification(
            type=NotificationType.RISK_WARNING,
            title="주의 필요",
            message=f"다음 사항에 주의하세요:\n\n" + "\n".join(f"- {w}" for w in warnings),
            dismissible=True
        )
    
    def get_blocked_notification(
        self,
        reason: str
    ) -> UserNotification:
        """차단 고지"""
        return UserNotification(
            type=NotificationType.BLOCKED,
            title="요청이 차단되었습니다",
            message=(
                f"요청이 차단되었습니다.\n\n"
                f"사유: {reason}\n\n"
                "문의사항이 있으시면 고객지원에 연락해주세요."
            ),
            dismissible=False,
            buttons=[
                {'label': '고객지원 문의', 'action': 'contact_support'},
                {'label': '확인', 'action': 'close'}
            ]
        )
    
    def get_notification_sequence(
        self,
        purpose: PurposeType,
        content_type: ContentType,
        subject_status: str,
        has_consent: bool,
        risk_warnings: Optional[List[str]] = None
    ) -> List[UserNotification]:
        """고지 시퀀스 생성"""
        notifications = []
        
        # 1. 동의 필요 고지
        if not has_consent:
            notifications.append(
                self.get_consent_notification(purpose, content_type, subject_status)
            )
        
        # 2. AI 생성물 고지
        notifications.append(self.get_ai_generated_notification())
        
        # 3. 목적 제한 고지
        notifications.append(self.get_purpose_restriction_notification(purpose))
        
        # 4. 데이터 보관 고지
        notifications.append(self.get_data_retention_notification(purpose))
        
        # 5. 위험 경고
        if risk_warnings:
            notifications.append(self.get_risk_warning_notification(risk_warnings))
        
        return notifications
