# 빠른 데이터베이스 설정 가이드

## Supabase에서 Connection String 가져오기

### 1단계: Settings 접근
1. Supabase 대시보드 왼쪽 사이드바 맨 아래 **Settings** 클릭
2. **Database** 메뉴 클릭

### 2단계: Connection String 복사
1. **Connection string** 섹션 찾기
2. **URI** 탭 선택
3. **Connection string** 복사
   - 예시: `postgresql://postgres.yrpjsdyqgdwgueqrvshp:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`

### 3단계: 비밀번호 확인
- Connection string에 `[YOUR-PASSWORD]`가 있다면:
  - 프로젝트 생성 시 설정한 데이터베이스 비밀번호로 교체
- 또는 Supabase에서 비밀번호 재설정:
  - Settings > Database > Database password > Reset database password

### 4단계: .env 파일 설정

프로젝트 루트에 `.env` 파일 생성 (또는 기존 파일에 추가):

```env
# Supabase 데이터베이스 연결
DATABASE_URL="postgresql://postgres.yrpjsdyqgdwgueqrvshp:실제비밀번호@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"

# 기존 API 키들 (이미 있다면 유지)
GOOGLE_API_KEY=your_key_here
PEXELS_API_KEY=your_key_here
# ... 기타 키들
```

**중요**: 
- `실제비밀번호` 부분을 실제 데이터베이스 비밀번호로 교체
- 따옴표 안에 전체 문자열 넣기

### 5단계: 마이그레이션 실행

방법 1: 자동 스크립트 실행
```bash
setup-database.bat
```

방법 2: 수동 실행
```bash
# Prisma Client 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma migrate dev --name init
```

### 6단계: 확인

```bash
# Prisma Studio 실행 (데이터베이스 GUI)
npx prisma studio
```

브라우저에서 http://localhost:5555 열림
- 테이블들이 생성되었는지 확인
- users, projects, payments, ai_step_results 테이블 확인

## 문제 해결

### 연결 오류가 발생하면:
1. Connection String 확인
   - 비밀번호가 올바른지 확인
   - `[YOUR-PASSWORD]` 부분이 실제 비밀번호로 교체되었는지 확인

2. Supabase 프로젝트 상태 확인
   - 대시보드에서 프로젝트가 활성 상태인지 확인
   - "Project Status"가 초록색인지 확인

3. 방화벽 확인
   - Supabase는 기본적으로 모든 IP 허용
   - 특별한 설정 불필요

### 마이그레이션 오류가 발생하면:
```bash
# 마이그레이션 상태 확인
npx prisma migrate status

# 마이그레이션 리셋 (주의: 모든 데이터 삭제)
npx prisma migrate reset
```

## 다음 단계

데이터베이스 설정 완료 후:
1. 서비스 레이어를 Prisma로 전환
2. API 테스트
3. 프로덕션 배포

