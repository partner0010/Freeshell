"""
쿠폰 시스템 데이터베이스 마이그레이션 실행 스크립트
"""
import os
import sys
import asyncio
from pathlib import Path

# 프로젝트 루트 경로 추가
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text


async def run_migration():
    """마이그레이션 실행"""
    # 데이터베이스 URL 가져오기
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("❌ DATABASE_URL 환경 변수가 설정되지 않았습니다.")
        print("\n다음 중 하나를 실행하세요:")
        print("1. .env 파일에 DATABASE_URL 설정")
        print("2. 환경 변수로 직접 설정: set DATABASE_URL=postgresql://...")
        return False
    
    # PostgreSQL 연결 문자열 변환
    if database_url.startswith('postgresql://'):
        # asyncpg를 위한 변환
        database_url = database_url.replace('postgresql://', 'postgresql+asyncpg://', 1)
    elif database_url.startswith('postgresql+asyncpg://'):
        pass  # 이미 변환됨
    else:
        print(f"❌ 지원하지 않는 데이터베이스 URL 형식: {database_url}")
        print("PostgreSQL URL이 필요합니다: postgresql://user:password@host:port/database")
        return False
    
    # 마이그레이션 SQL 파일 경로
    migration_file = project_root / 'backend' / 'coupon' / 'database_migration.sql'
    
    if not migration_file.exists():
        print(f"❌ 마이그레이션 파일을 찾을 수 없습니다: {migration_file}")
        return False
    
    # SQL 파일 읽기
    with open(migration_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    # SQL 주석 제거 (-- 로 시작하는 줄)
    lines = sql_content.split('\n')
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        # 주석이 아닌 줄만 포함
        if stripped and not stripped.startswith('--'):
            cleaned_lines.append(line)
    
    sql_content = '\n'.join(cleaned_lines)
    
    # SQL 문장 분리 (세미콜론 기준)
    statements = [s.strip() for s in sql_content.split(';') if s.strip()]
    
    print(f"📦 데이터베이스 연결 중...")
    print(f"   URL: {database_url.split('@')[1] if '@' in database_url else '***'}")
    
    try:
        # 엔진 생성
        engine = create_async_engine(
            database_url,
            echo=False,
            pool_pre_ping=True
        )
        
        async with engine.begin() as conn:
            print(f"✅ 데이터베이스 연결 성공")
            print(f"📝 마이그레이션 실행 중... ({len(statements)}개 SQL 문장)")
            
            for i, statement in enumerate(statements, 1):
                try:
                    # 각 SQL 문장 실행
                    await conn.execute(text(statement))
                    print(f"   [{i}/{len(statements)}] ✅ 실행 완료")
                except Exception as e:
                    # 이미 존재하는 테이블/인덱스는 무시
                    if 'already exists' in str(e).lower() or 'duplicate' in str(e).lower():
                        print(f"   [{i}/{len(statements)}] ⚠️  이미 존재 (건너뜀)")
                    else:
                        print(f"   [{i}/{len(statements)}] ❌ 오류: {e}")
                        raise
            
            print(f"\n✅ 마이그레이션 완료!")
            print(f"   - coupons 테이블 생성")
            print(f"   - coupon_usages 테이블 생성")
            print(f"   - 인덱스 생성")
            print(f"   - 트리거 생성")
            
        await engine.dispose()
        return True
        
    except Exception as e:
        print(f"\n❌ 마이그레이션 실패: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    print("=" * 60)
    print("쿠폰 시스템 데이터베이스 마이그레이션")
    print("=" * 60)
    print()
    
    success = asyncio.run(run_migration())
    
    if success:
        print("\n" + "=" * 60)
        print("✅ 마이그레이션이 성공적으로 완료되었습니다!")
        print("=" * 60)
        sys.exit(0)
    else:
        print("\n" + "=" * 60)
        print("❌ 마이그레이션 실패")
        print("=" * 60)
        sys.exit(1)
