"""
인증 API 라우트
"""

from fastapi import APIRouter, HTTPException, Depends, Header, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.user import UserCreate, UserLogin, Token, RefreshTokenRequest, UserResponse
from ..services.db_user_service import DBUserService
from ..database.connection import get_db
from ..database.models import User
from ..utils.security import SecurityManager
from ..utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
security = HTTPBearer()
db_user_service = DBUserService()
security_manager = SecurityManager()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """현재 인증된 사용자 가져오기"""
    token = credentials.credentials
    payload = security_manager.verify_token(token, is_refresh=False)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await db_user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    return user


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """회원가입"""
    try:
        result = await db_user_service.create_user(
            db,
            user_data.email,
            user_data.username,
            user_data.password
        )
        
        if result['success']:
            return {
                "message": "User registered successfully",
                "user_id": result['user_id']
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get('error', 'Registration failed')
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """로그인"""
    try:
        user = await db_user_service.get_user_by_email(db, credentials.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # 비밀번호 검증
        if not security_manager.verify_password(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive user"
            )
        
        # 마지막 로그인 업데이트
        from datetime import datetime
        user.last_login = datetime.utcnow()
        await db.commit()
        
        # 토큰 생성
        token_data = {
            'sub': user.id,
            'email': user.email,
            'role': user.role
        }
        access_token = security_manager.create_access_token(token_data)
        refresh_token = security_manager.create_refresh_token(token_data)
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    """토큰 갱신"""
    try:
        payload = security_manager.verify_token(refresh_data.refresh_token, is_refresh=True)
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        user = await db_user_service.get_user(db, user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # 새 토큰 생성
        token_data = {
            'sub': user.id,
            'email': user.email,
            'role': user.role
        }
        access_token = security_manager.create_access_token(token_data)
        refresh_token = security_manager.create_refresh_token(token_data)
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user)
):
    """로그아웃 (클라이언트에서 토큰 삭제)"""
    # JWT는 stateless이므로 서버 측에서 별도 처리 불필요
    # 클라이언트에서 토큰을 삭제하면 됨
    return {
        "message": "Logged out successfully"
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """현재 사용자 정보"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        role=current_user.role,
        plan=current_user.plan,
        credits=current_user.credits,
        created_at=current_user.created_at,
        is_active=current_user.is_active
    )
