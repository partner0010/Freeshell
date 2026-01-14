"""
전체 시스템 통합
"""

from typing import Dict, Any, Optional, List
from datetime import datetime

from .core.orchestrator import Orchestrator
from .core.engine import EngineType
from .video.ffmpeg_renderer import FFmpegRenderer
from .motion.motion_pipeline import MotionPipeline
from .ethics.ethics_guard import EthicsGuard, BlockingFlow
from .expert.expert_matcher import ExpertMatcher
from .expert.user_flow import ExpertServiceFlow
from .revenue.credit_system import CreditSystem, CreditType
from .utils.logger import get_logger

logger = get_logger(__name__)


class UnifiedPlatform:
    """통합 플랫폼"""
    
    def __init__(self):
        # Core
        self.orchestrator = Orchestrator()
        
        # Engines
        self.motion_pipeline = MotionPipeline()
        
        # Guards
        self.ethics_guard = EthicsGuard()
        self.blocking_flow = BlockingFlow(self.ethics_guard)
        
        # Expert System
        self.expert_matcher = ExpertMatcher()
        self.expert_flow = ExpertServiceFlow()
        
        # Revenue
        self.credit_system = CreditSystem()
        
        # Renderer
        self.renderer = FFmpegRenderer()
        
        self._initialize_engines()
    
    def _initialize_engines(self):
        """엔진 초기화"""
        # Video Engine 등록
        from .engines.ai_engine import AIEngine
        from .engines.rule_engine import RuleEngine
        
        ai_engine = AIEngine()
        rule_engine = RuleEngine()
        
        self.orchestrator.register_engine(ai_engine)
        self.orchestrator.register_engine(rule_engine)
        
        logger.info("Engines initialized")
    
    async def create_content(
        self,
        user_id: str,
        content_type: str,
        prompt: str,
        **kwargs
    ) -> Dict[str, Any]:
        """
        콘텐츠 생성
        
        Args:
            user_id: 사용자 ID
            content_type: 콘텐츠 타입 (shortform, image, motion, etc.)
            prompt: 생성 프롬프트
            **kwargs: 추가 옵션
            
        Returns:
            생성 결과
        """
        # 1. Ethics Guard 검증
        user_input = {
            'prompt': prompt,
            'content_type': content_type,
            'purpose': kwargs.get('purpose', 'personal_archive'),
            'user_id': user_id
        }
        
        ethics_result = await self.blocking_flow.process_request(user_input, user_id)
        if not ethics_result['allowed']:
            return {
                'success': False,
                'error': ethics_result['message'],
                'blocked': True
            }
        
        # 2. 크레딧 확인
        credit_type_map = {
            'shortform': CreditType.SHORTFORM,
            'image': CreditType.IMAGE,
            'video': CreditType.VIDEO,
            'text': CreditType.TEXT
        }
        
        credit_type = credit_type_map.get(content_type, CreditType.TEXT)
        can_use, message = self.credit_system.can_use_credits(user_id, credit_type)
        
        if not can_use:
            return {
                'success': False,
                'error': message,
                'credit_insufficient': True,
                'upgrade_suggestion': self._get_upgrade_suggestion(user_id)
            }
        
        # 3. Orchestrator를 통한 콘텐츠 생성
        try:
            intent = f"create_{content_type}"
            context = {
                'prompt': prompt,
                'user_id': user_id,
                **kwargs
            }
            
            result = await self.orchestrator.process(intent, context)
            
            if result.success:
                # 크레딧 사용
                self.credit_system.use_credits(user_id, credit_type)
                
                return {
                    'success': True,
                    'content_id': result.data.get('content_id'),
                    'file_path': result.data.get('file_path'),
                    'metadata': result.data
                }
            else:
                return {
                    'success': False,
                    'error': result.error or 'Content generation failed',
                    'fallback_used': result.fallback_used
                }
        except Exception as e:
            logger.error(f"Content creation failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def request_expert_help(
        self,
        user_id: str,
        service_type: str,
        description: str,
        budget: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        전문가 도움 요청
        
        Args:
            user_id: 사용자 ID
            service_type: 서비스 타입
            description: 문제 설명
            budget: 예산
            
        Returns:
            매칭 결과
        """
        from .expert.expert_schema import ServiceType
        
        service_type_map = {
            'health_check': ServiceType.HEALTH_CHECK,
            'security_audit': ServiceType.SECURITY_AUDIT,
            'remote_support': ServiceType.REMOTE_SUPPORT,
            'consulting': ServiceType.CONSULTING
        }
        
        stype = service_type_map.get(service_type, ServiceType.CONSULTING)
        
        result = await self.expert_flow.create_service_request(
            user_id=user_id,
            service_type=stype,
            title=f"{service_type} 요청",
            description=description,
            budget=budget
        )
        
        return result
    
    def _get_upgrade_suggestion(self, user_id: str) -> Dict[str, Any]:
        """업그레이드 제안"""
        from .revenue.conversion_funnel import ConversionFunnel
        from .revenue.credit_system import PlanType
        
        funnel = ConversionFunnel()
        credits = self.credit_system.get_user_credits(user_id)
        
        suggestion = funnel.get_upgrade_benefits(
            credits.plan,
            PlanType.STARTER
        )
        
        return suggestion
    
    async def get_user_status(self, user_id: str) -> Dict[str, Any]:
        """사용자 상태 조회"""
        credits = self.credit_system.get_user_credits(user_id)
        
        return {
            'user_id': user_id,
            'plan': credits.plan.value,
            'current_credits': credits.current_credits,
            'daily_used': credits.daily_used,
            'monthly_used': credits.monthly_used,
            'purchased_credits': credits.purchased_credits
        }
