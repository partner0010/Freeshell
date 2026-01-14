"""
데이터베이스 기반 사용자 서비스
"""

from typing import Optional, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..database.models import User
from ..utils.security import SecurityManager
from ..utils.logger import get_logger

logger = get_logger(__name__)


class DBUserService:
    """데이터베이스 기반 사용자 서비스"""
    
    def __init__(self):
        self.security_manager = SecurityManager()
    
    async def create_user(
        self,
        db: AsyncSession,
        email: str,
        username: str,
        password: str,
        role: str = 'user'
    ) -> Dict[str, Any]:
        """사용자 생성"""
        try:
            # 이메일 중복 확인
            existing = await self.get_user_by_email(db, email)
            if existing:
                return {
                    'success': False,
                    'error': 'Email already exists'
                }
            
            # 사용자 생성
            hashed_password = self.security_manager.hash_password(password)
            user = User(
                email=email,
                username=username,
                password_hash=hashed_password,
                role=role,
                is_active=True
            )
            
            db.add(user)
            await db.commit()
            await db.refresh(user)
            
            logger.info(f"User created: {user.id} ({email})")
            
            return {
                'success': True,
                'user_id': user.id,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'role': user.role
                }
            }
            
        except Exception as e:
            logger.error(f"User creation error: {e}")
            await db.rollback()
            return {
                'success': False,
                'error': str(e)
            }
    
    async def authenticate_user(
        self,
        db: AsyncSession,
        email: str,
        password: str
    ) -> Optional[Dict[str, Any]]:
        """사용자 인증"""
        try:
            user = await self.get_user_by_email(db, email)
            if not user:
                return None
            
            # 비밀번호 검증
            if not self.security_manager.verify_password(password, user.password_hash):
                return None
            
            # 마지막 로그인 업데이트
            user.last_login = datetime.utcnow()
            await db.commit()
            
            # 토큰 생성
            token = self.security_manager.create_access_token({
                'sub': user.id,
                'email': user.email,
                'role': user.role
            })
            
            return {
                'user_id': user.id,
                'email': user.email,
                'username': user.username,
                'role': user.role,
                'access_token': token
            }
            
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            return None
    
    async def get_user(
        self,
        db: AsyncSession,
        user_id: str
    ) -> Optional[User]:
        """사용자 조회"""
        try:
            result = await db.execute(
                select(User).where(User.id == user_id)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Failed to load user {user_id}: {e}")
            return None
    
    async def get_user_by_email(
        self,
        db: AsyncSession,
        email: str
    ) -> Optional[User]:
        """이메일로 사용자 조회"""
        try:
            result = await db.execute(
                select(User).where(User.email == email)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Failed to load user by email {email}: {e}")
            return None
    
    async def is_admin(
        self,
        db: AsyncSession,
        user_id: str
    ) -> bool:
        """관리자 여부 확인"""
        user = await self.get_user(db, user_id)
        if not user:
            return False
        return user.role == 'admin'
    
    async def get_user_by_id(
        self,
        db: AsyncSession,
        user_id: str
    ) -> Optional[User]:
        """사용자 ID로 조회 (동일 메서드)"""
        return await self.get_user(db, user_id)
