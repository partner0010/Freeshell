# 데이터베이스 설정 안내

## 🚀 빠른 시작

### 1단계: 데이터베이스 선택 및 설정

#### 추천: Supabase (무료, 쉬움)

1. **Supabase 가입**
   - https://supabase.com 접속
   - GitHub 계정으로 가입 (무료)

2. **프로젝트 생성**
   - "New Project" 클릭
   - 프로젝트 이름 입력
   - 데이터베이스 비밀번호 설정 (기억해두세요!)
   - 리전 선택 (가장 가까운 곳)

3. **Connection String 복사**
   - 프로젝트 대시보드에서 Settings > Database
   - "Connection string" 섹션
   - "URI" 탭 선택
   - 문자열 복사 (예: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)

### 2단계: 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성 (없다면):

```env
# 데이터베이스 연결
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"

# 기존 환경 변수들...
GOOGLE_API_KEY=your_key_here
PEXELS_API_KEY=your_key_here
# ... 기타 API 키들
```

**중요**: `[YOUR-PASSWORD]`를 실제 비밀번호로 교체하세요!

### 3단계: 마이그레이션 실행

터미널에서 실행:

```bash
# Prisma Client 생성
npx prisma generate

# 데이터베이스 마이그레이션 (테이블 생성)
npx prisma migrate dev --name init
```

성공하면 다음과 같은 메시지가 표시됩니다:
```
✅ The migration has been applied
```

### 4단계: 확인

```bash
# Prisma Studio 실행 (데이터베이스 GUI)
npx prisma studio
```

브라우저에서 http://localhost:5555 열림
- 테이블들이 생성되었는지 확인
- 데이터 조회/수정 가능

## 🔄 기존 데이터 마이그레이션 (선택사항)

메모리 스토리지에 기존 데이터가 있다면:

1. 데이터 백업
2. 마이그레이션 스크립트 실행 (추후 제공)

## ⚠️ 주의사항

- `.env` 파일은 절대 Git에 커밋하지 마세요!
- 프로덕션 환경에서는 별도의 데이터베이스 사용
- 정기적으로 백업 설정

## 🆘 문제 해결

### 연결 오류
- Connection String 확인
- 비밀번호가 올바른지 확인
- 방화벽 설정 확인 (Supabase는 자동 허용)

### 마이그레이션 오류
- 데이터베이스가 비어있는지 확인
- Prisma 버전 확인: `npx prisma --version`
- `npx prisma migrate reset` (주의: 모든 데이터 삭제)

## 📚 다음 단계

데이터베이스 설정 완료 후:
1. 서비스 레이어를 Prisma로 전환
2. API 테스트
3. 프로덕션 배포

