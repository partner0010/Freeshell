"""
캐릭터 콘텐츠 생성 파이프라인
Script → Character → Voice → Motion → Video → Feed / Live / Archive
"""
import os
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from enum import Enum
from datetime import datetime

from backend.utils.logger import get_logger

logger = get_logger(__name__)


class OutputType(str, Enum):
    """출력 타입"""
    FEED = "feed"
    LIVE = "live"
    ARCHIVE = "archive"
    VIDEO = "video"  # 단순 비디오만


@dataclass
class ScriptData:
    """스크립트 데이터"""
    text: str
    scenes: List[Dict[str, Any]]
    duration: float
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class CharacterContentRequest:
    """캐릭터 콘텐츠 생성 요청"""
    script: str  # 또는 ScriptData
    character_id: str
    output_type: OutputType = OutputType.VIDEO
    motion_type: str = "soft_breath"  # 기본 모션
    video_resolution: str = "1080p"  # 720p, 1080p
    include_subtitles: bool = True


@dataclass
class CharacterContentResult:
    """캐릭터 콘텐츠 생성 결과"""
    success: bool
    video_url: Optional[str] = None
    video_path: Optional[str] = None
    duration: float = 0.0
    script_data: Optional[ScriptData] = None
    voice_path: Optional[str] = None
    motion_path: Optional[str] = None
    feed_id: Optional[str] = None
    live_id: Optional[str] = None
    archive_id: Optional[str] = None
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class CharacterContentPipeline:
    """캐릭터 콘텐츠 생성 파이프라인"""
    
    def __init__(self):
        """파이프라인 초기화"""
        self.output_dir = "storage/character_content"
        os.makedirs(self.output_dir, exist_ok=True)
    
    async def generate(
        self,
        request: CharacterContentRequest
    ) -> CharacterContentResult:
        """
        캐릭터 콘텐츠 생성 (전체 파이프라인)
        
        흐름:
        1. Script → 스크립트 생성/파싱
        2. Character → 캐릭터 정보 조회
        3. Voice → 음성 생성
        4. Motion → 모션 적용
        5. Video → 비디오 합성
        6. Feed/Live/Archive → 배포
        """
        try:
            logger.info(f"Starting character content pipeline for character: {request.character_id}")
            
            # 1. Script 처리
            script_data = await self._process_script(request.script)
            if not script_data:
                return CharacterContentResult(
                    success=False,
                    error="Failed to process script"
                )
            
            # 2. Character 조회
            character = await self._get_character(request.character_id)
            if not character:
                return CharacterContentResult(
                    success=False,
                    error=f"Character not found: {request.character_id}"
                )
            
            # 3. Voice 생성
            voice_path = await self._generate_voice(
                script_data=script_data,
                character=character
            )
            if not voice_path:
                return CharacterContentResult(
                    success=False,
                    error="Failed to generate voice"
                )
            
            # 4. Motion 생성
            motion_path = await self._generate_motion(
                character=character,
                script_data=script_data,
                motion_type=request.motion_type
            )
            if not motion_path:
                return CharacterContentResult(
                    success=False,
                    error="Failed to generate motion"
                )
            
            # 5. Video 합성
            video_result = await self._compose_video(
                script_data=script_data,
                character=character,
                voice_path=voice_path,
                motion_path=motion_path,
                resolution=request.video_resolution,
                include_subtitles=request.include_subtitles
            )
            if not video_result.get("success"):
                return CharacterContentResult(
                    success=False,
                    error=video_result.get("error", "Failed to compose video")
                )
            
            # 6. 배포 (Feed/Live/Archive)
            distribution_result = await self._distribute_content(
                video_path=video_result["video_path"],
                output_type=request.output_type,
                character_id=request.character_id,
                script_data=script_data
            )
            
            return CharacterContentResult(
                success=True,
                video_url=video_result.get("video_url"),
                video_path=video_result.get("video_path"),
                duration=video_result.get("duration", 0.0),
                script_data=script_data,
                voice_path=voice_path,
                motion_path=motion_path,
                feed_id=distribution_result.get("feed_id"),
                live_id=distribution_result.get("live_id"),
                archive_id=distribution_result.get("archive_id"),
                metadata={
                    "character_id": request.character_id,
                    "output_type": request.output_type.value,
                    "motion_type": request.motion_type,
                    "resolution": request.video_resolution
                }
            )
        
        except Exception as e:
            logger.error(f"Character content pipeline failed: {e}")
            return CharacterContentResult(
                success=False,
                error=str(e)
            )
    
    async def _process_script(self, script_input: str) -> Optional[ScriptData]:
        """스크립트 처리"""
        try:
            # Script가 문자열인 경우 파싱
            if isinstance(script_input, str):
                # 간단한 스크립트 파싱 (실제로는 AI Orchestrator 사용)
                from backend.app.services.ai_orchestrator import AIOrchestrator
                
                orchestrator = AIOrchestrator()
                # TODO: 실제 스크립트 생성 로직
                # 여기서는 예시로 기본 구조 반환
                
                script_data = ScriptData(
                    text=script_input,
                    scenes=[{
                        "id": "scene-001",
                        "text": script_input,
                        "duration": len(script_input) * 0.1  # 대략적인 시간
                    }],
                    duration=len(script_input) * 0.1
                )
                return script_data
            
            # ScriptData인 경우 그대로 반환
            elif isinstance(script_input, ScriptData):
                return script_input
            
            return None
        
        except Exception as e:
            logger.error(f"Script processing failed: {e}")
            return None
    
    async def _get_character(self, character_id: str) -> Optional[Dict[str, Any]]:
        """캐릭터 조회"""
        try:
            from backend.character.service import CharacterService
            from backend.core import get_async_db
            
            character_service = CharacterService()
            async for db in get_async_db():
                character = await character_service.get_character(db, character_id)
                if character:
                    metadata = character.metadata or {}
                    return {
                        "id": character.id,
                        "name": character.name,
                        "base_image": character.image_path,
                        "voice_model": metadata.get("voice_model"),
                        "personality": metadata.get("personality"),
                        "description": character.description
                    }
                break
            return None
        
        except Exception as e:
            logger.error(f"Character retrieval failed: {e}")
            return None
    
    async def _generate_voice(
        self,
        script_data: ScriptData,
        character: Dict[str, Any]
    ) -> Optional[str]:
        """음성 생성 (voice_id 캐싱 포함)"""
        try:
            from .voice_generator import generate_character_voice
            from backend.character.service import CharacterService
            from backend.core import get_async_db
            
            character_id = character.get("id")
            voice_ref = character.get("voice_model")
            
            # 캐릭터 metadata에서 voice_id 확인
            cached_voice_id = None
            if character_id:
                try:
                    character_service = CharacterService()
                    async for db in get_async_db():
                        char = await character_service.get_character(db, character_id)
                        if char and char.metadata:
                            cached_voice_id = char.metadata.get("voice_id")
                        break
                except Exception as e:
                    logger.warning(f"Failed to get cached voice_id: {e}")
            
            # voice_id가 있으면 사용, 없으면 생성 후 캐싱
            if cached_voice_id:
                voice_ref = cached_voice_id
            
            voice_result = generate_character_voice(
                text=script_data.text,
                voice_ref=voice_ref,
                character_id=character_id,
                personality=character.get("personality")
            )
            
            # 튜플 반환 처리
            if isinstance(voice_result, tuple):
                voice_path, new_voice_id = voice_result
            else:
                voice_path = voice_result
                new_voice_id = None
            
            # voice_id 캐싱 (새로 생성된 경우)
            if character_id and new_voice_id and not cached_voice_id:
                try:
                    # voice_generator에서 반환된 voice_id를 캐릭터에 저장
                    # 주의: generate_character_voice는 동기 함수이므로
                    # voice_id를 반환하도록 수정 필요 (현재는 파일 경로만 반환)
                    # 임시로 voice_ref가 voice_id 형식이면 캐싱
                    if new_voice_id:
                        character_service = CharacterService()
                        async for db in get_async_db():
                            char = await character_service.get_character(db, character_id)
                            if char:
                                if not char.metadata:
                                    char.metadata = {}
                                char.metadata["voice_id"] = new_voice_id
                                await db.commit()
                                await db.refresh(char)
                                logger.info(f"Voice ID cached for character: {character_id}")
                            break
                except Exception as e:
                    logger.warning(f"Failed to cache voice_id: {e}")
            
            return voice_path if voice_path and os.path.exists(voice_path) else None
        
        except Exception as e:
            logger.error(f"Voice generation failed: {e}")
            return None
    
    async def _generate_motion(
        self,
        character: Dict[str, Any],
        script_data: ScriptData,
        motion_type: str = "soft_breath"
    ) -> Optional[str]:
        """모션 생성"""
        try:
            # 기존 MotionService 활용
            from backend.services.motion_service import MotionService
            
            motion_service = MotionService()
            base_image = character.get("base_image")
            
            if not base_image or not os.path.exists(base_image):
                logger.warning(f"Character image not found: {base_image}")
                return None
            
            # 모션 적용
            motion_result = motion_service.apply_motion_to_image(
                image_path=base_image,
                motion_type=motion_type,
                duration=script_data.duration
            )
            
            if motion_result.get("success"):
                return motion_result.get("file_path")
            
            return None
        
        except Exception as e:
            logger.error(f"Motion generation failed: {e}")
            return None
    
    async def _compose_video(
        self,
        script_data: ScriptData,
        character: Dict[str, Any],
        voice_path: str,
        motion_path: str,
        resolution: str = "1080p",
        include_subtitles: bool = True
    ) -> Dict[str, Any]:
        """비디오 합성"""
        try:
            from backend.app.services.video_composer import (
                VideoComposer,
                VideoCompositionRequest,
                VideoScene,
                TransitionEffect,
                VideoProvider
            )
            
            # 해상도 설정
            width, height = (1920, 1080) if resolution == "1080p" else (1280, 720)
            
            # 씬 생성
            scenes = []
            for i, scene in enumerate(script_data.scenes):
                scenes.append(VideoScene(
                    image_url=motion_path,  # 모션 적용된 이미지
                    duration=scene.get("duration", 5.0),
                    transition=TransitionEffect.FADE if i > 0 else TransitionEffect.NONE,
                    subtitle=scene.get("text") if include_subtitles else None,
                    subtitle_position="bottom"
                ))
            
            # 비디오 합성 요청
            video_request = VideoCompositionRequest(
                scenes=scenes,
                audio_url=voice_path,
                output_width=width,
                output_height=height,
                fps=30
            )
            
            # 비디오 합성
            video_composer = VideoComposer()
            result = video_composer.compose(
                request=video_request,
                provider=VideoProvider.FFMPEG,
                upload_to_s3=False  # 로컬 파일로 먼저 저장
            )
            
            return {
                "success": True,
                "video_url": result.video_url,
                "video_path": result.video_url if not result.video_url.startswith("http") else None,
                "duration": result.duration
            }
        
        except Exception as e:
            logger.error(f"Video composition failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _distribute_content(
        self,
        video_path: str,
        output_type: OutputType,
        character_id: str,
        script_data: ScriptData
    ) -> Dict[str, Any]:
        """콘텐츠 배포 (Feed/Live/Archive)"""
        try:
            result = {}
            
            if output_type == OutputType.FEED:
                # Feed에 게시
                feed_id = await self._publish_to_feed(
                    video_path=video_path,
                    character_id=character_id,
                    script_data=script_data
                )
                result["feed_id"] = feed_id
            
            elif output_type == OutputType.LIVE:
                # Live 스트리밍 준비
                live_id = await self._prepare_live(
                    video_path=video_path,
                    character_id=character_id
                )
                result["live_id"] = live_id
            
            elif output_type == OutputType.ARCHIVE:
                # Archive에 저장
                archive_id = await self._save_to_archive(
                    video_path=video_path,
                    character_id=character_id,
                    script_data=script_data
                )
                result["archive_id"] = archive_id
            
            return result
        
        except Exception as e:
            logger.error(f"Content distribution failed: {e}")
            return {}
    
    async def _publish_to_feed(
        self,
        video_path: str,
        character_id: str,
        script_data: ScriptData
    ) -> Optional[str]:
        """Feed에 게시"""
        try:
            from backend.feed.service import FeedService
            from backend.feed.schemas import FeedItemCreate, FeedItemType
            from backend.core import get_async_db
            
            feed_service = FeedService()
            
            # Feed 아이템 생성
            feed_data = FeedItemCreate(
                content_id=video_path,
                content_type=FeedItemType.VIDEO,
                title=f"캐릭터 콘텐츠: {script_data.text[:50]}",
                description=script_data.text,
                character_id=character_id,
                tags=[],
                metadata={
                    "script": script_data.text,
                    "scenes": script_data.scenes,
                    "duration": script_data.duration
                }
            )
            
            async for db in get_async_db():
                # 사용자 ID는 character에서 가져와야 함
                from backend.character.service import CharacterService
                character_service = CharacterService()
                character = await character_service.get_character(db, character_id)
                
                if character:
                    result = await feed_service.create_feed_item(db, character.user_id, feed_data)
                    if result["success"]:
                        logger.info(f"Published to feed: {result['feed_item_id']}")
                        return result["feed_item_id"]
                break
            
            logger.warning(f"Failed to publish to feed: character not found")
            return None
        
        except Exception as e:
            logger.error(f"Feed publishing failed: {e}")
            return None
    
    async def _prepare_live(
        self,
        video_path: str,
        character_id: str
    ) -> Optional[str]:
        """Live 스트리밍 준비"""
        try:
            from backend.services.live_service import LiveService
            from backend.core import get_async_db
            
            live_service = LiveService()
            
            # 사용자 ID는 character에서 가져와야 함
            async for db in get_async_db():
                from backend.character.service import CharacterService
                character_service = CharacterService()
                character = await character_service.get_character(db, character_id)
                
                if character:
                    result = await live_service.prepare_live_stream(
                        video_path=video_path,
                        character_id=character_id,
                        user_id=character.user_id,
                        title=f"Live Stream - {character.name}",
                        description=f"Character live stream: {character_id}"
                    )
                    
                    if result.get("success"):
                        logger.info(f"Live stream prepared: {result['live_id']}")
                        return result["live_id"]
                break
            
            logger.warning(f"Failed to prepare live stream: character not found")
            return None
        
        except Exception as e:
            logger.error(f"Live preparation failed: {e}")
            return None
    
    async def _save_to_archive(
        self,
        video_path: str,
        character_id: str,
        script_data: ScriptData
    ) -> Optional[str]:
        """Archive에 저장"""
        try:
            from backend.services.archive_service import ArchiveService
            from backend.core import get_async_db
            
            archive_service = ArchiveService()
            
            # 사용자 ID는 character에서 가져와야 함
            async for db in get_async_db():
                from backend.character.service import CharacterService
                character_service = CharacterService()
                character = await character_service.get_character(db, character_id)
                
                if character:
                    result = await archive_service.save_to_archive(
                        video_path=video_path,
                        character_id=character_id,
                        user_id=character.user_id,
                        script_data={
                            "text": script_data.text,
                            "scenes": script_data.scenes,
                            "duration": script_data.duration,
                            "metadata": script_data.metadata
                        },
                        metadata={
                            "character_id": character_id,
                            "created_at": datetime.utcnow().isoformat()
                        }
                    )
                    
                    if result.get("success"):
                        logger.info(f"Saved to archive: {result['archive_id']}")
                        return result["archive_id"]
                break
            
            logger.warning(f"Failed to save to archive: character not found")
            return None
        
        except Exception as e:
            logger.error(f"Archive save failed: {e}")
            return None
