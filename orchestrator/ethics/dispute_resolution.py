"""
분쟁 대응 구조
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
import os
import json

from ..utils.logger import get_logger

logger = get_logger(__name__)


class DisputeStatus(Enum):
    """분쟁 상태"""
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    RESOLVED = "resolved"
    ESCALATED = "escalated"
    CLOSED = "closed"


class DisputeType(Enum):
    """분쟁 타입"""
    UNAUTHORIZED_USE = "unauthorized_use"
    CONSENT_VIOLATION = "consent_violation"
    COPYRIGHT_INFRINGEMENT = "copyright_infringement"
    PRIVACY_VIOLATION = "privacy_violation"
    OTHER = "other"


@dataclass
class Dispute:
    """분쟁 정보"""
    dispute_id: str
    user_id: str
    content_id: str
    dispute_type: DisputeType
    description: str
    status: DisputeStatus = DisputeStatus.PENDING
    evidence_files: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    resolved_at: Optional[datetime] = None
    resolution: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'dispute_id': self.dispute_id,
            'user_id': self.user_id,
            'content_id': self.content_id,
            'dispute_type': self.dispute_type.value,
            'description': self.description,
            'status': self.status.value,
            'evidence_files': self.evidence_files,
            'created_at': self.created_at.isoformat(),
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'resolution': self.resolution
        }


class DisputeResolution:
    """분쟁 대응 시스템"""
    
    def __init__(self, storage_path: str = "storage/disputes"):
        self.storage_path = storage_path
        self.disputes: Dict[str, Dispute] = {}
        os.makedirs(storage_path, exist_ok=True)
        self._load_disputes()
    
    def create_dispute(
        self,
        user_id: str,
        content_id: str,
        dispute_type: DisputeType,
        description: str,
        evidence_files: List[str] = None
    ) -> str:
        """분쟁 생성"""
        dispute_id = f"dispute_{datetime.now().strftime('%Y%m%d%H%M%S')}_{user_id[:8]}"
        
        dispute = Dispute(
            dispute_id=dispute_id,
            user_id=user_id,
            content_id=content_id,
            dispute_type=dispute_type,
            description=description,
            evidence_files=evidence_files or []
        )
        
        self.disputes[dispute_id] = dispute
        self._save_dispute(dispute)
        
        # 즉시 콘텐츠 차단
        logger.warning(f"Dispute created: {dispute_id}, content {content_id} should be blocked")
        
        return dispute_id
    
    def get_dispute(self, dispute_id: str) -> Optional[Dispute]:
        """분쟁 조회"""
        return self.disputes.get(dispute_id)
    
    def update_dispute_status(
        self,
        dispute_id: str,
        status: DisputeStatus,
        resolution: Optional[str] = None
    ):
        """분쟁 상태 업데이트"""
        dispute = self.disputes.get(dispute_id)
        if not dispute:
            return
        
        dispute.status = status
        if resolution:
            dispute.resolution = resolution
        if status == DisputeStatus.RESOLVED:
            dispute.resolved_at = datetime.now()
        
        self._save_dispute(dispute)
        logger.info(f"Dispute {dispute_id} status updated to {status.value}")
    
    def _save_dispute(self, dispute: Dispute):
        """분쟁 저장"""
        file_path = os.path.join(self.storage_path, f"{dispute.dispute_id}.json")
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(dispute.to_dict(), f, ensure_ascii=False, indent=2)
    
    def _load_disputes(self):
        """분쟁 로드"""
        if not os.path.exists(self.storage_path):
            return
        
        for filename in os.listdir(self.storage_path):
            if filename.endswith('.json'):
                file_path = os.path.join(self.storage_path, filename)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    dispute = Dispute(
                        dispute_id=data['dispute_id'],
                        user_id=data['user_id'],
                        content_id=data['content_id'],
                        dispute_type=DisputeType(data['dispute_type']),
                        description=data['description'],
                        status=DisputeStatus(data['status']),
                        evidence_files=data.get('evidence_files', []),
                        created_at=datetime.fromisoformat(data['created_at']),
                        resolved_at=datetime.fromisoformat(data['resolved_at']) if data.get('resolved_at') else None,
                        resolution=data.get('resolution')
                    )
                    
                    self.disputes[dispute.dispute_id] = dispute
                except Exception as e:
                    logger.error(f"Error loading dispute {filename}: {e}")
