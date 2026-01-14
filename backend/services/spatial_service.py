"""
Spatial/Metaverse Lite 서비스
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime

from ..database.models import Space, User, ActivityLog
from ..utils.logger import get_logger

logger = get_logger(__name__)


class SpatialService:
    """Spatial/Metaverse Lite 서비스"""
    
    async def create_space(
        self,
        db: AsyncSession,
        owner_id: str,
        name: str,
        description: Optional[str] = None,
        is_public: bool = False,
        max_users: int = 50
    ) -> Dict[str, Any]:
        """공간 생성"""
        try:
            space = Space(
                name=name,
                description=description,
                owner_id=owner_id,
                is_public=is_public,
                max_users=max_users,
                current_users=0
            )
            
            db.add(space)
            await db.commit()
            await db.refresh(space)
            
            return {
                'success': True,
                'space_id': space.id,
                'space': {
                    'id': space.id,
                    'name': space.name,
                    'description': space.description,
                    'is_public': space.is_public,
                    'max_users': space.max_users,
                    'created_at': space.created_at.isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Create space error: {e}")
            await db.rollback()
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_space(
        self,
        db: AsyncSession,
        space_id: str
    ) -> Dict[str, Any]:
        """공간 조회"""
        try:
            result = await db.execute(
                select(Space).where(Space.id == space_id)
            )
            space = result.scalar_one_or_none()
            
            if not space:
                return {
                    'success': False,
                    'error': 'Space not found'
                }
            
            # 소유자 정보
            owner_result = await db.execute(
                select(User).where(User.id == space.owner_id)
            )
            owner = owner_result.scalar_one_or_none()
            
            return {
                'success': True,
                'space': {
                    'id': space.id,
                    'name': space.name,
                    'description': space.description,
                    'is_public': space.is_public,
                    'max_users': space.max_users,
                    'current_users': space.current_users,
                    'owner': {
                        'id': owner.id if owner else None,
                        'username': owner.username if owner else 'Unknown'
                    },
                    'created_at': space.created_at.isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Get space error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def list_spaces(
        self,
        db: AsyncSession,
        is_public: Optional[bool] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """공간 목록 조회"""
        try:
            offset = (page - 1) * page_size
            
            query = select(Space)
            if is_public is not None:
                query = query.where(Space.is_public == is_public)
            
            query = query.order_by(Space.created_at.desc()).offset(offset).limit(page_size)
            
            result = await db.execute(query)
            spaces = result.scalars().all()
            
            space_list = []
            for space in spaces:
                space_list.append({
                    'id': space.id,
                    'name': space.name,
                    'description': space.description,
                    'is_public': space.is_public,
                    'max_users': space.max_users,
                    'current_users': space.current_users,
                    'created_at': space.created_at.isoformat()
                })
            
            return {
                'success': True,
                'spaces': space_list,
                'page': page,
                'page_size': page_size
            }
            
        except Exception as e:
            logger.error(f"List spaces error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def join_space(
        self,
        db: AsyncSession,
        space_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """공간 입장"""
        try:
            space_result = await db.execute(
                select(Space).where(Space.id == space_id)
            )
            space = space_result.scalar_one_or_none()
            
            if not space:
                return {
                    'success': False,
                    'error': 'Space not found'
                }
            
            # 최대 인원 확인
            if space.current_users >= space.max_users:
                return {
                    'success': False,
                    'error': 'Space is full'
                }
            
            # 입장 기록
            activity = ActivityLog(
                user_id=user_id,
                action='join_space',
                resource_type='space',
                resource_id=space_id
            )
            db.add(activity)
            
            # 현재 사용자 수 증가
            space.current_users += 1
            await db.commit()
            
            return {
                'success': True,
                'message': 'Joined space successfully',
                'current_users': space.current_users
            }
            
        except Exception as e:
            logger.error(f"Join space error: {e}")
            await db.rollback()
            return {
                'success': False,
                'error': str(e)
            }
    
    async def leave_space(
        self,
        db: AsyncSession,
        space_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """공간 퇴장"""
        try:
            space_result = await db.execute(
                select(Space).where(Space.id == space_id)
            )
            space = space_result.scalar_one_or_none()
            
            if not space:
                return {
                    'success': False,
                    'error': 'Space not found'
                }
            
            # 퇴장 기록
            activity = ActivityLog(
                user_id=user_id,
                action='leave_space',
                resource_type='space',
                resource_id=space_id
            )
            db.add(activity)
            
            # 현재 사용자 수 감소
            if space.current_users > 0:
                space.current_users -= 1
            await db.commit()
            
            return {
                'success': True,
                'message': 'Left space successfully',
                'current_users': space.current_users
            }
            
        except Exception as e:
            logger.error(f"Leave space error: {e}")
            await db.rollback()
            return {
                'success': False,
                'error': str(e)
            }
