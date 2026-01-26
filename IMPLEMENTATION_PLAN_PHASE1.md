# Phase 1: 공통 백엔드 구조 구현 계획

**작성 일시**: 2026-01-25  
**목표**: 모듈화된 백엔드 구조 구축  
**기간**: 1주

---

## 현재 구조 분석

### 기존 구조
```
backend/
├── database/
│   └── models.py          # 모든 모델이 한 파일에
├── api/                   # 라우터들이 분산
│   ├── sns_routes.py
│   ├── recommendation_routes.py
│   └── ...
├── services/              # 서비스들이 분산
│   ├── recommendation_service.py
│   └── ...
└── app/
    ├── core/
    ├── db/
    └── services/
```

### 문제점
- 모델이 한 파일에 집중 (`database/models.py`)
- 라우터와 서비스가 분산되어 있어 찾기 어려움
- 기능별 모듈화 부족
- 공통 기능 (auth, permissions)이 명확하지 않음

---

## 제안된 구조

```
backend/
├── core/                  # 공통 기능
│   ├── __init__.py
│   ├── db.py             # 데이터베이스 연결
│   ├── auth.py           # 인증/인가
│   └── permissions.py    # 권한 관리
│
├── content/               # 콘텐츠 관리
│   ├── __init__.py
│   ├── models.py         # Content, Project 모델
│   ├── schemas.py        # Pydantic 스키마
│   ├── service.py         # 비즈니스 로직
│   └── router.py         # API 엔드포인트
│
├── feed/                  # 커뮤니티 피드
│   ├── __init__.py
│   ├── models.py         # FeedItem, FeedInteraction 모델
│   ├── schemas.py
│   ├── service.py         # 피드 생성, 추천 로직
│   └── router.py
│
├── library/               # 라이브러리 (내 콘텐츠 관리)
│   ├── __init__.py
│   ├── models.py         # LibraryItem, Collection 모델
│   ├── schemas.py
│   ├── service.py         # 라이브러리 관리 로직
│   └── router.py
│
├── experts/               # 전문가 마켓플레이스
│   ├── __init__.py
│   ├── models.py         # Expert, ExpertRequest 모델
│   ├── schemas.py
│   ├── service.py         # 전문가 매칭 로직
│   └── router.py
│
└── main.py                # FastAPI 앱 진입점
```

---

## 1단계: 공통 백엔드 구조 구현

### Step 1.1: Core 모듈 구현

#### `backend/core/__init__.py`
```python
"""공통 기능 모듈"""
from .db import get_db, Base
from .auth import get_current_user, require_auth
from .permissions import check_permission, Permission

__all__ = [
    "get_db",
    "Base",
    "get_current_user",
    "require_auth",
    "check_permission",
    "Permission",
]
```

#### `backend/core/db.py`
```python
"""데이터베이스 연결 관리"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
import os

# 환경 변수에서 DB URL 가져오기
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/dbname")
ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# 동기 엔진 (마이그레이션용)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 비동기 엔진 (실제 사용)
async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

def get_db():
    """동기 DB 세션 (마이그레이션용)"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_async_db():
    """비동기 DB 세션 (실제 사용)"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
```

#### `backend/core/auth.py`
```python
"""인증/인가 관리"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError, jwt
from typing import Optional
import os

from .db import get_async_db
from ..database.models import User

security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
JWT_ALGORITHM = "HS256"

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_async_db)
) -> User:
    """현재 사용자 가져오기"""
    token = credentials.credentials
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    # DB에서 사용자 조회
    from sqlalchemy import select
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    return user

def require_auth():
    """인증 필수 데코레이터"""
    return Depends(get_current_user)
```

