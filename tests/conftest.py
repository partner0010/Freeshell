"""
테스트 설정
"""
import pytest
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker

from backend.database.connection import Base, get_db
from backend.database.models import User


@pytest.fixture
async def db():
    """테스트용 DB 세션"""
    # 테스트용 인메모리 DB
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with async_session() as session:
        yield session
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest.fixture
async def test_user(db: AsyncSession):
    """테스트용 사용자"""
    user = User(
        id="test_user_1",
        email="test@example.com",
        username="testuser",
        hashed_password="hashed_password"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
