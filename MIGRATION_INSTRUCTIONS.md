# 데이터베이스 마이그레이션 실행 가이드

## ✅ 준비 완료 사항

1. ✅ Prisma 스키마 업데이트 완료
   - 법적 준수 모델 추가 (OAuthToken, CopyrightCheckResult, ContentFilterResult, LegalReview)
   - 모든 새로운 기능 모델 포함

2. ✅ 마이그레이션 스크립트 생성 완료
   - `backend/scripts/migrate.ps1` 파일 생성

## 🚀 마이그레이션 실행 방법

### 방법 1: PowerShell 스크립트 사용 (권장)

1. **프로젝트 루트 디렉토리에서 PowerShell 열기**

2. **다음 명령어 실행:**
```powershell
cd backend
.\scripts\migrate.ps1
```

### 방법 2: 수동 실행

1. **백엔드 디렉토리로 이동:**
```powershell
cd backend
```

2. **환경 변수 설정:**
```powershell
$env:DATABASE_URL="file:./data/database.db"
```

3. **data 디렉토리 생성 (없는 경우):**
```powershell
if (-not (Test-Path data)) { New-Item -ItemType Directory -Path data -Force }
```

4. **Prisma 클라이언트 생성:**
```powershell
npx prisma generate
```

5. **마이그레이션 실행:**
```powershell
npx prisma migrate dev --name comprehensive_upgrade
```

### 방법 3: npm 스크립트 사용

```powershell
cd backend
$env:DATABASE_URL="file:./data/database.db"
if (-not (Test-Path data)) { New-Item -ItemType Directory -Path data -Force }
npm run prisma:generate
npm run prisma:migrate -- --name comprehensive_upgrade
```

## 📋 마이그레이션 후 확인

마이그레이션이 성공적으로 완료되면:

1. **데이터베이스 파일 생성 확인:**
   - `backend/data/database.db` 파일이 생성되었는지 확인

2. **Prisma Studio로 확인 (선택사항):**
```powershell
cd backend
npx prisma studio
```
   - 브라우저에서 데이터베이스 구조 확인 가능

## ⚠️ 주의사항

1. **기존 데이터 백업:**
   - 기존 데이터베이스가 있다면 백업 필수:
   ```powershell
   Copy-Item backend\data\database.db backend\data\database.db.backup
   ```

2. **환경 변수:**
   - `.env` 파일이 없어도 마이그레이션은 실행 가능합니다
   - 환경 변수를 직접 설정하면 됩니다

3. **오류 발생 시:**
   - 마이그레이션 실패 시 다음 명령어로 롤백 가능:
   ```powershell
   npx prisma migrate reset
   ```

## ✅ 완료 확인

마이그레이션이 성공하면 다음 메시지가 표시됩니다:
- ✅ Prisma 클라이언트 생성 완료
- ✅ 마이그레이션 완료
- 🎉 모든 작업이 완료되었습니다!

## 📊 추가된 모델

다음 모델들이 데이터베이스에 추가됩니다:
- `OAuthToken` - OAuth 토큰 관리
- `CopyrightCheckResult` - 저작권 검사 결과
- `ContentFilterResult` - 콘텐츠 필터링 결과
- `LegalReview` - 법적 검토

기존 모델들도 모두 포함되어 있습니다.

