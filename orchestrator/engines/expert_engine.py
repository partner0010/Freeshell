"""
Expert Engine 구현
"""

from typing import Dict, Any
from datetime import datetime

from ..core.engine import Engine, EngineType, EngineResult
from ..utils.logger import get_logger

logger = get_logger(__name__)


class ExpertEngine(Engine):
    """Expert Engine - 전문가 매칭"""
    
    def __init__(self, name: str = "expert_engine", priority: int = 30):
        super().__init__(name, EngineType.EXPERT, priority)
        self.experts = self._load_experts()
    
    def _load_experts(self) -> list[Dict[str, Any]]:
        """전문가 목록 로드"""
        return [
            {
                'id': 'expert_1',
                'name': '콘텐츠 전문가',
                'skills': ['text', 'blog', 'copywriting'],
                'available': True,
                'rating': 4.8
            },
            {
                'id': 'expert_2',
                'name': '디자인 전문가',
                'skills': ['image', 'design', 'graphic'],
                'available': True,
                'rating': 4.9
            }
        ]
    
    async def execute(self, input_data: Dict[str, Any]) -> EngineResult:
        """Expert 매칭"""
        start_time = datetime.now()
        content_type = input_data.get('type', 'text')
        intent = input_data.get('intent', '')
        
        # 전문가 매칭
        matched_expert = self._match_expert(content_type, intent)
        
        if not matched_expert:
            execution_time = (datetime.now() - start_time).total_seconds()
            return EngineResult(
                success=False,
                data=None,
                engine_name=self.name,
                engine_type=self.engine_type,
                execution_time=execution_time,
                error="No expert available",
                fallback_available=False
            )
        
        # 전문가 큐에 추가 (실제로는 큐 시스템 사용)
        result = {
            'expert_id': matched_expert['id'],
            'expert_name': matched_expert['name'],
            'status': 'queued',
            'estimated_time': '5-10 minutes',
            'message': f"{matched_expert['name']} 전문가가 작업을 시작할 예정입니다."
        }
        
        execution_time = (datetime.now() - start_time).total_seconds()
        return EngineResult(
            success=True,
            data=result,
            engine_name=self.name,
            engine_type=self.engine_type,
            execution_time=execution_time,
            metadata={'expert_id': matched_expert['id']},
            fallback_available=False
        )
    
    def _match_expert(self, content_type: str, intent: str) -> Dict[str, Any]:
        """전문가 매칭"""
        # 사용 가능한 전문가 중에서 스킬 매칭
        for expert in self.experts:
            if not expert.get('available', False):
                continue
            
            skills = expert.get('skills', [])
            if content_type in skills or intent in skills:
                return expert
        
        # 기본 전문가 반환
        for expert in self.experts:
            if expert.get('available', False):
                return expert
        
        return None
    
    def can_handle(self, intent: str, context: Dict[str, Any]) -> bool:
        """처리 가능 여부"""
        # 전문가는 항상 사용 가능 (큐에 추가)
        return True
