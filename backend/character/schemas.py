"""
Character 모듈 - Pydantic 스키마
AI 캐릭터 고정 IP 데이터 구조
"""
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime


# ========== Character Personality ==========

class CharacterPersonality(BaseModel):
    """캐릭터 성격 설정"""
    tone: str = Field(..., description="톤 (따뜻함, 차갑함, 친근함 등)")
    speed: str = Field(default="보통", description="말하기 속도 (느림, 보통, 빠름)")
    emotion: Optional[str] = Field(None, description="기본 감정")
    style: Optional[str] = Field(None, description="스타일 (캐주얼, 포멀 등)")


# ========== Character Schemas ==========

class CharacterCreate(BaseModel):
    """캐릭터 생성 요청 (고정 IP 생성)"""
    name: str = Field(..., min_length=1, max_length=100, description="캐릭터 이름")
    base_image: Optional[str] = Field(None, description="기본 이미지 경로 (face.png)")
    voice_model: Optional[str] = Field(None, description="음성 모델 경로 (voice_ref.wav)")
    personality: Optional[CharacterPersonality] = Field(None, description="성격 설정")
    description: Optional[str] = Field(None, max_length=500, description="캐릭터 설명")
    tags: Optional[List[str]] = Field(default_factory=list, description="태그")


class CharacterUpdate(BaseModel):
    """캐릭터 수정 요청"""
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="캐릭터 이름")
    base_image: Optional[str] = Field(None, description="기본 이미지 경로")
    voice_model: Optional[str] = Field(None, description="음성 모델 경로")
    personality: Optional[CharacterPersonality] = Field(None, description="성격 설정")
    description: Optional[str] = Field(None, max_length=500, description="캐릭터 설명")
    tags: Optional[List[str]] = Field(None, description="태그")


class CharacterResponse(BaseModel):
    """캐릭터 응답 (고정 IP 정보)"""
    id: str = Field(..., description="캐릭터 ID")
    name: str
    base_image: Optional[str] = Field(None, description="기본 이미지")
    voice_model: Optional[str] = Field(None, description="음성 모델")
    personality: Optional[Dict[str, Any]] = Field(None, description="성격 설정")
    owner: str = Field(..., description="소유자 ID")
    description: Optional[str]
    tags: Optional[List[str]]
    usage_count: int = Field(default=0, description="사용 횟수")
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CharacterListResponse(BaseModel):
    """캐릭터 목록 응답"""
    characters: List[CharacterResponse]
    total: int
    page: int
    page_size: int


class CharacterUsageStats(BaseModel):
    """캐릭터 사용 통계 (IP 비즈니스 지표)"""
    character_id: str
    total_videos: int = Field(default=0, description="생성된 영상 수")
    total_audio: int = Field(default=0, description="생성된 오디오 수")
    total_live: int = Field(default=0, description="라이브 방송 수")
    total_goods: int = Field(default=0, description="굿즈 판매 수")
    total_revenue: float = Field(default=0.0, description="총 수익")


class CharacterVoiceRequest(BaseModel):
    """캐릭터 음성 생성 요청"""
    text: str = Field(..., min_length=1, max_length=5000, description="생성할 텍스트")
    voice_ref: Optional[str] = Field(None, description="음성 참조 파일 경로 (voice_ref.wav)")


class CharacterVoiceResponse(BaseModel):
    """캐릭터 음성 생성 응답"""
    character_id: str
    voice_url: str = Field(..., description="생성된 음성 파일 경로")
    duration: Optional[float] = Field(None, description="음성 길이 (초)")
    method: str = Field(..., description="사용된 방법 (voice_cloning, tts, fallback)")


# ========== Character Content Pipeline ==========

class CharacterContentRequest(BaseModel):
    """캐릭터 콘텐츠 생성 요청"""
    script: str = Field(..., description="스크립트 텍스트")
    character_id: str = Field(..., description="캐릭터 ID")
    output_type: str = Field(default="video", description="출력 타입 (feed, live, archive, video)")
    motion_type: str = Field(default="soft_breath", description="모션 타입")
    video_resolution: str = Field(default="1080p", description="비디오 해상도 (720p, 1080p)")
    include_subtitles: bool = Field(default=True, description="자막 포함 여부")


class CharacterContentResponse(BaseModel):
    """캐릭터 콘텐츠 생성 응답"""
    success: bool
    video_url: Optional[str] = None
    video_path: Optional[str] = None
    duration: float = 0.0
    voice_path: Optional[str] = None
    motion_path: Optional[str] = None
    feed_id: Optional[str] = None
    live_id: Optional[str] = None
    archive_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


# ========== Character Monetization ==========

class CharacterGoodsCreate(BaseModel):
    """캐릭터 굿즈 생성 요청"""
    goods_type: str = Field(..., description="굿즈 타입 (image_pack, voice_pack, sticker, merchandise)")
    title: str = Field(..., min_length=1, max_length=200, description="굿즈 제목")
    description: str = Field(..., max_length=1000, description="설명")
    price: float = Field(..., ge=0, description="가격")
    file_paths: List[str] = Field(..., description="파일 경로 리스트")
    preview_url: Optional[str] = Field(None, description="미리보기 URL")


class CharacterGoodsResponse(BaseModel):
    """캐릭터 굿즈 응답"""
    id: str
    character_id: str
    goods_type: str
    title: str
    description: str
    price: float
    preview_url: Optional[str]
    sales_count: int
    rating: float
    created_at: datetime


class LiveDonationRequest(BaseModel):
    """라이브 후원 요청"""
    donation_type: str = Field(..., description="후원 타입 (one_time, monthly, super_chat)")
    amount: float = Field(..., ge=0.01, description="후원 금액")
    message: Optional[str] = Field(None, max_length=500, description="후원 메시지")


class LiveDonationResponse(BaseModel):
    """라이브 후원 응답"""
    id: str
    character_id: str
    user_id: str
    donation_type: str
    amount: float
    message: Optional[str]
    created_at: datetime


class CharacterEducationCreate(BaseModel):
    """캐릭터 교육·스토리 생성 요청"""
    title: str = Field(..., min_length=1, max_length=200, description="제목")
    description: str = Field(..., max_length=1000, description="설명")
    content_type: str = Field(..., description="콘텐츠 타입 (education, story)")
    price: float = Field(..., ge=0, description="가격")
    content_path: str = Field(..., description="콘텐츠 파일 경로")
    duration: float = Field(default=0.0, ge=0, description="길이 (분)")


class CharacterEducationResponse(BaseModel):
    """캐릭터 교육·스토리 응답"""
    id: str
    character_id: str
    title: str
    description: str
    content_type: str
    price: float
    duration: float
    sales_count: int
    rating: float
    created_at: datetime


class CharacterRevenueStats(BaseModel):
    """캐릭터 수익 통계"""
    character_id: str
    goods_revenue: float = Field(default=0.0, description="굿즈 수익")
    live_revenue: float = Field(default=0.0, description="라이브 후원 수익")
    education_revenue: float = Field(default=0.0, description="교육·스토리 수익")
    total_revenue: float = Field(default=0.0, description="총 수익")
    goods_sales_count: int = Field(default=0, description="굿즈 판매 수")
    live_donations_count: int = Field(default=0, description="라이브 후원 수")
    education_sales_count: int = Field(default=0, description="교육·스토리 판매 수")
