"""
숏폼 생성 API (STEP A: AI 없이 동작)
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from pydantic import BaseModel

from ..services.shortform_service import ShortformService
from ..utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()
shortform_service = ShortformService()


class SceneJSONRequest(BaseModel):
    """Scene JSON 요청"""
    scene_json: Dict[str, Any]
    output_filename: Optional[str] = None


@router.post("/generate")
def generate_shortform(request: SceneJSONRequest):
    """
    숏폼 생성 (Scene JSON 기반)
    
    AI 없이 고정 Scene JSON으로 영상 생성
    """
    try:
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
                'scenes_count': result['scenes_count']
            }
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Generation failed'))
            
    except Exception as e:
        logger.error(f"Shortform generation API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/default-scene")
def get_default_scene():
    """기본 Scene JSON 반환"""
    return shortform_service.get_default_scene_json()


@router.get("/health")
def health_check():
    """헬스 체크"""
    return {
        'status': 'ok',
        'service': 'shortform',
        'version': '1.0.0'
    }
