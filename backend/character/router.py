"""
Character 모듈 - API 라우터
AI 캐릭터 고정 IP 시스템 API
"""
from fastapi import APIRouter, HTTPException, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import os

from backend.core import get_db, get_current_user, get_current_user_optional, require_permission, Permission
from backend.database.models import User
from backend.utils.logger import get_logger
from .service import CharacterService
from .schemas import (
    CharacterCreate,
    CharacterUpdate,
    CharacterResponse,
    CharacterListResponse,
    CharacterUsageStats,
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

router = APIRouter(prefix="/api/v1/characters", tags=["characters"])
character_service = CharacterService()
logger = get_logger(__name__)


# ========== Character Endpoints ==========

@router.post("", response_model=CharacterResponse, status_code=status.HTTP_201_CREATED)
async def create_character(
    character_data: CharacterCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    캐릭터 생성 (고정 IP 생성)
    
    플랫폼의 "얼굴"이 되는 캐릭터를 생성합니다.
    영상, 음성, 라이브, 굿즈까지 확장 가능한 IP를 만듭니다.
    """
    result = await character_service.create_character(db, user.id, character_data)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to create character")
        )
    
    # 응답 변환 (metadata에서 필드 추출)
    character = result["character"]
    metadata = character.metadata or {}
    
    return CharacterResponse(
        character_id=character.id,
        name=character.name,
        base_image=character.image_path,
        voice_model=metadata.get("voice_model"),
        personality=metadata.get("personality"),
        owner=character.user_id,
        description=character.description,
        tags=metadata.get("tags", []),
        usage_count=metadata.get("usage_count", 0),
        created_at=character.created_at,
        updated_at=character.updated_at
    )


@router.get("", response_model=CharacterListResponse)
async def list_characters(
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(20, ge=1, le=100, description="페이지 크기"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """캐릭터 목록 조회 (내 캐릭터 IP 목록)"""
    result = await character_service.list_characters(db, user.id, page, page_size)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to list characters")
        )
    
    # 응답 변환
    characters = []
    for char in result["characters"]:
        metadata = char.metadata or {}
        characters.append(CharacterResponse(
            id=char.id,
            name=char.name,
            base_image=char.image_path,
            voice_model=metadata.get("voice_model"),
            personality=metadata.get("personality"),
            owner=char.user_id,
            description=char.description,
            tags=metadata.get("tags", []),
            usage_count=metadata.get("usage_count", 0),
            created_at=char.created_at,
            updated_at=char.updated_at
        ))
    
    return CharacterListResponse(
        characters=characters,
        total=result["total"],
        page=result["page"],
        page_size=result["page_size"]
    )


@router.get("/{character_id}", response_model=CharacterResponse)
async def get_character(
    character_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """캐릭터 조회 (고정 IP 정보)"""
    character = await character_service.get_character(db, character_id, user.id)
    
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found"
        )
    
    # 응답 변환
    metadata = character.metadata or {}
    return CharacterResponse(
        id=character.id,
        name=character.name,
        base_image=character.image_path,
        voice_model=metadata.get("voice_model"),
        personality=metadata.get("personality"),
        owner=character.user_id,
        description=character.description,
        tags=metadata.get("tags", []),
        usage_count=metadata.get("usage_count", 0),
        created_at=character.created_at,
        updated_at=character.updated_at
    )


@router.put("/{character_id}", response_model=CharacterResponse)
async def update_character(
    character_id: str,
    character_data: CharacterUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """캐릭터 수정 (고정 IP 업데이트)"""
    result = await character_service.update_character(db, character_id, user.id, character_data)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to update character")
        )
    
    # 응답 변환
    character = result["character"]
    metadata = character.metadata or {}
    return CharacterResponse(
        id=character.id,
        name=character.name,
        base_image=character.image_path,
        voice_model=metadata.get("voice_model"),
        personality=metadata.get("personality"),
        owner=character.user_id,
        description=character.description,
        tags=metadata.get("tags", []),
        usage_count=metadata.get("usage_count", 0),
        created_at=character.created_at,
        updated_at=character.updated_at
    )


@router.delete("/{character_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_character(
    character_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """캐릭터 삭제"""
    result = await character_service.delete_character(db, character_id, user.id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to delete character")
        )


@router.get("/{character_id}/stats", response_model=CharacterUsageStats)
async def get_character_stats(
    character_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    캐릭터 사용 통계 조회 (IP 비즈니스 지표)
    
    - 생성된 영상 수
    - 생성된 오디오 수
    - 라이브 방송 수
    - 굿즈 판매 수
    - 총 수익
    """
    result = await character_service.get_character_usage_stats(db, character_id, user.id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to get character stats")
        )
    
    return CharacterUsageStats(**result["stats"])


@router.post("/{character_id}/voice", response_model=CharacterVoiceResponse)
async def generate_character_voice(
    character_id: str,
    voice_request: CharacterVoiceRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    캐릭터 음성 생성 (TTS + Voice Cloning Hook)
    
    캐릭터의 voice_model을 사용하여 텍스트를 음성으로 변환합니다.
    """
    # 캐릭터 조회
    character = await character_service.get_character(db, character_id, user.id)
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found"
        )
    
    # 캐릭터 메타데이터에서 voice_model 추출
    metadata = character.metadata or {}
    voice_ref = voice_request.voice_ref or metadata.get("voice_model")
    personality = metadata.get("personality")
    
    # 음성 생성
    from .voice_generator import generate_character_voice
    
    # 캐시된 voice_id 확인
    cached_voice_id = metadata.get("voice_id")
    if cached_voice_id:
        voice_ref = cached_voice_id
    
    try:
        voice_result = generate_character_voice(
            text=voice_request.text,
            voice_ref=voice_ref,
            character_id=character_id,
            personality=personality
        )
        
        # 튜플 반환 처리
        if isinstance(voice_result, tuple):
            output_path, new_voice_id = voice_result
        else:
            output_path = voice_result
            new_voice_id = None
        
        # voice_id 캐싱 (새로 생성된 경우)
        if new_voice_id and not cached_voice_id:
            if not character.metadata:
                character.metadata = {}
            character.metadata["voice_id"] = new_voice_id
            await db.commit()
            await db.refresh(character)
            logger.info(f"Voice ID cached for character: {character_id}")
        
        # 사용 횟수 증가
        await character_service.increment_usage(db, character_id, "audio")
        
        # 음성 길이 계산 (선택적)
        duration = None
        try:
            import wave
            with wave.open(output_path, 'rb') as wav_file:
                frames = wav_file.getnframes()
                sample_rate = wav_file.getframerate()
                duration = frames / float(sample_rate)
        except Exception:
            pass
        
        # 방법 판단
        method = "voice_cloning" if (voice_ref and (voice_ref.startswith("voice_") or len(voice_ref) == 20 or os.path.exists(voice_ref))) else "tts"
        
        return CharacterVoiceResponse(
            character_id=character_id,
            voice_url=output_path,
            duration=duration,
            method=method
        )
    
    except Exception as e:
        logger.error(f"Failed to generate character voice: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate voice: {str(e)}"
        )


@router.post("/{character_id}/content", response_model=CharacterContentResponse, status_code=status.HTTP_202_ACCEPTED)
async def generate_character_content(
    character_id: str,
    content_request: CharacterContentRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    캐릭터 콘텐츠 생성 (전체 파이프라인)
    
    흐름: Script → Character → Voice → Motion → Video → Feed/Live/Archive
    
    백그라운드 작업으로 실행되며 즉시 job_id를 반환합니다.
    """
    # 캐릭터 조회 및 권한 확인
    character = await character_service.get_character(db, character_id, user.id)
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found"
        )
    
    # 파이프라인 실행
    from .pipeline import CharacterContentPipeline, OutputType
    
    pipeline = CharacterContentPipeline()
    
    # OutputType 변환
    output_type_map = {
        "feed": OutputType.FEED,
        "live": OutputType.LIVE,
        "archive": OutputType.ARCHIVE,
        "video": OutputType.VIDEO
    }
    output_type = output_type_map.get(content_request.output_type, OutputType.VIDEO)
    
    # 파이프라인 요청 생성
    from .pipeline import CharacterContentRequest as PipelineRequest
    
    pipeline_request = PipelineRequest(
        script=content_request.script,
        character_id=character_id,
        output_type=output_type,
        motion_type=content_request.motion_type,
        video_resolution=content_request.video_resolution,
        include_subtitles=content_request.include_subtitles
    )
    
    # 파이프라인 실행
    result = await pipeline.generate(pipeline_request)
    
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.error or "Failed to generate character content"
        )
    
    # 사용 횟수 증가
    await character_service.increment_usage(db, character_id, "video")
    
    return CharacterContentResponse(
        success=True,
        video_url=result.video_url,
        video_path=result.video_path,
        duration=result.duration,
        voice_path=result.voice_path,
        motion_path=result.motion_path,
        feed_id=result.feed_id,
        live_id=result.live_id,
        archive_id=result.archive_id,
        metadata=result.metadata
    )


# ========== Character Monetization Endpoints ==========

@router.post("/{character_id}/goods", response_model=CharacterGoodsResponse, status_code=status.HTTP_201_CREATED)
async def create_character_goods(
    character_id: str,
    goods_data: CharacterGoodsCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    캐릭터 굿즈 생성 (이미지 팩, 음성 팩 등)
    """
    # 캐릭터 소유권 확인
    character = await character_service.get_character(db, character_id, user.id)
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found"
        )
    
    from .monetization import CharacterMonetization, GoodsType
    
    monetization = CharacterMonetization()
    
    goods_type_map = {
        "image_pack": GoodsType.IMAGE_PACK,
        "voice_pack": GoodsType.VOICE_PACK,
        "sticker": GoodsType.STICKER,
        "merchandise": GoodsType.MERCHANDISE
    }
    goods_type = goods_type_map.get(goods_data.goods_type, GoodsType.IMAGE_PACK)
    
    result = await monetization.create_goods(
        character_id=character_id,
        goods_type=goods_type,
        title=goods_data.title,
        description=goods_data.description,
        price=goods_data.price,
        file_paths=goods_data.file_paths,
        preview_url=goods_data.preview_url
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to create goods")
        )
    
    goods = result["goods"]
    return CharacterGoodsResponse(
        id=goods.id,
        character_id=goods.character_id,
        goods_type=goods.goods_type.value,
        title=goods.title,
        description=goods.description,
        price=goods.price,
        preview_url=goods.preview_url,
        sales_count=goods.sales_count,
        rating=goods.rating,
        created_at=goods.created_at
    )


@router.get("/{character_id}/goods", response_model=List[CharacterGoodsResponse])
async def list_character_goods(
    character_id: str,
    goods_type: Optional[str] = Query(None, description="굿즈 타입 필터"),
    user: User = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """캐릭터 굿즈 목록 조회"""
    from .monetization import CharacterMonetization, GoodsType
    
    monetization = CharacterMonetization()
    
    goods_type_enum = None
    if goods_type:
        goods_type_map = {
            "image_pack": GoodsType.IMAGE_PACK,
            "voice_pack": GoodsType.VOICE_PACK,
            "sticker": GoodsType.STICKER,
            "merchandise": GoodsType.MERCHANDISE
        }
        goods_type_enum = goods_type_map.get(goods_type)
    
    result = await monetization.list_goods(character_id, goods_type_enum)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to list goods")
        )
    
    # TODO: 실제 데이터 변환
    return []


@router.post("/{character_id}/live/donate", response_model=LiveDonationResponse, status_code=status.HTTP_201_CREATED)
async def create_live_donation(
    character_id: str,
    donation_request: LiveDonationRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    캐릭터 라이브 후원
    """
    from .monetization import CharacterMonetization, LiveDonationType
    
    monetization = CharacterMonetization()
    
    donation_type_map = {
        "one_time": LiveDonationType.ONE_TIME,
        "monthly": LiveDonationType.MONTHLY,
        "super_chat": LiveDonationType.SUPER_CHAT
    }
    donation_type = donation_type_map.get(donation_request.donation_type, LiveDonationType.ONE_TIME)
    
    result = await monetization.create_live_donation(
        character_id=character_id,
        user_id=user.id,
        donation_type=donation_type,
        amount=donation_request.amount,
        message=donation_request.message
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to create donation")
        )
    
    donation = result["donation"]
    return LiveDonationResponse(
        id=donation.id,
        character_id=donation.character_id,
        user_id=donation.user_id,
        donation_type=donation.donation_type.value,
        amount=donation.amount,
        message=donation.message,
        created_at=donation.created_at
    )


@router.post("/{character_id}/education", response_model=CharacterEducationResponse, status_code=status.HTTP_201_CREATED)
async def create_character_education(
    character_id: str,
    education_data: CharacterEducationCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    캐릭터 기반 교육·스토리 생성
    """
    # 캐릭터 소유권 확인
    character = await character_service.get_character(db, character_id, user.id)
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found"
        )
    
    from .monetization import CharacterMonetization
    
    monetization = CharacterMonetization()
    
    result = await monetization.create_education(
        character_id=character_id,
        title=education_data.title,
        description=education_data.description,
        content_type=education_data.content_type,
        price=education_data.price,
        content_path=education_data.content_path,
        duration=education_data.duration
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to create education")
        )
    
    education = result["education"]
    return CharacterEducationResponse(
        id=education.id,
        character_id=education.character_id,
        title=education.title,
        description=education.description,
        content_type=education.content_type,
        price=education.price,
        duration=education.duration,
        sales_count=education.sales_count,
        rating=education.rating,
        created_at=education.created_at
    )


@router.get("/{character_id}/revenue", response_model=CharacterRevenueStats)
async def get_character_revenue(
    character_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    캐릭터 수익 통계 조회
    - 굿즈 수익
    - 라이브 후원 수익
    - 교육·스토리 수익
    """
    # 캐릭터 소유권 확인
    character = await character_service.get_character(db, character_id, user.id)
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found"
        )
    
    from .monetization import CharacterMonetization
    
    monetization = CharacterMonetization()
    result = await monetization.get_revenue_stats(character_id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to get revenue stats")
        )
    
    stats = result["stats"]
    return CharacterRevenueStats(**stats)
