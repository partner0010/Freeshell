# Railway 배포 다음 단계 (가입 완료 후)

## ✅ 가입 완료! 다음 단계

Railway 가입을 완료하셨다면, 이제 배포를 진행하세요!

---

## 🚀 빠른 배포 가이드 (5분)

### 방법 1: Railway 웹 대시보드 (가장 쉬움) ⭐⭐⭐⭐⭐

#### 1단계: 새 프로젝트 생성

1. Railway 대시보드 접속: https://railway.app/dashboard
2. **"New Project"** 클릭
3. **"Deploy from GitHub repo"** 선택
4. GitHub 저장소 선택 (또는 새로 생성)

**GitHub 저장소가 없다면?**
```bash
# 로컬에서
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

#### 2단계: 프로젝트 설정

Railway 대시보드에서:

1. **Settings** 탭 클릭
2. **Root Directory**: `backend` 설정
3. **Build Command**: `npm run build`
4. **Start Command**: `npm start`

#### 3단계: Redis 추가

1. **"New"** 버튼 클릭
2. **"Database"** 선택
3. **"Add Redis"** 클릭
4. 자동으로 `REDIS_URL` 환경 변수 설정됨 ✅

#### 4단계: 환경 변수 설정

**Variables** 탭에서 다음 환경 변수 추가:

```env
# 필수
OPENAI_API_KEY=sk-your-key-here
# 또는
CLAUDE_API_KEY=sk-ant-your-key-here

# 데이터베이스
DATABASE_URL=file:./data/database.db

# 서버 설정
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app

# 보안 키 (자동 생성 권장)
JWT_SECRET=your-secret-key-here
API_KEY=your-api-key-here
ENCRYPTION_KEY=your-encryption-key-here
```

**보안 키 자동 생성 방법**:
```bash
# 로컬에서 실행
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 5단계: 배포 시작

1. **"Deploy"** 버튼 클릭
2. 자동으로 빌드 및 배포 시작
3. 배포 완료까지 5-10분 소요

#### 6단계: 배포 확인

1. **"Deployments"** 탭에서 배포 상태 확인
2. **"View Logs"**로 로그 확인
3. **"Settings → Networking"**에서 공개 URL 확인
4. 헬스 체크: `https://your-app.railway.app/api/health`

---

## 🔧 방법 2: Railway CLI (고급)

### 1단계: Railway CLI 설치

```bash
# Windows (PowerShell - 관리자 권한)
iwr https://railway.app/install.ps1 | iex

# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh
```

### 2단계: 로그인

```bash
railway login
```

브라우저가 열리면 Railway 계정으로 로그인

### 3단계: 프로젝트 초기화

```bash
cd backend
railway init
```

프로젝트 이름 입력 (예: `all-in-one-content-ai`)

### 4단계: 환경 변수 설정

```bash
# AI API 키
railway variables set OPENAI_API_KEY=sk-your-key-here

# Redis (자동 연결)
railway variables set REDIS_URL=${{Redis.REDIS_URL}}

# 데이터베이스
railway variables set DATABASE_URL=file:./data/database.db

# 서버 설정
railway variables set PORT=3001
railway variables set NODE_ENV=production
```

### 5단계: Redis 추가

```bash
railway add redis
```

### 6단계: 배포

```bash
railway up
```

**끝!** 자동으로 배포됩니다.

---

## 📋 배포 후 확인 사항

### 1. 헬스 체크

```bash
curl https://your-app.railway.app/api/health
```

**예상 응답**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. 로그 확인

Railway 대시보드에서:
1. **"Deployments"** 탭
2. 최신 배포 클릭
3. **"View Logs"** 클릭

### 3. 환경 변수 확인

**Variables** 탭에서 모든 환경 변수가 설정되었는지 확인

---

## ⚠️ 문제 해결

### 배포 실패

**원인**: 빌드 오류, 환경 변수 누락

**해결**:
1. 로그 확인: **"View Logs"**에서 오류 메시지 확인
2. 환경 변수 확인: 필수 변수가 모두 설정되었는지 확인
3. 빌드 명령 확인: `npm run build`가 정상 작동하는지 확인

### Redis 연결 실패

**원인**: Redis 서비스가 추가되지 않음

**해결**:
1. **"New" → "Database" → "Add Redis"** 클릭
2. `REDIS_URL` 환경 변수 자동 설정 확인

### FFmpeg 오류

**원인**: Dockerfile에 FFmpeg 설치가 없음

**해결**: `backend/Dockerfile` 확인 (이미 FFmpeg 포함됨)

---

## 🎯 다음 단계

### 1. 프론트엔드 배포 (Vercel)

```bash
# Vercel CLI 설치
npm i -g vercel

# 프론트엔드 디렉토리에서
cd ..
vercel

# 환경 변수 설정
VITE_API_BASE_URL=https://your-app.railway.app/api
```

### 2. 도메인 연결 (선택)

Railway 대시보드에서:
1. **Settings → Networking**
2. **"Generate Domain"** 클릭
3. 또는 커스텀 도메인 추가

---

## ✅ 완료!

**Railway 배포 완료!** 🎉

이제 서버 없이 프로그램이 실행됩니다!

**다음**: 프론트엔드를 Vercel에 배포하면 완전한 서버리스 스택 완성!

