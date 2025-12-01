# Railway 빠른 시작 가이드 (가입 완료 후)

## ✅ 가입 완료! 이제 배포하세요

Railway 가입을 완료하셨다면, 다음 단계를 따라하세요!

---

## 🚀 5분 배포 가이드

### 1단계: GitHub 저장소 준비

**GitHub 저장소가 없다면:**

```bash
# 로컬에서
git init
git add .
git commit -m "Initial commit"
git branch -M main

# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

**GitHub 저장소가 있다면:**
- 이미 준비 완료! 다음 단계로

---

### 2단계: Railway에서 프로젝트 생성

1. **Railway 대시보드 접속**: https://railway.app/dashboard
2. **"New Project"** 클릭
3. **"Deploy from GitHub repo"** 선택
4. GitHub 저장소 선택
5. **"Deploy Now"** 클릭

---

### 3단계: 프로젝트 설정

Railway 대시보드에서 프로젝트 선택 후:

1. **Settings** 탭 클릭
2. **Root Directory**: `backend` 입력
3. **Build Command**: `npm run build` 입력
4. **Start Command**: `npm start` 입력
5. **Save** 클릭

---

### 4단계: Redis 추가

1. **"New"** 버튼 클릭
2. **"Database"** 선택
3. **"Add Redis"** 클릭
4. 자동으로 `REDIS_URL` 환경 변수 설정됨 ✅

---

### 5단계: 환경 변수 설정

**Variables** 탭에서 다음 환경 변수 추가:

#### 필수 환경 변수

```env
# AI API 키 (최소 하나 필수)
OPENAI_API_KEY=sk-your-key-here
# 또는
CLAUDE_API_KEY=sk-ant-your-key-here

# 데이터베이스
DATABASE_URL=file:./data/database.db

# Redis (자동 설정됨 - 수정 불필요)
REDIS_URL=${{Redis.REDIS_URL}}

# 서버 설정
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app

# 보안 키 (자동 생성 권장)
JWT_SECRET=your-32-character-secret-key-here
API_KEY=your-32-character-api-key-here
ENCRYPTION_KEY=your-32-character-encryption-key-here
```

#### 보안 키 자동 생성 방법

**Windows (PowerShell)**:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**macOS/Linux**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

각 명령을 3번 실행하여 `JWT_SECRET`, `API_KEY`, `ENCRYPTION_KEY` 생성

---

### 6단계: 배포 확인

1. **"Deployments"** 탭에서 배포 상태 확인
2. **"View Logs"**로 로그 확인
3. 배포 완료까지 5-10분 소요

---

### 7단계: 공개 URL 확인

1. **Settings → Networking** 탭
2. **"Generate Domain"** 클릭
3. 공개 URL 확인 (예: `https://your-app.railway.app`)

---

### 8단계: 헬스 체크

브라우저에서 또는 curl로:

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

---

## ✅ 완료!

**Railway 배포 완료!** 🎉

이제 서버 없이 프로그램이 실행됩니다!

**공개 URL**: `https://your-app.railway.app`
**API 엔드포인트**: `https://your-app.railway.app/api`

---

## 🔧 문제 해결

### 배포 실패

**확인 사항**:
1. 로그 확인: **"View Logs"**에서 오류 메시지 확인
2. 환경 변수: 필수 변수가 모두 설정되었는지 확인
3. Root Directory: `backend`로 설정되었는지 확인

### Redis 연결 실패

**해결**:
1. Redis 서비스가 추가되었는지 확인
2. `REDIS_URL` 환경 변수가 자동 설정되었는지 확인

### FFmpeg 오류

**해결**: 
- Dockerfile에 FFmpeg 포함되어 있음
- Railway가 자동으로 Docker 사용

---

## 📝 다음 단계

### 프론트엔드 배포 (Vercel)

```bash
# Vercel CLI 설치
npm i -g vercel

# 프론트엔드 디렉토리에서
cd ..
vercel

# 환경 변수 설정
VITE_API_BASE_URL=https://your-app.railway.app/api
```

---

## 🎯 완료!

**이제 서버 없이 완전 자동화된 배포가 완료되었습니다!** 🚀

- ✅ Railway 배포 완료
- ✅ Redis 자동 연결
- ✅ 환경 변수 설정 완료
- ✅ 헬스 체크 통과

**다음**: 프론트엔드를 Vercel에 배포하면 완전한 서버리스 스택 완성!

