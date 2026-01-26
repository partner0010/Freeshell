"""
Character 모듈 - 서비스
AI 캐릭터 고정 IP 비즈니스 로직
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload

from backend.core import get_db
from backend.database.models import User, Character, Project
from .schemas import CharacterCreate, CharacterUpdate, CharacterPersonality
from backend.utils.logger import get_logger

logger = get_logger(__name__)


class CharacterService:
    """캐릭터 서비스"""

    async def create_character(
        self,
        db: AsyncSession,
        user_id: str,
        character_data: CharacterCreate
    ) -> Dict[str, Any]:
        """
        캐릭터 생성 (고정 IP 생성)
        
        Args:
            db: DB 세션
            user_id: 사용자 ID
            character_data: 캐릭터 데이터
        
        Returns:
            생성 결과
        """
        try:
            # 성격 데이터를 JSON으로 변환
            personality_dict = None
            if character_data.personality:
                personality_dict = character_data.personality.model_dump()
            
            # 기존 Character 모델에 맞게 매핑
            # base_image → image_path
            # voice_model, personality → metadata에 저장
            metadata = {
                "voice_model": character_data.voice_model,
                "personality": personality_dict,
                "tags": character_data.tags or [],
                "voice_id": None  # ElevenLabs voice_id 캐싱용
            }
            
            character = Character(
                user_id=user_id,
                name=character_data.name,
                image_path=character_data.base_image,  # base_image → image_path
                description=character_data.description,
                metadata=metadata  # voice_model, personality, tags는 metadata에
            )
            
            db.add(character)
            await db.commit()
            await db.refresh(character)
            
            logger.info(f"Character created: {character.id} by user {user_id}")
            return {
                "success": True,
                "character_id": character.id,
                "character": character
            }
        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to create character: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def get_character(
        self,
        db: AsyncSession,
        character_id: str,
        user_id: Optional[str] = None
    ) -> Optional[Character]:
        """캐릭터 조회"""
        try:
            query = select(Character).where(Character.id == character_id)
            
            # 사용자 필터 (본인 캐릭터만)
            if user_id:
                query = query.where(Character.user_id == user_id)
            
            result = await db.execute(query)
            character = result.scalar_one_or_none()
            
            return character
        except Exception as e:
            logger.error(f"Failed to get character: {e}")
            return None

    async def list_characters(
        self,
        db: AsyncSession,
        user_id: str,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """캐릭터 목록 조회"""
        try:
            query = select(Character).where(Character.user_id == user_id)
            
            # 총 개수
            count_query = select(func.count()).select_from(Character).where(Character.user_id == user_id)
            total_result = await db.execute(count_query)
            total = total_result.scalar()
            
            # 페이지네이션
            offset = (page - 1) * page_size
            query = query.order_by(desc(Character.created_at)).offset(offset).limit(page_size)
            
            result = await db.execute(query)
            characters = result.scalars().all()
            
            return {
                "success": True,
                "characters": list(characters),
                "total": total,
                "page": page,
                "page_size": page_size
            }
        except Exception as e:
            logger.error(f"Failed to list characters: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def update_character(
        self,
        db: AsyncSession,
        character_id: str,
        user_id: str,
        character_data: CharacterUpdate
    ) -> Dict[str, Any]:
        """캐릭터 수정"""
        try:
            character = await self.get_character(db, character_id, user_id)
            if not character:
                return {
                    "success": False,
                    "error": "Character not found"
                }
            
            # 업데이트
            if character_data.name is not None:
                character.name = character_data.name
            if character_data.base_image is not None:
                character.image_path = character_data.base_image
            if character_data.description is not None:
                character.description = character_data.description
            
            # metadata 업데이트
            if character_data.voice_model is not None or character_data.personality is not None or character_data.tags is not None:
                if not character.metadata:
                    character.metadata = {}
                
                if character_data.voice_model is not None:
                    character.metadata["voice_model"] = character_data.voice_model
                if character_data.personality is not None:
                    character.metadata["personality"] = character_data.personality.model_dump()
                if character_data.tags is not None:
                    character.metadata["tags"] = character_data.tags
            
            await db.commit()
            await db.refresh(character)
            
            logger.info(f"Character updated: {character_id}")
            return {
                "success": True,
                "character": character
            }
        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to update character: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def delete_character(
        self,
        db: AsyncSession,
        character_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """캐릭터 삭제"""
        try:
            character = await self.get_character(db, character_id, user_id)
            if not character:
                return {
                    "success": False,
                    "error": "Character not found"
                }
            
            await db.delete(character)
            await db.commit()
            
            logger.info(f"Character deleted: {character_id}")
            return {
                "success": True
            }
        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to delete character: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def get_character_usage_stats(
        self,
        db: AsyncSession,
        character_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """
        캐릭터 사용 통계 조회
        - 생성된 영상 수
        - 생성된 오디오 수
        - 라이브 방송 수
        - 굿즈 판매 수
        - 총 수익
        """
        try:
            character = await self.get_character(db, character_id, user_id)
            if not character:
                return {
                    "success": False,
                    "error": "Character not found"
                }
            
            # Content 테이블에서 character_id로 필터링
            from backend.database.models import Content
            from sqlalchemy import and_, or_
            import json
            
            # 영상 수 (type='video'이고 metadata에 character_id가 있는 경우)
            # PostgreSQL JSONB 쿼리 또는 SQLite JSON 쿼리
            try:
                video_query = select(func.count()).select_from(Content).join(
                    Project, Content.project_id == Project.id
                ).where(
                    and_(
                        Project.user_id == user_id,
                        Content.type == 'video'
                    )
                )
                video_result = await db.execute(video_query)
                all_videos = video_result.scalar() or 0
                
                # 메모리에서 필터링 (실제로는 DB 쿼리 최적화 필요)
                total_videos = 0
                if all_videos > 0:
                    content_query = select(Content).join(
                        Project, Content.project_id == Project.id
                    ).where(
                        and_(
                            Project.user_id == user_id,
                            Content.type == 'video'
                        )
                    )
                    content_result = await db.execute(content_query)
                    contents = content_result.scalars().all()
                    for content in contents:
                        if content.metadata and content.metadata.get("character_id") == character_id:
                            total_videos += 1
            except Exception as e:
                logger.warning(f"Video count query failed: {e}")
                total_videos = 0
            
            # 오디오 수
            try:
                audio_query = select(func.count()).select_from(Content).join(
                    Project, Content.project_id == Project.id
                ).where(
                    and_(
                        Project.user_id == user_id,
                        Content.type == 'audio'
                    )
                )
                audio_result = await db.execute(audio_query)
                all_audio = audio_result.scalar() or 0
                
                total_audio = 0
                if all_audio > 0:
                    content_query = select(Content).join(
                        Project, Content.project_id == Project.id
                    ).where(
                        and_(
                            Project.user_id == user_id,
                            Content.type == 'audio'
                        )
                    )
                    content_result = await db.execute(content_query)
                    contents = content_result.scalars().all()
                    for content in contents:
                        if content.metadata and content.metadata.get("character_id") == character_id:
                            total_audio += 1
            except Exception as e:
                logger.warning(f"Audio count query failed: {e}")
                total_audio = 0
            
            # TODO: Live, Goods 테이블이 생기면 추가
            # 현재는 metadata에서 통계 추출
            metadata = character.metadata or {}
            stats_metadata = metadata.get("stats", {})
            
            stats = {
                "character_id": character_id,
                "total_videos": total_videos or stats_metadata.get("total_videos", 0),
                "total_audio": total_audio or stats_metadata.get("total_audio", 0),
                "total_live": stats_metadata.get("total_live", 0),
                "total_goods": stats_metadata.get("total_goods", 0),
                "total_revenue": stats_metadata.get("total_revenue", 0.0)
            }
            
            return {
                "success": True,
                "stats": stats
            }
        except Exception as e:
            logger.error(f"Failed to get character stats: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def increment_usage(
        self,
        db: AsyncSession,
        character_id: str,
        usage_type: str = "video"  # video, audio, live, goods
    ) -> Dict[str, Any]:
        """
        캐릭터 사용 횟수 증가
        영상, 음성, 라이브, 굿즈 생성 시 호출
        """
        try:
            character = await self.get_character(db, character_id)
            if not character:
                return {
                    "success": False,
                    "error": "Character not found"
                }
            
            # 사용 횟수 증가 (metadata에 저장)
            if not character.metadata:
                character.metadata = {}
            
            usage_count = character.metadata.get("usage_count", 0)
            character.metadata["usage_count"] = usage_count + 1
            
            await db.commit()
            await db.refresh(character)
            
            logger.info(f"Character usage incremented: {character_id}, type: {usage_type}")
            return {
                "success": True,
                "usage_count": character.usage_count
            }
        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to increment usage: {e}")
            return {
                "success": False,
                "error": str(e)
            }
