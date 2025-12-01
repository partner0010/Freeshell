# Railway 배포 가이드 (서버 없이 배포)

## 🚀 Railway란?

**Railway**는 서버 관리 없이 애플리케이션을 배포할 수 있는 플랫폼입니다.

**장점**:
- ✅ 서버 관리 불필요
- ✅ Docker 지원 (FFmpeg 사용 가능)
- ✅ Redis 자동 제공
- ✅ 파일 저장소 제공
- ✅ 자동 배포 (GitHub 연동)
- ✅ 무료 크레딧 제공 ($5/월)

**가격**: $5/월 (무료 크레딧 포함)

---

## 📋 배포 전 준비

### 1. Railway 계정 생성

1. **Railway 웹사이트 접속**: https://railway.app/
2. **"Start a New Project" 클릭**
3. **GitHub로 로그인** (또는 이메일)
4. **무료 플랜 선택**

### 2. GitHub 저장소 준비

프로젝트를 GitHub에 푸시:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

---

## 🚀 배포 방법

### 방법 1: Railway CLI (권장)

#### 1단계: Railway CLI 설치

```bash
# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex

# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh
```

#### 2단계: 로그인

```bash
railway login
```

#### 3단계: 프로젝트 초기화

```bash
cd backend
railway init
```

#### 4단계: 환경 변수 설정

```bash
railway variables set OPENAI_API_KEY=sk-your-key-here
railway variables set REDIS_URL=${{Redis.REDIS_URL}}
railway variables set DATABASE_URL=file:./data/database.db
```

#### 5단계: 배포

```bash
railway up
```

**끝!** 자동으로 배포됩니다.

---

### 방법 2: Railway 웹 대시보드

#### 1단계: 새 프로젝트 생성

1. Railway 대시보드에서 **"New Project"** 클릭
2. **"Deploy from GitHub repo"** 선택
3. GitHub 저장소 선택

#### 2단계: 설정

1. **Root Directory**: `backend` 설정
2. **Build Command**: `npm run build`
3. **Start Command**: `npm start`

#### 3단계: 환경 변수 설정

Railway 대시보드에서:
- `OPENAI_API_KEY`: API 키 입력
- `REDIS_URL`: Redis 서비스 자동 연결
- `DATABASE_URL`: `file:./data/database.db`
- `PORT`: `3001` (자동 설정됨)

#### 4단계: Redis 추가

1. **"New" → "Database" → "Add Redis"** 클릭
2. 자동으로 `REDIS_URL` 환경 변수 설정됨

#### 5단계: 배포

자동으로 배포 시작됩니다!

---

## 🐳 Docker 사용 (FFmpeg 포함)

### Dockerfile 생성

`backend/Dockerfile` 파일이 이미 있습니다:

```dockerfile
FROM node:20-slim

# FFmpeg 설치
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

### Railway에서 Docker 사용

1. Railway 대시보드에서 프로젝트 선택
2. **Settings → Build → Dockerfile Path**: `backend/Dockerfile`
3. 자동 배포

---

## ⚙️ 환경 변수 설정

Railway 대시보드에서 다음 환경 변수를 설정:

```env
# 필수
OPENAI_API_KEY=sk-your-key-here
# 또는
CLAUDE_API_KEY=sk-ant-your-key-here

# Redis (자동 설정됨)
REDIS_URL=${{Redis.REDIS_URL}}

# 데이터베이스
DATABASE_URL=file:./data/database.db

# 서버 설정
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app

# 보안 키 (자동 생성 권장)
JWT_SECRET=your-secret-key
API_KEY=your-api-key
ENCRYPTION_KEY=your-encryption-key
```

---

## 📊 Railway vs 서버 비교

| 항목 | Railway | 서버 (VPS) |
|------|---------|-----------|
| **설정 복잡도** | ⭐ 매우 쉬움 | ⭐⭐⭐ 복잡 |
| **서버 관리** | ❌ 불필요 | ✅ 필요 |
| **FFmpeg 지원** | ✅ Docker로 가능 | ✅ 가능 |
| **Redis** | ✅ 자동 제공 | ⚠️ 수동 설치 |
| **자동 배포** | ✅ GitHub 연동 | ⚠️ 스크립트 필요 |
| **비용** | $5/월 | $4.5/월 |
| **확장성** | ✅ 자동 | ⚠️ 수동 |

---

## 🔧 문제 해결

### FFmpeg 오류

Railway에서 Dockerfile을 사용하면 FFmpeg가 자동 설치됩니다.

### Redis 연결 오류

Railway에서 Redis 서비스를 추가하면 자동으로 `REDIS_URL`이 설정됩니다.

### 파일 저장소

Railway는 영구 볼륨을 제공합니다:
1. **Settings → Volumes → Add Volume**
2. 경로: `/app/data`, `/app/uploads`

---

## ✅ 배포 확인

배포 후:
1. Railway 대시보드에서 **"Deployments"** 확인
2. **"View Logs"**로 로그 확인
3. **"Settings → Networking"**에서 공개 URL 확인
4. 헬스 체크: `https://your-app.railway.app/api/health`

---

## 🎯 완료!

**Railway로 서버 없이 배포 완료!** 🚀

- ✅ 서버 관리 불필요
- ✅ 자동 배포
- ✅ FFmpeg 사용 가능
- ✅ Redis 자동 제공

**다음 단계**: 프론트엔드를 Vercel에 배포하면 완전한 서버리스 스택 완성!

