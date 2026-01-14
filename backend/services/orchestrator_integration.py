"""
Orchestrator 통합 서비스 (STEP B)
Orchestrator가 Scene JSON만 생성하고, 실제 렌더링은 기존 파이프라인 재사용
"""

from typing import Dict, Any, Optional
import json

from ..orchestrator.orchestrator import Orchestrator
from ..services.shortform_service import ShortformService
from ..utils.logger import get_logger

logger = get_logger(__name__)


class OrchestratorIntegration:
    """Orchestrator 통합 서비스"""
    
    def __init__(self):
        self.orchestrator = Orchestrator()
        self.shortform_service = ShortformService()
    
    def generate_with_orchestrator(
        self,
        request: Dict[str, Any],
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Orchestrator를 통한 숏폼 생성
        
        Args:
            request: 사용자 요청
            user_id: 사용자 ID (선택)
        
        Returns:
            생성 결과
        """
        try:
            # 1. Orchestrator로 Scene JSON 생성
            logger.info("Calling Orchestrator to generate Scene JSON")
            orchestrator_result = self.orchestrator.handle(request, user_id=user_id)
            
            if not orchestrator_result['success']:
                # Orchestrator 실패 시 기본 Scene JSON 사용
                logger.warning("Orchestrator failed, using default Scene JSON")
                scene_json = self.shortform_service.get_default_scene_json()
            else:
                # Orchestrator 결과에서 Scene JSON 추출
                data = orchestrator_result.get('data', {})
                scenes = data.get('scenes', [])
                
                if not scenes:
                    # Scene이 없으면 기본 Scene JSON 사용
                    logger.warning("No scenes from Orchestrator, using default")
                    scene_json = self.shortform_service.get_default_scene_json()
                else:
                    scene_json = {
                        'type': 'shortform',
                        'scenes': scenes
                    }
            
            # 2. 기존 숏폼 서비스로 렌더링
            logger.info("Rendering video with ShortformService")
            render_result = self.shortform_service.generate_from_scene_json(scene_json)
            
            if not render_result['success']:
                return {
                    'success': False,
                    'error': render_result.get('error', 'Rendering failed'),
                    'orchestrator_used': orchestrator_result.get('success', False),
                    'fallback_used': orchestrator_result.get('fallback_used', False)
                }
            
            # 3. 결과 통합
            return {
                'success': True,
                'file_path': render_result['file_path'],
                'filename': render_result['filename'],
                'duration': render_result['duration'],
                'scenes_count': render_result['scenes_count'],
                'orchestrator_used': orchestrator_result.get('success', False),
                'fallback_used': orchestrator_result.get('fallback_used', False),
                'task_id': orchestrator_result.get('task_id'),
                'execution_time': orchestrator_result.get('execution_time', 0)
            }
            
        except Exception as e:
            logger.error(f"Orchestrator integration error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_scene_json_only(
        self,
        request: Dict[str, Any],
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Scene JSON만 생성 (렌더링 없음)
        
        Args:
            request: 사용자 요청
            user_id: 사용자 ID (선택)
        
        Returns:
            Scene JSON
        """
        try:
            orchestrator_result = self.orchestrator.handle(request, user_id=user_id)
            
            if not orchestrator_result['success']:
                return {
                    'success': False,
                    'error': orchestrator_result.get('error', 'Orchestrator failed'),
                    'scene_json': self.shortform_service.get_default_scene_json()
                }
            
            data = orchestrator_result.get('data', {})
            scenes = data.get('scenes', [])
            
            if not scenes:
                return {
                    'success': True,
                    'scene_json': self.shortform_service.get_default_scene_json(),
                    'fallback_used': True
                }
            
            return {
                'success': True,
                'scene_json': {
                    'type': 'shortform',
                    'scenes': scenes
                },
                'fallback_used': orchestrator_result.get('fallback_used', False),
                'task_id': orchestrator_result.get('task_id')
            }
            
        except Exception as e:
            logger.error(f"Scene JSON generation error: {e}")
            return {
                'success': False,
                'error': str(e),
                'scene_json': self.shortform_service.get_default_scene_json()
            }
