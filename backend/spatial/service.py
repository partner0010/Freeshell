"""
Spatial 모듈 - 서비스
가벼운 Web 메타공간 비즈니스 로직
"""
from typing import Dict, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from datetime import datetime

from backend.database.models import Space, User
from backend.utils.logger import get_logger
from backend.services.spatial_service import SpatialService as BaseSpatialService
from .schemas import SpaceCreate, SpaceUpdate, SpaceChatRequest
from .chat_handler import space_chat
from backend.database.models import Space

logger = get_logger(__name__)


class SpatialService(BaseSpatialService):
    """Spatial 서비스 (확장)"""
    
    async def create_space(
        self,
        db: AsyncSession,
        owner_id: str,
        space_data: SpaceCreate
    ) -> Dict[str, Any]:
        """공간 생성"""
        try:
            # BaseSpatialService의 create_space 호출
            result = await super().create_space(
                db=db,
                owner_id=owner_id,
                name=space_data.name,
                description=space_data.description,
                is_public=space_data.is_public or False,
                max_users=space_data.max_users or 50
            )
            
            if result["success"]:
                # Space 모델에 metadata 추가 (type, theme)
                space_id = result.get("space_id")
                if space_id:
                    space_result = await db.execute(
                        select(Space).where(Space.id == space_id)
                    )
                    space = space_result.scalar_one_or_none()
                    if space:
                        # metadata 필드가 있으면 업데이트, 없으면 무시
                        if hasattr(space, 'metadata'):
                            metadata = space.metadata or {}
                            if space_data.type:
                                metadata["type"] = space_data.type
                            if space_data.theme:
                                metadata["theme"] = space_data.theme
                            space.metadata = metadata
                            await db.commit()
                            await db.refresh(space)
            
            return result
        except Exception as e:
            logger.error(f"Failed to create space: {e}")
            await db.rollback()
            return {"success": False, "error": str(e)}
    
    async def list_spaces(
        self,
        db: AsyncSession,
        user_id: Optional[str] = None,
        space_type: Optional[str] = None,
        is_public: Optional[bool] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """공간 목록 조회"""
        try:
            query = select(Space)
            
            # 필터링
            if user_id:
                query = query.where(Space.owner_id == user_id)
            if is_public is not None:
                query = query.where(Space.is_public == is_public)
            
            # 페이지네이션
            total_query = select(func.count()).select_from(query.subquery())
            total_result = await db.execute(total_query)
            total = total_result.scalar() or 0
            
            offset = (page - 1) * page_size
            query = query.order_by(desc(Space.created_at)).offset(offset).limit(page_size)
            
            result = await db.execute(query)
            spaces = result.scalars().all()
            
            return {
                "success": True,
                "spaces": spaces,
                "total": total,
                "page": page,
                "page_size": page_size
            }
        except Exception as e:
            logger.error(f"Failed to list spaces: {e}")
            return {"success": False, "error": str(e)}
    
    async def update_space(
        self,
        db: AsyncSession,
        space_id: str,
        user_id: str,
        space_data: SpaceUpdate
    ) -> Dict[str, Any]:
        """공간 업데이트"""
        try:
            result = await db.execute(
                select(Space).where(Space.id == space_id)
            )
            space = result.scalar_one_or_none()
            
            if not space:
                return {"success": False, "error": "Space not found"}
            
            if space.owner_id != user_id:
                return {"success": False, "error": "Permission denied"}
            
            # 업데이트
            if space_data.name is not None:
                space.name = space_data.name
            if space_data.description is not None:
                space.description = space_data.description
            if space_data.is_public is not None:
                space.is_public = space_data.is_public
            if space_data.max_users is not None:
                space.max_users = space_data.max_users
            
            # metadata 업데이트 (metadata 필드가 있는 경우)
            if hasattr(space, 'metadata'):
                if not space.metadata:
                    space.metadata = {}
                if space_data.type is not None:
                    space.metadata["type"] = space_data.type
                if space_data.theme is not None:
                    space.metadata["theme"] = space_data.theme
            
            space.updated_at = datetime.utcnow()
            
            await db.commit()
            await db.refresh(space)
            
            return {"success": True, "space": space}
        except Exception as e:
            logger.error(f"Failed to update space: {e}")
            await db.rollback()
            return {"success": False, "error": str(e)}
    
    async def join_space(
        self,
        db: AsyncSession,
        space_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """공간 입장"""
        try:
            result = await db.execute(
                select(Space).where(Space.id == space_id)
            )
            space = result.scalar_one_or_none()
            
            if not space:
                return {"success": False, "error": "Space not found"}
            
            if space.current_users >= space.max_users:
                return {"success": False, "error": "Space is full"}
            
            space.current_users += 1
            await db.commit()
            await db.refresh(space)
            
            return {"success": True, "space": space}
        except Exception as e:
            logger.error(f"Failed to join space: {e}")
            await db.rollback()
            return {"success": False, "error": str(e)}
    
    async def leave_space(
        self,
        db: AsyncSession,
        space_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """공간 퇴장"""
        try:
            result = await db.execute(
                select(Space).where(Space.id == space_id)
            )
            space = result.scalar_one_or_none()
            
            if not space:
                return {"success": False, "error": "Space not found"}
            
            if space.current_users > 0:
                space.current_users -= 1
            
            await db.commit()
            await db.refresh(space)
            
            return {"success": True, "space": space}
        except Exception as e:
            logger.error(f"Failed to leave space: {e}")
            await db.rollback()
            return {"success": False, "error": str(e)}
    
    async def process_chat(
        self,
        db: AsyncSession,
        space_id: str,
        user_id: str,
        chat_request: SpaceChatRequest
    ) -> Dict[str, Any]:
        """채팅 처리 + 캐릭터 반응"""
        try:
            # 공간 확인
            result = await db.execute(
                select(Space).where(Space.id == space_id)
            )
            space = result.scalar_one_or_none()
            
            if not space:
                return {"success": False, "error": "Space not found"}
            
            # space_chat 호출 (AI 모델 사용)
            chat_result = await space_chat(
                user_id=user_id,
                message=chat_request.message,
                character_id=chat_request.character_id,
                space_id=space_id
            )
            
            return {
                "success": True,
                "space_id": space_id,
                "user_id": user_id,
                "character_id": chat_request.character_id,
                "message": chat_request.message,
                "character_reply": chat_result.get("character_reply"),
                "emotion": chat_result.get("emotion"),
                "timestamp": chat_result.get("timestamp", datetime.utcnow().isoformat())
            }
        except Exception as e:
            logger.error(f"Failed to process chat: {e}")
            return {"success": False, "error": str(e)}
