# 🚀 Freeshell 프로젝트 설정 가이드

## ✅ 완료된 작업
1. ✅ Git 저장소 초기화
2. ✅ GitHub 원격 저장소 연결
3. ✅ 첫 커밋 및 푸시
4. ✅ .env 파일 생성

## 📋 다음 단계

### 1. PowerShell 실행 정책 설정 (필요한 경우)

PowerShell을 **관리자 권한**으로 실행하고 다음 명령어를 입력하세요:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

또는 **일시적으로** 정책을 우회하려면:
```powershell
powershell -ExecutionPolicy Bypass -File .\backend\scripts\setup-local.ps1
```

### 2. 백엔드 설정

#### 방법 A: PowerShell 스크립트 사용 (권장)
```powershell
cd backend
powershell -ExecutionPolicy Bypass -File .\scripts\setup-local.ps1
```

#### 방법 B: 수동 설정
```powershell
cd backend

# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma migrate dev --name init

# 또는 CMD 사용
cmd /c "npx prisma generate"
cmd /c "npx prisma migrate dev --name init"
```

### 3. 환경 변수 설정

`backend/.env` 파일을 열어서 다음 항목들을 설정하세요:

**필수 항목:**
- `OPENAI_API_KEY` 또는 `CLAUDE_API_KEY` (최소 하나는 필요)
  - OpenAI: https://platform.openai.com/api-keys
  - Claude: https://console.anthropic.com/

**선택 항목 (기능 사용 시):**
- `YOUTUBE_CLIENT_ID` / `YOUTUBE_CLIENT_SECRET` (YouTube 업로드)
- `JWT_SECRET` (프로덕션에서는 반드시 변경!)

### 4. 백엔드 서버 실행

```powershell
cd backend
npm run dev
```

또는 CMD 사용:
```cmd
cd backend
npm.cmd run dev
```

서버가 `http://localhost:3001`에서 실행됩니다.

### 5. 프론트엔드 설정 (선택)

```powershell
# 루트 디렉토리에서
npm install
npm run dev
```

프론트엔드가 `http://localhost:3000`에서 실행됩니다.

## 🔍 문제 해결

### PowerShell 실행 정책 오류
- **해결 1**: 관리자 권한으로 PowerShell 실행 후 `Set-ExecutionPolicy RemoteSigned`
- **해결 2**: CMD 사용 (`cmd /c "명령어"`)
- **해결 3**: 각 명령어를 개별적으로 실행

### npm 명령어 오류
- `npm.cmd` 사용 (예: `npm.cmd run dev`)
- 또는 CMD에서 실행

### 데이터베이스 오류
- `backend/data` 폴더가 생성되었는지 확인
- `.env` 파일의 `DATABASE_URL` 확인

## 📚 추가 리소스

- 백엔드 README: `backend/README.md`
- CI/CD 설정: `.github/workflows/ci-cd.yml`
- Prisma 스키마: `backend/prisma/schema.prisma`

## 🎯 빠른 시작 체크리스트

- [ ] PowerShell 실행 정책 설정 (또는 CMD 사용)
- [ ] `backend/.env` 파일에 API 키 설정
- [ ] Prisma 클라이언트 생성 (`npx prisma generate`)
- [ ] 데이터베이스 마이그레이션 (`npx prisma migrate dev`)
- [ ] 백엔드 서버 실행 (`npm run dev`)
- [ ] 브라우저에서 `http://localhost:3001/api/health` 확인

## 💡 팁

1. **API 키 없이 테스트**: 일부 기능은 API 키 없이도 작동합니다 (예: Health Check)
2. **데이터베이스**: SQLite를 사용하므로 별도 설치 불필요
3. **개발 모드**: `npm run dev`는 자동 재시작 기능이 있습니다

