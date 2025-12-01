# 데이터베이스 마이그레이션 가이드

## 📝 데이터베이스 마이그레이션은 로컬에서도 가능합니다!

SQLite를 사용하고 있으므로 **서버가 가동되지 않아도** 로컬에서 마이그레이션을 실행할 수 있습니다.

---

## 🚀 마이그레이션 실행 방법

### 1. 로컬에서 실행 (권장)

#### 방법 1: PowerShell 스크립트 사용 (가장 간단)

```powershell
# 백엔드 디렉토리로 이동
cd backend

# 마이그레이션 스크립트 실행
.\scripts\migrate.ps1
```

#### 방법 2: npm 스크립트 사용

```powershell
# 백엔드 디렉토리로 이동
cd backend

# 환경 변수 설정
$env:DATABASE_URL="file:./data/database.db"

# data 디렉토리 생성 (없는 경우)
if (-not (Test-Path data)) { New-Item -ItemType Directory -Path data -Force }

# Prisma 클라이언트 생성
npm run prisma:generate

# 마이그레이션 실행
npm run prisma:migrate -- --name comprehensive_upgrade
```

#### 방법 3: 직접 명령어 실행

```powershell
# 백엔드 디렉토리로 이동
cd backend

# 환경 변수 설정
$env:DATABASE_URL="file:./data/database.db"

# data 디렉토리 생성 (없는 경우)
if (-not (Test-Path data)) { New-Item -ItemType Directory -Path data -Force }

# Prisma 클라이언트 생성
npx prisma generate

# 마이그레이션 실행
npx prisma migrate dev --name comprehensive_upgrade
```

### 2. 프로덕션 환경에서 실행

```bash
# 프로덕션 마이그레이션
npx prisma migrate deploy
```

---

## 📋 마이그레이션 전 확인사항

### 1. 환경 변수 확인
`.env` 파일에 다음이 설정되어 있는지 확인:
```env
DATABASE_URL="file:./data/database.db"
```

### 2. 데이터 백업 (중요!)
기존 데이터가 있다면 백업:
```bash
# SQLite 데이터베이스 백업
cp backend/data/database.db backend/data/database.db.backup
```

### 3. Prisma 스키마 확인
`backend/prisma/schema.prisma` 파일이 최신인지 확인

---

## 🔄 마이그레이션 과정

1. **Prisma 클라이언트 생성**
   ```bash
   npx prisma generate
   ```
   - TypeScript 타입 생성
   - Prisma Client 생성

2. **마이그레이션 실행**
   ```bash
   npx prisma migrate dev --name comprehensive_upgrade
   ```
   - 데이터베이스 스키마 변경
   - 마이그레이션 파일 생성
   - 데이터베이스 업데이트

3. **확인**
   ```bash
   npx prisma studio
   ```
   - 브라우저에서 데이터베이스 확인

---

## ⚠️ 주의사항

1. **기존 데이터 보존**
   - 기존 데이터는 자동으로 보존됩니다
   - 하지만 백업은 필수!

2. **마이그레이션 실패 시**
   ```bash
   # 마이그레이션 롤백 (개발 환경)
   npx prisma migrate reset
   ```

3. **프로덕션 환경**
   - 프로덕션에서는 `migrate deploy` 사용
   - 데이터 백업 필수!

---

## 📊 추가된 모델

다음 모델들이 추가되었습니다:
- `Schedule` - 스케줄링
- `ScheduleExecution` - 스케줄 실행 기록
- `ContentTemplate` - 템플릿
- `MultiAccount` - 다중 계정
- `Analytics` - 통계
- `ABTest` - A/B 테스트
- `BatchJob` - 배치 작업
- `Notification` - 알림
- `Cache` - 캐시
- `JobQueue` - 작업 큐
- `OAuthToken` - OAuth 토큰 관리
- `CopyrightCheckResult` - 저작권 검사 결과
- `ContentFilterResult` - 콘텐츠 필터링 결과
- `LegalReview` - 법적 검토

---

## ✅ 완료!

마이그레이션 후 서버를 시작하면 모든 새로운 기능을 사용할 수 있습니다!

