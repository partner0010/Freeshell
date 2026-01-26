"""
Spatial 모듈
가벼운 Web 메타공간 (채팅 + 캐릭터)
"""
from .router import router
from .service import SpatialService
from .schemas import (
    SpaceCreate,
    SpaceUpdate,
    SpaceResponse,
    SpaceChatRequest,
    SpaceChatResponse,
    SpaceParticipantResponse,
)

__all__ = [
    "router",
    "SpatialService",
    "SpaceCreate",
    "SpaceUpdate",
    "SpaceResponse",
    "SpaceChatRequest",
    "SpaceChatResponse",
    "SpaceParticipantResponse",
]
