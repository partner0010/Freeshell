"""
Ethics Guard 시스템 (기술적 차단 버전)
"""

from typing import Dict, Any, Optional, List, Tuple
from enum import Enum
from dataclasses import dataclass, field
from datetime import datetime
import re
import os
import json

from ..utils.logger import get_logger

logger = get_logger(__name__)


class RiskLevel(Enum):
    """위험 수준"""
    SAFE = "safe"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ContentType(Enum):
    """콘텐츠 타입"""
    VOICE = "voice"
    IMAGE = "image"
    VIDEO = "video"
    TEXT = "text"
    MEMORIAL = "memorial"


class PurposeType(Enum):
    """사용 목적"""
    MEMORIAL = "memorial"
    PERSONAL_ARCHIVE = "personal_archive"
    EDUCATIONAL = "educational"
    COMMERCIAL = "commercial"
    UNKNOWN = "unknown"


@dataclass
class ConsentData:
    """동의 데이터"""
    user_id: str
    content_type: ContentType
    purpose: PurposeType
    subject_name: str
    subject_status: str  # "deceased", "living", "historical"
    consent_type: str  # "self", "legal_guardian", "family"
    consent_proof: str  # 증명서 파일 경로 또는 ID
    consent_date: datetime
    commercial_use: bool = False
    third_party_share: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'user_id': self.user_id,
            'content_type': self.content_type.value,
            'purpose': self.purpose.value,
            'subject_name': self.subject_name,
            'subject_status': self.subject_status,
            'consent_type': self.consent_type,
            'consent_proof': self.consent_proof,
            'consent_date': self.consent_date.isoformat(),
            'commercial_use': self.commercial_use,
            'third_party_share': self.third_party_share
        }


@dataclass
class RiskAssessment:
    """위험 평가 결과"""
    risk_level: RiskLevel
    blocked: bool = False
    reasons: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    required_actions: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'risk_level': self.risk_level.value,
            'blocked': self.blocked,
            'reasons': self.reasons,
            'warnings': self.warnings,
            'required_actions': self.required_actions
        }


