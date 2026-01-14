"""
데이터베이스 연결 관리
"""

import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from typing import AsyncGenerator

from .models import Base
from ..utils.logger import get_logger

logger = get_logger(__name__)

# 저장소 디렉토리 생성
storage_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'storage')
os.makedirs(storage_dir, exist_ok=True)

# 데이터베이스 URL (환경 변수 또는 기본값)
DATABASE_URL = os.getenv(
    'DATABASE_URL',
    f'sqlite+aiosqlite:///{os.path.join(storage_dir, "platform.db")}'
)

# PostgreSQL 사용 시
if DATABASE_URL.startswith('postgresql://'):
    DATABASE_URL = DATABASE_URL.replace('postgresql://', 'postgresql+asyncpg://', 1)

# 엔진 생성
if DATABASE_URL.startswith('sqlite'):
    # SQLite (비동기)
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        future=True,
        connect_args={"check_same_thread": False} if 'sqlite' in DATABASE_URL else {}
    )
else:
    # PostgreSQL (비동기)
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        future=True,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )

# 세션 팩토리
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def init_db():
    """데이터베이스 초기화"""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        raise


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """데이터베이스 세션 의존성"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
