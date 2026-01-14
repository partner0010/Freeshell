"""
API 라우트 (통합)
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional

from ..orchestrator.orchestrator import Orchestrator
from ..modules.sns.feed_engine import FeedEngine
from ..modules.archive.archive_manager import ArchiveManager
from ..modules.character.character_manager import CharacterManager
from ..modules.spatial.space_manager import SpaceManager
from ..vault.encryption import VaultManager
from ..orchestrator.memory import MemoryManager
from ..models.request import ContentRequest
from ..models.response import ContentResponse
from ..utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()

# 초기화
orchestrator = Orchestrator()
memory_manager = MemoryManager()
feed_engine = FeedEngine(memory_manager)
archive_manager = ArchiveManager()
character_manager = CharacterManager()
space_manager = SpaceManager()
vault_manager = VaultManager()


# ========== 콘텐츠 생성 ==========

@router.post("/generate/shortform", response_model=ContentResponse)
def generate_shortform(request: ContentRequest, user_id: Optional[str] = None):
    """숏폼 생성"""
    try:
        result = orchestrator.handle({
            'prompt': request.prompt,
            'type': 'shortform',
            'duration': request.duration,
            'style': request.style,
            'purpose': request.purpose,
            'subject_name': request.subject_name,
            'subject_status': request.subject_status,
            'consent': request.consent,
            'options': request.options or {}
        }, user_id=user_id)
        
        return ContentResponse(**result)
    except Exception as e:
        logger.error(f"Shortform generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/motion", response_model=ContentResponse)
def generate_motion(request: ContentRequest, user_id: Optional[str] = None):
    """모션 생성"""
    try:
        result = orchestrator.handle({
            'prompt': request.prompt,
            'type': 'motion',
            'image_path': request.options.get('image_path') if request.options else None,
            'purpose': request.purpose,
            'options': request.options or {}
        }, user_id=user_id)
        
        return ContentResponse(**result)
    except Exception as e:
        logger.error(f"Motion generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== SNS ==========

@router.post("/sns/feed/reorganize")
def reorganize_feed(user_id: str, raw_feed: list, max_items: int = 20):
    """피드 재구성"""
    try:
        reorganized = feed_engine.reorganize_feed(user_id, raw_feed, max_items)
        return {
            'success': True,
            'feed': reorganized
        }
    except Exception as e:
        logger.error(f"Feed reorganization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sns/content/personalize")
def personalize_content(user_id: str, content: dict):
    """콘텐츠 개인화"""
    try:
        personalized = feed_engine.personalize_content(user_id, content)
        return {
            'success': True,
            'content': personalized
        }
    except Exception as e:
        logger.error(f"Content personalization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== Archive ==========

@router.post("/archive/create")
def create_archive(user_id: str, archive_data: dict, consent_data: dict):
    """Archive 생성"""
    try:
        result = archive_manager.create_archive(user_id, archive_data, consent_data)
        return result
    except Exception as e:
        logger.error(f"Archive creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/archive/list")
def list_archives(user_id: str, archive_type: Optional[str] = None):
    """Archive 목록"""
    try:
        archives = archive_manager.list_archives(user_id, archive_type)
        return {
            'success': True,
            'archives': archives
        }
    except Exception as e:
        logger.error(f"Archive list error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== Character ==========

@router.post("/character/create")
def create_character(user_id: str, character_data: dict):
    """캐릭터 생성"""
    try:
        result = character_manager.create_character(user_id, character_data)
        return result
    except Exception as e:
        logger.error(f"Character creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/character/list")
def list_characters(user_id: str):
    """캐릭터 목록"""
    try:
        characters = character_manager.list_characters(user_id)
        return {
            'success': True,
            'characters': characters
        }
    except Exception as e:
        logger.error(f"Character list error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== Spatial ==========

@router.post("/spatial/room/create")
def create_room(user_id: str, room_data: dict):
    """공간 생성"""
    try:
        result = space_manager.create_room(user_id, room_data)
        return result
    except Exception as e:
        logger.error(f"Room creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/spatial/room/join")
def join_room(room_id: str, user_id: str, avatar: dict):
    """공간 입장"""
    try:
        result = space_manager.join_room(room_id, user_id, avatar)
        return result
    except Exception as e:
        logger.error(f"Room join error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/spatial/room/message")
def send_message(room_id: str, user_id: str, message: str):
    """메시지 전송"""
    try:
        result = space_manager.send_message(room_id, user_id, message)
        return result
    except Exception as e:
        logger.error(f"Message send error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== Vault ==========

@router.post("/vault/store")
def store_in_vault(user_id: str, password: str, data: dict, data_type: str = 'general'):
    """Vault 저장"""
    try:
        result = vault_manager.store(user_id, password, data, data_type)
        return result
    except Exception as e:
        logger.error(f"Vault store error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/vault/retrieve")
def retrieve_from_vault(user_id: str, password: str, data_type: str = 'general'):
    """Vault 조회"""
    try:
        data = vault_manager.retrieve(user_id, password, data_type)
        if data is None:
            raise HTTPException(status_code=404, detail="Data not found")
        return {
            'success': True,
            'data': data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Vault retrieve error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== 기타 ==========

@router.get("/task/{task_id}")
def get_task_status(task_id: str):
    """작업 상태 조회"""
    status = orchestrator.get_task_status(task_id)
    if not status:
        raise HTTPException(status_code=404, detail="Task not found")
    return status


@router.get("/user/context")
def get_user_context(user_id: str):
    """사용자 컨텍스트 조회"""
    context = orchestrator.get_user_context(user_id)
    return {
        'success': True,
        'context': context
    }


@router.get("/health")
def health_check():
    """헬스 체크"""
    return {"status": "ok", "service": "AI Content Platform"}
