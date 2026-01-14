"""
인증 API 라우트
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.user import UserCreate, UserLogin, Token
from ..services.user_service import UserService
from ..services.db_user_service import DBUserService
from ..database.connection import get_db
from ..utils.security import SecurityManager
from ..utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()
user_service = UserService()  # 파일 기반 (레거시)
db_user_service = DBUserService()  # 데이터베이스 기반
security_manager = SecurityManager()


@router.post("/register", response_model=dict)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """사용자 등록"""
    try:
        result = await db_user_service.create_user(
            db,
            user_data.email,
            user_data.username,
            user_data.password
        )
        
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=400, detail=result.get('error'))
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """로그인"""
    try:
        result = await db_user_service.authenticate_user(
            db,
            credentials.email,
            credentials.password
        )
        
        if result:
            return Token(access_token=result['access_token'])
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/me")
def get_current_user_info(authorization: Optional[str] = Header(None)):
    """현재 사용자 정보"""
    try:
        if not authorization:
            raise HTTPException(status_code=401, detail="Authorization header required")
        
        # Bearer 토큰 추출
        if authorization.startswith('Bearer '):
            token = authorization[7:]
        else:
            token = authorization
        
        payload = security_manager.verify_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_id = payload.get('sub')
        user = user_service.get_user(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            'success': True,
            'user': user
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user info error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
