"""
Character 모듈
AI 캐릭터 고정 IP 시스템
"""
from .router import router
from .service import CharacterService
from .schemas import (
    CharacterCreate,
    CharacterUpdate,
    CharacterResponse,
    CharacterPersonality,
    CharacterVoiceRequest,
    CharacterVoiceResponse,
    CharacterContentRequest,
    CharacterContentResponse,
    CharacterGoodsCreate,
    CharacterGoodsResponse,
    LiveDonationRequest,
    LiveDonationResponse,
    CharacterEducationCreate,
    CharacterEducationResponse,
    CharacterRevenueStats,
)

__all__ = [
    "router",
    "CharacterService",
    "CharacterCreate",
    "CharacterUpdate",
    "CharacterResponse",
    "CharacterPersonality",
    "CharacterVoiceRequest",
    "CharacterVoiceResponse",
    "CharacterContentRequest",
    "CharacterContentResponse",
    "CharacterGoodsCreate",
    "CharacterGoodsResponse",
    "LiveDonationRequest",
    "LiveDonationResponse",
    "CharacterEducationCreate",
    "CharacterEducationResponse",
    "CharacterRevenueStats",
]