class EthicsGuardV2:
    """Ethics Guard 시스템 (기술적 차단)"""
    
    # 금지 키워드
    PROHIBITED_KEYWORDS = [
        '복제', '모방', '사기', '속임', '위조', '가짜',
        'clone', 'impersonate', 'fraud', 'fake', 'deceive', 'counterfeit'
    ]
    
    # 위험 키워드
    RISK_KEYWORDS = [
        '정치', '선거', '투표', '의사결정', '대리',
        'politics', 'election', 'vote', 'decision', 'proxy'
    ]
    
    # 미성년자 관련
    MINOR_KEYWORDS = [
        '미성년자', '아동', '청소년', '18세 미만', '어린이',
        'minor', 'child', 'teenager', 'under 18', 'kid'
    ]
    
    # 생존 인물 관련
    LIVING_PERSON_KEYWORDS = [
        '생존', '살아있는', '현재', '지금',
        'living', 'alive', 'current', 'now'
    ]
    
    def __init__(self, storage_path: str = "storage/consents"):
        self.consent_database: Dict[str, ConsentData] = {}
        self.blocked_users: List[str] = []
        self.blocked_content: List[str] = []
        self.storage_path = storage_path
        os.makedirs(storage_path, exist_ok=True)
        self._load_consents()
    
    def register_consent(self, consent: ConsentData) -> Tuple[bool, str]:
        """동의 등록"""
        if not self._validate_consent(consent):
            return False, "Invalid consent data"
        
        consent_id = f"{consent.user_id}:{consent.subject_name}:{consent.content_type.value}"
        self.consent_database[consent_id] = consent
        self._save_consent(consent)
        
        logger.info(f"Consent registered: {consent_id}")
        return True, consent_id
    
    def check_consent(
        self,
        user_id: str,
        subject_name: str,
        content_type: ContentType,
        purpose: PurposeType
    ) -> Tuple[bool, Optional[ConsentData]]:
        """동의 확인"""
        consent_id = f"{user_id}:{subject_name}:{content_type.value}"
        consent = self.consent_database.get(consent_id)
        
        if not consent:
            return False, None
        
        if consent.purpose != purpose:
            return False, None
        
        if not self._is_consent_valid(consent):
            return False, None
        
        return True, consent
    
    def assess_risk(
        self,
        user_input: Dict[str, Any],
        consent: Optional[ConsentData] = None
    ) -> RiskAssessment:
        """위험 평가 (기술적 차단)"""
        risk_level = RiskLevel.SAFE
        reasons = []
        warnings = []
        required_actions = []
        blocked = False
        
        prompt = user_input.get('prompt', '').lower()
        content_type = ContentType(user_input.get('content_type', 'text'))
        purpose = PurposeType(user_input.get('purpose', 'unknown'))
        subject_status = user_input.get('subject_status', 'unknown')
        
        # 1. 금지 키워드 검사 (CRITICAL)
        if any(kw in prompt for kw in self.PROHIBITED_KEYWORDS):
            risk_level = RiskLevel.CRITICAL
            reasons.append("금지 키워드 감지: 복제/모방 관련")
            blocked = True
        
        # 2. 미성년자 관련 (CRITICAL)
        if any(kw in prompt for kw in self.MINOR_KEYWORDS):
            risk_level = RiskLevel.CRITICAL
            reasons.append("미성년자 관련 콘텐츠 금지")
            blocked = True
        
        # 3. 생존 인물 확인 (HIGH)
        if subject_status == "living" or any(kw in prompt for kw in self.LIVING_PERSON_KEYWORDS):
            if not consent or consent.consent_type != "self":
                risk_level = RiskLevel.HIGH
                reasons.append("생존 인물은 본인 동의 필수")
                required_actions.append("본인 직접 동의 필요")
                blocked = True
        
        # 4. 추모 콘텐츠 동의 확인 (HIGH)
        if purpose == PurposeType.MEMORIAL:
            if subject_status == "living":
                risk_level = RiskLevel.CRITICAL
                reasons.append("생존자는 추모 목적 불가")
                blocked = True
            elif not consent:
                risk_level = RiskLevel.HIGH
                reasons.append("추모 콘텐츠는 법정 대리인 동의 필수")
                required_actions.append("유족 관계 증명서 + 동의서 필요")
                blocked = True
        
        # 5. 상업적 이용 확인 (HIGH)
        if purpose == PurposeType.COMMERCIAL:
            if not consent or not consent.commercial_use:
                risk_level = RiskLevel.HIGH
                reasons.append("상업적 이용은 별도 동의 필요")
                required_actions.append("상업적 이용 동의서 필요")
                blocked = True
        
        # 6. 위험 키워드 검사 (MEDIUM)
        if any(kw in prompt for kw in self.RISK_KEYWORDS):
            if risk_level == RiskLevel.SAFE:
                risk_level = RiskLevel.MEDIUM
            warnings.append("정치적 목적 사용 위험")
            required_actions.append("사용 목적 명확화 필요")
        
        # 7. 사용자 차단 확인 (CRITICAL)
        user_id = user_input.get('user_id', '')
        if user_id in self.blocked_users:
            risk_level = RiskLevel.CRITICAL
            reasons.append("차단된 사용자")
            blocked = True
        
        return RiskAssessment(
            risk_level=risk_level,
            blocked=blocked,
            reasons=reasons,
            warnings=warnings,
            required_actions=required_actions
        )
    
    def _validate_consent(self, consent: ConsentData) -> bool:
        """동의 유효성 검증"""
        if not consent.user_id or not consent.subject_name:
            return False
        
        # 추모 콘텐츠는 법정 대리인 동의 필요
        if consent.purpose == PurposeType.MEMORIAL:
            if consent.subject_status == "living":
                return False
            if consent.consent_type not in ["legal_guardian", "family"]:
                return False
        
        # 생존 인물은 본인 동의 필요
        if consent.subject_status == "living":
            if consent.consent_type != "self":
                return False
        
        return True
    
    def _is_consent_valid(self, consent: ConsentData) -> bool:
        """동의 유효성 확인"""
        days_since_consent = (datetime.now() - consent.consent_date).days
        if days_since_consent > 365:
            return False
        return True
    
    def block_user(self, user_id: str, reason: str):
        """사용자 차단"""
        if user_id not in self.blocked_users:
            self.blocked_users.append(user_id)
            self._save_blocked_users()
            logger.warning(f"User blocked: {user_id}, reason: {reason}")
    
    def block_content(self, content_id: str, reason: str):
        """콘텐츠 차단"""
        if content_id not in self.blocked_content:
            self.blocked_content.append(content_id)
            self._save_blocked_content()
            logger.warning(f"Content blocked: {content_id}, reason: {reason}")
    
    def _save_consent(self, consent: ConsentData):
        """동의 저장"""
        consent_id = f"{consent.user_id}:{consent.subject_name}:{consent.content_type.value}"
        file_path = os.path.join(self.storage_path, f"{consent_id}.json")
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(consent.to_dict(), f, ensure_ascii=False, indent=2)
    
    def _load_consents(self):
        """동의 로드"""
        if not os.path.exists(self.storage_path):
            return
        
        for filename in os.listdir(self.storage_path):
            if filename.endswith('.json'):
                file_path = os.path.join(self.storage_path, filename)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    consent = ConsentData(
                        user_id=data['user_id'],
                        content_type=ContentType(data['content_type']),
                        purpose=PurposeType(data['purpose']),
                        subject_name=data['subject_name'],
                        subject_status=data['subject_status'],
                        consent_type=data['consent_type'],
                        consent_proof=data['consent_proof'],
                        consent_date=datetime.fromisoformat(data['consent_date']),
                        commercial_use=data.get('commercial_use', False),
                        third_party_share=data.get('third_party_share', False)
                    )
                    
                    consent_id = f"{consent.user_id}:{consent.subject_name}:{consent.content_type.value}"
                    self.consent_database[consent_id] = consent
                except Exception as e:
                    logger.error(f"Error loading consent {filename}: {e}")
    
    def _save_blocked_users(self):
        """차단된 사용자 저장"""
        file_path = os.path.join(self.storage_path, "blocked_users.json")
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(self.blocked_users, f, ensure_ascii=False, indent=2)
    
    def _save_blocked_content(self):
        """차단된 콘텐츠 저장"""
        file_path = os.path.join(self.storage_path, "blocked_content.json")
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(self.blocked_content, f, ensure_ascii=False, indent=2)
