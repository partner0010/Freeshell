"""
전문가 시스템 스키마
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime


class ExpertStatus(Enum):
    """전문가 상태"""
    ACTIVE = "active"
    BUSY = "busy"
    OFFLINE = "offline"
    SUSPENDED = "suspended"


class ServiceType(Enum):
    """서비스 타입"""
    REMOTE_SUPPORT = "remote_support"
    HEALTH_CHECK = "health_check"
    SECURITY_AUDIT = "security_audit"
    RECOVERY = "recovery"
    FORENSICS = "forensics"
    CONSULTING = "consulting"
    EDUCATION = "education"  # 강의/전자책


class RequestStatus(Enum):
    """요청 상태"""
    PENDING = "pending"
    MATCHED = "matched"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DISPUTED = "disputed"


class SkillLevel(Enum):
    """스킬 레벨"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


@dataclass
class ExpertSkill:
    """전문가 스킬"""
    category: str  # "security", "recovery", "networking", etc.
    skill: str
    level: SkillLevel
    years_experience: int = 0
    certifications: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'category': self.category,
            'skill': self.skill,
            'level': self.level.value,
            'years_experience': self.years_experience,
            'certifications': self.certifications
        }


@dataclass
class Expert:
    """전문가 정보"""
    id: str
    user_id: str
    name: str
    email: str
    status: ExpertStatus = ExpertStatus.OFFLINE
    skills: List[ExpertSkill] = field(default_factory=list)
    rating: float = 0.0
    total_reviews: int = 0
    total_services: int = 0
    hourly_rate: float = 0.0
    available_hours: Dict[str, List[str]] = field(default_factory=dict)  # 요일별 시간
    bio: str = ""
    verified: bool = False
    premium: bool = False
    created_at: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'email': self.email,
            'status': self.status.value,
            'skills': [s.to_dict() for s in self.skills],
            'rating': self.rating,
            'total_reviews': self.total_reviews,
            'total_services': self.total_services,
            'hourly_rate': self.hourly_rate,
            'available_hours': self.available_hours,
            'bio': self.bio,
            'verified': self.verified,
            'premium': self.premium,
            'created_at': self.created_at.isoformat()
        }


@dataclass
class ServiceRequest:
    """서비스 요청"""
    id: str
    user_id: str
    service_type: ServiceType
    title: str
    description: str
    urgency: str = "normal"  # low, normal, high, urgent
    budget: Optional[float] = None
    status: RequestStatus = RequestStatus.PENDING
    matched_expert_id: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'service_type': self.service_type.value,
            'title': self.title,
            'description': self.description,
            'urgency': self.urgency,
            'budget': self.budget,
            'status': self.status.value,
            'matched_expert_id': self.matched_expert_id,
            'created_at': self.created_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


@dataclass
class ServiceSession:
    """서비스 세션"""
    id: str
    request_id: str
    expert_id: str
    user_id: str
    service_type: ServiceType
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_minutes: int = 0
    cost: float = 0.0
    platform_fee: float = 0.0
    expert_earnings: float = 0.0
    status: str = "active"  # active, completed, cancelled
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'request_id': self.request_id,
            'expert_id': self.expert_id,
            'user_id': self.user_id,
            'service_type': self.service_type.value,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'duration_minutes': self.duration_minutes,
            'cost': self.cost,
            'platform_fee': self.platform_fee,
            'expert_earnings': self.expert_earnings,
            'status': self.status
        }


@dataclass
class Review:
    """리뷰"""
    id: str
    session_id: str
    expert_id: str
    user_id: str
    rating: int  # 1-5
    comment: str = ""
    created_at: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'session_id': self.session_id,
            'expert_id': self.expert_id,
            'user_id': self.user_id,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat()
        }