#### `backend/core/permissions.py`
```python
"""권한 관리"""
from enum import Enum
from fastapi import HTTPException, status
from typing import List
from ..database.models import User

class Permission(str, Enum):
    """권한 타입"""
    # 콘텐츠 권한
    CONTENT_CREATE = "content:create"
    CONTENT_READ = "content:read"
    CONTENT_UPDATE = "content:update"
    CONTENT_DELETE = "content:delete"
    
    # 피드 권한
    FEED_READ = "feed:read"
    FEED_POST = "feed:post"
    FEED_MODERATE = "feed:moderate"
    
    # 라이브러리 권한
    LIBRARY_READ = "library:read"
    LIBRARY_MANAGE = "library:manage"
    
    # 전문가 권한
    EXPERT_VIEW = "expert:view"
    EXPERT_REQUEST = "expert:request"
    EXPERT_MANAGE = "expert:manage"
    
    # 관리자 권한
    ADMIN_ACCESS = "admin:access"

# 플랜별 권한 매핑
PLAN_PERMISSIONS = {
    "free": [
        Permission.CONTENT_CREATE,
        Permission.CONTENT_READ,
        Permission.FEED_READ,
        Permission.LIBRARY_READ,
        Permission.EXPERT_VIEW,
    ],
    "pro": [
        Permission.CONTENT_CREATE,
        Permission.CONTENT_READ,
        Permission.CONTENT_UPDATE,
        Permission.FEED_READ,
        Permission.FEED_POST,
        Permission.LIBRARY_READ,
        Permission.LIBRARY_MANAGE,
        Permission.EXPERT_VIEW,
        Permission.EXPERT_REQUEST,
    ],
    "business": [
        Permission.CONTENT_CREATE,
        Permission.CONTENT_READ,
        Permission.CONTENT_UPDATE,
        Permission.CONTENT_DELETE,
        Permission.FEED_READ,
        Permission.FEED_POST,
        Permission.LIBRARY_READ,
        Permission.LIBRARY_MANAGE,
        Permission.EXPERT_VIEW,
        Permission.EXPERT_REQUEST,
        Permission.EXPERT_MANAGE,
    ],
}

def check_permission(user: User, permission: Permission) -> bool:
    """사용자 권한 확인"""
    # 관리자는 모든 권한
    if user.role == "admin":
        return True
    
    # 플랜별 권한 확인
    user_permissions = PLAN_PERMISSIONS.get(user.plan, PLAN_PERMISSIONS["free"])
    return permission in user_permissions

def require_permission(permission: Permission):
    """권한 필수 데코레이터"""
    def decorator(user: User = Depends(get_current_user)):
        if not check_permission(user, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {permission.value}"
            )
        return user
    return decorator
```

---

### Step 1.2: 기존 구조와 통합

#### 기존 파일 위치 확인
- `backend/database/models.py` → 모델은 유지하되, 각 모듈에서 import
- `backend/app/db/session.py` → `backend/core/db.py`로 통합
- `backend/app/core/config.py` → 설정은 유지

#### 통합 전략
1. **점진적 마이그레이션**: 기존 코드는 유지하면서 새 구조 추가
2. **Import 경로 통일**: 새 모듈은 `backend.core.*` 사용
3. **기존 API 호환성**: 기존 라우터는 점진적으로 새 구조로 이동

---

### Step 1.3: 디렉토리 생성 및 초기 파일

#### 생성할 디렉토리
```
backend/
├── core/
│   ├── __init__.py
│   ├── db.py
│   ├── auth.py
│   └── permissions.py
├── content/
│   ├── __init__.py
│   ├── models.py (기존 모델 import)
│   ├── schemas.py
│   ├── service.py
│   └── router.py
├── feed/
│   ├── __init__.py
│   ├── models.py
│   ├── schemas.py
│   ├── service.py
│   └── router.py
├── library/
│   ├── __init__.py
│   ├── models.py
│   ├── schemas.py
│   ├── service.py
│   └── router.py
└── experts/
    ├── __init__.py
    ├── models.py
    ├── schemas.py
    ├── service.py
    └── router.py
```

---

## 구현 체크리스트

### Core 모듈
- [ ] `core/__init__.py` 생성
- [ ] `core/db.py` 구현 (기존 `app/db/session.py` 통합)
- [ ] `core/auth.py` 구현 (기존 인증 로직 통합)
- [ ] `core/permissions.py` 구현 (새로 작성)

### 통합 작업
- [ ] 기존 `app/db/session.py` → `core/db.py`로 마이그레이션
- [ ] 기존 인증 로직 → `core/auth.py`로 통합
- [ ] `main.py`에서 새 구조 import 테스트

### 테스트
- [ ] DB 연결 테스트
- [ ] 인증 테스트
- [ ] 권한 체크 테스트

---

## 다음 단계 (Phase 2)

Phase 1 완료 후:
1. **Content 모듈** 구현
2. **Feed 모듈** 구현
3. **Library 모듈** 구현
4. **Experts 모듈** 구현

각 모듈은 동일한 패턴으로:
- `models.py`: 데이터베이스 모델 (기존 모델 import 또는 확장)
- `schemas.py`: Pydantic 스키마
- `service.py`: 비즈니스 로직
- `router.py`: FastAPI 라우터

---

## 주의사항

1. **기존 코드 호환성**: 기존 API는 계속 동작해야 함
2. **점진적 마이그레이션**: 한 번에 모든 것을 바꾸지 말고 단계적으로
3. **테스트**: 각 단계마다 테스트 필수
4. **문서화**: 각 모듈의 역할과 사용법 문서화

---

## 예상 소요 시간

- Core 모듈 구현: 2일
- 통합 작업: 1일
- 테스트 및 버그 수정: 2일
- **총 예상 기간: 5일 (1주)**
