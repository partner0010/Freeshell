"""
통합 API 라우트 (STEP A, B, C)
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional
from pydantic import BaseModel

from ..services.shortform_service import ShortformService
from ..services.shortform_service_v2 import ShortformServiceV2
from ..services.orchestrator_integration import OrchestratorIntegration
from ..models.request import ContentRequest
from ..utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()

# 서비스 초기화
shortform_service = ShortformService()
shortform_service_v2 = ShortformServiceV2()
orchestrator_integration = OrchestratorIntegration()


class SceneJSONRequest(BaseModel):
    """Scene JSON 요청"""
    scene_json: Dict[str, Any]
    output_filename: Optional[str] = None
    photo_motion: bool = False


# ========== STEP A: AI 없이 동작 ==========

@router.post("/generate")
def generate_shortform(request: SceneJSONRequest):
    """
    숏폼 생성 (Scene JSON 기반)
    
    STEP A: AI 없이 고정 Scene JSON으로 영상 생성
    STEP C: photo_motion 옵션 지원
    """
    try:
        if request.photo_motion:
            # V2 서비스 사용 (모션 옵션)
            result = shortform_service_v2.generate_from_scene_json(
                request.scene_json,
                request.output_filename,
                photo_motion=True
            )
        else:
            # 기본 서비스 사용
            result = shortform_service.generate_from_scene_json(
                request.scene_json,
                request.output_filename
            )
        
        if result['success']:
            return {
                'success': True,
                'file_path': result['file_path'],
                'filename': result['filename'],
                'duration': result['duration'],
                'scenes_count': result['scenes_count'],
                'motion_applied': result.get('motion_applied', False)
            }
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Generation failed'))
            
    except Exception as e:
        logger.error(f"Shortform generation API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== STEP B: Orchestrator 통합 ==========

@router.post("/generate/with-orchestrator")
def generate_with_orchestrator(
    request: ContentRequest,
    user_id: Optional[str] = Query(None),
    photo_motion: bool = Query(False)
):
    """
    Orchestrator를 통한 숏폼 생성
    
    STEP B: Orchestrator가 Scene JSON 생성, 기존 파이프라인으로 렌더링
    STEP C: photo_motion 옵션 지원
    """
    try:
        # Orchestrator 통합 서비스 사용
        orchestrator_request = {
            'prompt': request.prompt,
            'type': 'shortform',
            'duration': request.duration,
            'style': request.style,
            'purpose': request.purpose,
            'options': {
                **(request.options or {}),
                'photo_motion': photo_motion
            }
        }
        
        result = orchestrator_integration.generate_with_orchestrator(
            orchestrator_request,
            user_id
        )
        
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Generation failed'))
            
    except Exception as e:
        logger.error(f"Orchestrator generation API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/scene-json-only")
def generate_scene_json_only(
    request: ContentRequest,
    user_id: Optional[str] = Query(None)
):
    """
    Scene JSON만 생성 (렌더링 없음)
    
    STEP B: Orchestrator가 Scene JSON만 생성
    """
    try:
        orchestrator_request = {
            'prompt': request.prompt,
            'type': 'shortform',
            'duration': request.duration,
            'style': request.style,
            'options': request.options or {}
        }
        
        result = orchestrator_integration.generate_scene_json_only(
            orchestrator_request,
            user_id
        )
        
        return result
            
    except Exception as e:
        logger.error(f"Scene JSON generation API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== 유틸리티 ==========

@router.get("/default-scene")
def get_default_scene():
    """기본 Scene JSON 반환"""
    return shortform_service.get_default_scene_json()


@router.get("/motions")
def get_available_motions():
    """사용 가능한 모션 타입 목록"""
    from ..services.motion_service import MotionService
    motion_service = MotionService()
    return {
        'success': True,
        'motions': motion_service.get_available_motions()
    }


@router.get("/health")
def health_check():
    """헬스 체크"""
    return {
        'status': 'ok',
        'service': 'shortform-integrated',
        'version': '2.0.0',
        'features': {
            'step_a': True,  # AI 없이 동작
            'step_b': True,  # Orchestrator 통합
            'step_c': True   # 모션 옵션
        }
    }
