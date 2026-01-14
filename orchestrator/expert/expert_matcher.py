"""
전문가 매칭 시스템
"""

from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import uuid

from .expert_schema import Expert, ExpertStatus, ServiceRequest, ServiceType, SkillLevel
from ..utils.logger import get_logger

logger = get_logger(__name__)


class ExpertMatcher:
    """전문가 매칭 시스템"""
    
    def __init__(self):
        self.experts: Dict[str, Expert] = {}
        self.requests: Dict[str, ServiceRequest] = {}
    
    def register_expert(self, expert: Expert) -> bool:
        """전문가 등록"""
        if expert.id in self.experts:
            return False
        
        self.experts[expert.id] = expert
        logger.info(f"Expert registered: {expert.id} ({expert.name})")
        return True
    
    def create_request(self, request: ServiceRequest) -> str:
        """서비스 요청 생성"""
        self.requests[request.id] = request
        logger.info(f"Service request created: {request.id}")
        return request.id
    
    def match_experts(
        self,
        request: ServiceRequest,
        limit: int = 5
    ) -> List[Tuple[Expert, float]]:
        """
        전문가 매칭
        
        Args:
            request: 서비스 요청
            limit: 반환할 전문가 수
            
        Returns:
            List[Tuple[Expert, score]]: 전문가와 매칭 점수
        """
        candidates = []
        
        # 1. 서비스 타입에 맞는 전문가 필터링
        for expert in self.experts.values():
            # 상태 확인
            if expert.status != ExpertStatus.ACTIVE:
                continue
            
            # 스킬 매칭
            match_score = self._calculate_match_score(expert, request)
            
            if match_score > 0:
                candidates.append((expert, match_score))
        
        # 점수순 정렬
        candidates.sort(key=lambda x: x[1], reverse=True)
        
        # 상위 N명 반환
        return candidates[:limit]
    
    def _calculate_match_score(self, expert: Expert, request: ServiceRequest) -> float:
        """매칭 점수 계산"""
        score = 0.0
        
        # 1. 서비스 타입 매칭 (40점)
        service_skills = self._get_required_skills(request.service_type)
        matched_skills = 0
        for req_skill in service_skills:
            for expert_skill in expert.skills:
                if expert_skill.category == req_skill['category'] and \
                   expert_skill.skill == req_skill['skill']:
                    matched_skills += 1
                    # 레벨에 따른 가중치
                    level_weight = {
                        SkillLevel.BEGINNER: 0.5,
                        SkillLevel.INTERMEDIATE: 0.75,
                        SkillLevel.ADVANCED: 1.0,
                        SkillLevel.EXPERT: 1.2
                    }
                    score += 40 * level_weight.get(expert_skill.level, 1.0) / len(service_skills)
                    break
        
        if matched_skills == 0:
            return 0.0  # 매칭되는 스킬이 없으면 0점
        
        # 2. 평점 (30점)
        score += expert.rating * 6  # 5점 만점 기준
        
        # 3. 경험 (20점)
        total_experience = sum(s.years_experience for s in expert.skills)
        score += min(total_experience * 2, 20)  # 최대 20점
        
        # 4. 검증 상태 (10점)
        if expert.verified:
            score += 10
        
        # 5. 프리미엄 보너스 (5점)
        if expert.premium:
            score += 5
        
        # 6. 가격 매칭 (보너스/페널티)
        if request.budget and expert.hourly_rate:
            if expert.hourly_rate <= request.budget:
                score += 5  # 예산 내
            elif expert.hourly_rate <= request.budget * 1.2:
                score += 2  # 약간 초과
            else:
                score -= 10  # 많이 초과
        
        return max(0.0, score)  # 최소 0점
    
    def _get_required_skills(self, service_type: ServiceType) -> List[Dict[str, str]]:
        """서비스 타입별 필요 스킬"""
        skill_map = {
            ServiceType.REMOTE_SUPPORT: [
                {'category': 'system', 'skill': 'remote_access'},
                {'category': 'troubleshooting', 'skill': 'general'}
            ],
            ServiceType.HEALTH_CHECK: [
                {'category': 'system', 'skill': 'diagnostics'},
                {'category': 'performance', 'skill': 'analysis'}
            ],
            ServiceType.SECURITY_AUDIT: [
                {'category': 'security', 'skill': 'audit'},
                {'category': 'security', 'skill': 'vulnerability'}
            ],
            ServiceType.RECOVERY: [
                {'category': 'recovery', 'skill': 'data_recovery'},
                {'category': 'system', 'skill': 'repair'}
            ],
            ServiceType.FORENSICS: [
                {'category': 'security', 'skill': 'forensics'},
                {'category': 'analysis', 'skill': 'incident'}
            ],
            ServiceType.CONSULTING: [
                {'category': 'consulting', 'skill': 'general'}
            ],
            ServiceType.EDUCATION: [
                {'category': 'education', 'skill': 'teaching'}
            ]
        }
        
        return skill_map.get(service_type, [])
    
    def get_expert(self, expert_id: str) -> Optional[Expert]:
        """전문가 조회"""
        return self.experts.get(expert_id)
    
    def get_request(self, request_id: str) -> Optional[ServiceRequest]:
        """요청 조회"""
        return self.requests.get(request_id)
    
    def update_expert_status(self, expert_id: str, status: ExpertStatus):
        """전문가 상태 업데이트"""
        expert = self.experts.get(expert_id)
        if expert:
            expert.status = status
            logger.info(f"Expert {expert_id} status updated to {status.value}")
