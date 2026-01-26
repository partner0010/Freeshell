# 쿠폰 시스템 데이터베이스 마이그레이션 가이드

## 🚀 빠른 실행 방법

### 방법 1: Python 스크립트 사용 (권장)

**Windows:**
```bash
scripts\run_coupon_migration.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/run_coupon_migration.sh
./scripts/run_coupon_migration.sh
```

**직접 Python 실행:**
```bash
python scripts/run_coupon_migration.py
```

### 방법 2: 수동 SQL 실행

**PostgreSQL psql 사용:**
```bash
psql -U postgres -d your_database -f backend/coupon/database_migration.sql
```

**Supabase SQL Editor:**
1. Supabase 대시보드 접속
2. SQL Editor 열기
3. `backend/coupon/database_migration.sql` 파일 내용 복사하여 실행

## 📋 사전 요구사항

### 1. DATABASE_URL 환경 변수 설정

`.env` 파일에 다음을 추가하거나 환경 변수로 설정:

```bash
DATABASE_URL=postgresql://user:password@host:port/database
```

**예시:**
```bash
# 로컬 PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/freeshell

# Supabase
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
```

### 2. 데이터베이스 연결 확인

마이그레이션 실행 전에 데이터베이스 연결이 가능한지 확인하세요.

## 🔍 마이그레이션 내용

다음 테이블과 기능이 생성됩니다:

1. **coupons 테이블**
   - 쿠폰 정보 저장
   - 인덱스: code, is_active, expires_at

2. **coupon_usages 테이블**
   - 쿠폰 사용 내역 저장
   - 인덱스: coupon_id, user_id, used_at

3. **트리거**
   - 쿠폰 코드 자동 대문자 변환

## ✅ 실행 확인

마이그레이션 성공 후 다음 쿼리로 확인:

```sql
-- 테이블 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('coupons', 'coupon_usages');

-- 인덱스 확인
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('coupons', 'coupon_usages');
```

## 🐛 문제 해결

### 오류: "DATABASE_URL 환경 변수가 설정되지 않았습니다"
- `.env` 파일 생성 또는 환경 변수 설정 필요

### 오류: "connection refused" 또는 "could not connect"
- 데이터베이스 서버가 실행 중인지 확인
- DATABASE_URL의 호스트, 포트, 인증 정보 확인

### 오류: "relation already exists"
- 테이블이 이미 존재하는 경우 (정상)
- 스크립트가 자동으로 건너뜀

### 오류: "permission denied"
- 데이터베이스 사용자에게 CREATE TABLE 권한 필요

## 📝 참고

- 마이그레이션은 **멱등성(idempotent)**을 보장합니다
- `CREATE TABLE IF NOT EXISTS` 사용으로 중복 실행 안전
- 기존 데이터는 보존됩니다
