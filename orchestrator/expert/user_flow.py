"""
사용자 → 전문가 흐름
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid

from .expert_schema import ServiceRequest, ServiceType, RequestStatus, Expert
from .expert_matcher import ExpertMatcher
from .revenue_model import RevenueCalculator, PayoutManager
from .remote_support import RemoteSupportSession, HealthCheckService
from ..utils.logger import get_logger

logger = get_logger(__name__)


class ExpertServiceFlow:
    """전문가 서비스 플로우"""
    
    def __init__(self):
        self.matcher = ExpertMatcher()
        self.revenue_calculator = RevenueCalculator()
        self.payout_manager = PayoutManager()
        self.active_sessions: Dict[str, RemoteSupportSession] = {}
    
    async def create_service_request(
        self,
        user_id: str,
        service_type: ServiceType,
        title: str,
        description: str,
        urgency: str = "normal",
        budget: Optional[float] = None
    ) -> Dict[str, Any]:
        """서비스 요청 생성"""
        request = ServiceRequest(
            id=str(uuid.uuid4()),
            user_id=user_id,
            service_type=service_type,
            title=title,
            description=description,
            urgency=urgency,
            budget=budget
        )
        
        self.matcher.create_request(request)
        
        # 전문가 매칭
        matched_experts = self.matcher.match_experts(request, limit=5)
        
        return {
            'request_id': request.id,
            'status': request.status.value,
            'matched_experts': [
                {
                    'expert_id': expert.id,
                    'name': expert.name,
                    'rating': expert.rating,
                    'hourly_rate': expert.hourly_rate,
                    'match_score': score,
                    'skills': [s.to_dict() for s in expert.skills[:3]]
                }
                for expert, score in matched_experts
            ]
        }
    
    async def select_expert(
        self,
        request_id: str,
        expert_id: str
    ) -> Dict[str, Any]:
        """전문가 선택"""
        request = self.matcher.get_request(request_id)
        if not request:
            return {'success': False, 'error': 'Request not found'}
        
        expert = self.matcher.get_expert(expert_id)
        if not expert:
            return {'success': False, 'error': 'Expert not found'}
        
        # 요청 상태 업데이트
        request.matched_expert_id = expert_id
        request.status = RequestStatus.MATCHED
        
        # 전문가 상태 업데이트
        self.matcher.update_expert_status(expert_id, ExpertStatus.BUSY)
        
        return {
            'success': True,
            'request_id': request_id,
            'expert_id': expert_id,
            'expert_name': expert.name,
            'next_steps': self._get_next_steps(request.service_type)
        }
    
    def _get_next_steps(self, service_type: ServiceType) -> List[str]:
        """다음 단계 안내"""
        steps_map = {
            ServiceType.REMOTE_SUPPORT: [
                "1. 전문가와 채팅으로 문제 설명",
                "2. 원격 연결 코드 받기",
                "3. 연결 허용 및 화면 공유",
                "4. 전문가가 문제 해결"
            ],
            ServiceType.HEALTH_CHECK: [
                "1. 상태 확인 도구 실행",
                "2. 결과 자동 수집",
                "3. 전문가가 분석 및 권장사항 제공"
            ],
            ServiceType.SECURITY_AUDIT: [
                "1. 보안 스캔 도구 실행",
                "2. 결과 전문가에게 전송",
                "3. 전문가가 분석 및 개선안 제시"
            ],
            ServiceType.CONSULTING: [
                "1. 전문가와 채팅으로 상담",
                "2. 질문 및 답변",
                "3. 문서/가이드 제공"
            ]
        }
        
        return steps_map.get(service_type, ["서비스 진행 중"])
    
    async def start_service_session(
        self,
        request_id: str
    ) -> Dict[str, Any]:
        """서비스 세션 시작"""
        request = self.matcher.get_request(request_id)
        if not request or not request.matched_expert_id:
            return {'success': False, 'error': 'Invalid request'}
        
        expert_id = request.matched_expert_id
        session = RemoteSupportSession(
            session_id=str(uuid.uuid4()),
            expert_id=expert_id,
            user_id=request.user_id
        )
        
        session_info = session.start_session()
        self.active_sessions[session.session_id] = session
        
        request.status = RequestStatus.IN_PROGRESS
        
        return {
            'success': True,
            'session_id': session.session_id,
            **session_info
        }
    
    async def complete_service(
        self,
        request_id: str,
        duration_minutes: int,
        expert_rating: Optional[int] = None
    ) -> Dict[str, Any]:
        """서비스 완료"""
        request = self.matcher.get_request(request_id)
        if not request or not request.matched_expert_id:
            return {'success': False, 'error': 'Invalid request'}
        
        expert = self.matcher.get_expert(request.matched_expert_id)
        if not expert:
            return {'success': False, 'error': 'Expert not found'}
        
        # 비용 계산
        total_cost = expert.hourly_rate * (duration_minutes / 60)
        
        # 수익 분배
        revenue_split = self.revenue_calculator.calculate_service_revenue(
            total_cost,
            expert.premium
        )
        
        # 전문가 수익 추가
        self.payout_manager.add_earnings(expert.id, revenue_split.expert_earnings)
        
        # 요청 완료
        request.status = RequestStatus.COMPLETED
        request.completed_at = datetime.now()
        
        # 전문가 상태 복구
        self.matcher.update_expert_status(expert.id, ExpertStatus.ACTIVE)
        
        # 평점 업데이트
        if expert_rating:
            # 평점 계산 (간단한 평균)
            total_rating = expert.rating * expert.total_reviews + expert_rating
            expert.total_reviews += 1
            expert.rating = total_rating / expert.total_reviews
        
        expert.total_services += 1
        
        return {
            'success': True,
            'request_id': request_id,
            'total_cost': total_cost,
            'revenue_split': revenue_split.to_dict(),
            'expert_earnings': revenue_split.expert_earnings,
            'platform_fee': revenue_split.platform_fee
        }
