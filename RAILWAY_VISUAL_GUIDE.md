# Railway 화면별 가이드 (스크린샷 없이 이해하기)

## 🖥️ 현재 화면: Railway 워크스페이스

### 화면 구성:
```
┌─────────────────────────────────────┐
│  Railway                            │
│  [워크스페이스 이름]                 │
├─────────────────────────────────────┤
│                                     │
│  [New Project]  [+ 버튼]           │
│                                     │
│  또는                               │
│                                     │
│  [프로젝트 목록]                    │
│  - 프로젝트 1                       │
│  - 프로젝트 2                       │
│                                     │
└─────────────────────────────────────┘
```

---

## 📍 상황별 가이드

### 상황 1: "New Project" 버튼이 보임

**해야 할 일:**

1. **"New Project"** 클릭
2. **"Deploy from GitHub repo"** 선택
3. GitHub 저장소 선택
4. **"Deploy"** 클릭

---

### 상황 2: 프로젝트가 이미 생성됨

**화면 구성:**
```
┌─────────────────────────────────────┐
│  [프로젝트 이름]                    │
├─────────────────────────────────────┤
│  [Deployments] [Settings] [Metrics] │
├─────────────────────────────────────┤
│  서비스 목록:                        │
│  - Web Service (배포 중...)         │
│  - Redis (Active)                   │
│                                     │
│  배포 상태: [Building...]           │
└─────────────────────────────────────┘
```

**해야 할 일:**

#### A. Settings 클릭

1. **"Settings"** 탭 클릭
2. **"Service"** 섹션 찾기
3. 다음 값 입력:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. **"Save"** 클릭

#### B. Variables 클릭

1. **"Variables"** 탭 클릭
2. **"New Variable"** 버튼 클릭
3. 환경 변수 추가 (아래 참고)

#### C. Redis 추가 (없다면)

1. 왼쪽 상단 **"New"** 버튼 클릭
2. **"Database"** 선택
3. **"Add Redis"** 클릭

---

## 🔧 환경 변수 추가 방법

### Variables 탭 화면:
```
┌─────────────────────────────────────┐
│  Variables                          │
├─────────────────────────────────────┤
│  [New Variable]                     │
├─────────────────────────────────────┤
│  Name: [입력]                        │
│  Value: [입력]                      │
│  [Add] [Cancel]                     │
└─────────────────────────────────────┘
```

### 추가할 환경 변수:

**1. OPENAI_API_KEY**
- Name: `OPENAI_API_KEY`
- Value: `sk-your-actual-key-here`
- [Add] 클릭

**2. DATABASE_URL**
- Name: `DATABASE_URL`
- Value: `file:./data/database.db`
- [Add] 클릭

**3. PORT**
- Name: `PORT`
- Value: `3001`
- [Add] 클릭

**4. NODE_ENV**
- Name: `NODE_ENV`
- Value: `production`
- [Add] 클릭

**5. 보안 키들**

PowerShell에서 실행:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

이 명령을 3번 실행하여 3개 키 생성 후 각각 추가:
- `JWT_SECRET` = 첫 번째 키
- `API_KEY` = 두 번째 키  
- `ENCRYPTION_KEY` = 세 번째 키

---

## 🚀 배포 확인

### Deployments 탭 화면:
```
┌─────────────────────────────────────┐
│  Deployments                        │
├─────────────────────────────────────┤
│  [배포 목록]                         │
│  - #1 [Active] [View Logs]         │
│  - #2 [Failed] [View Logs]         │
│                                     │
│  상태: Building... / Active         │
└─────────────────────────────────────┘
```

**해야 할 일:**

1. **"Deployments"** 탭 클릭
2. 최신 배포 클릭
3. **"View Logs"** 클릭하여 로그 확인
4. 상태가 **"Active"**가 되면 성공!

---

## 🌐 공개 URL 확인

### Networking 탭 화면:
```
┌─────────────────────────────────────┐
│  Networking                         │
├─────────────────────────────────────┤
│  Public Domain:                     │
│  [Generate Domain]                  │
│                                     │
│  또는                               │
│                                     │
│  https://your-app.railway.app       │
│  [Copy] [Settings]                  │
└─────────────────────────────────────┘
```

**해야 할 일:**

1. **Settings → Networking** 탭 클릭
2. **"Generate Domain"** 클릭
3. 공개 URL 확인
4. 브라우저에서 `https://your-app.railway.app/api/health` 접속
5. JSON 응답이 보이면 성공! ✅

---

## ❓ 자주 묻는 질문

### Q: "New Project" 버튼이 안 보여요

**A**: 이미 프로젝트가 있을 수 있습니다. 프로젝트 목록을 확인하세요.

### Q: GitHub 저장소가 안 보여요

**A**: 
1. GitHub 계정 연동 확인
2. 저장소가 GitHub에 푸시되어 있는지 확인
3. 저장소 권한 확인

### Q: 배포가 계속 실패해요

**A**:
1. **"View Logs"**에서 오류 확인
2. 환경 변수가 모두 설정되었는지 확인
3. Root Directory가 `backend`로 설정되었는지 확인

### Q: Redis가 안 보여요

**A**:
1. **"New"** 버튼 클릭
2. **"Database"** 선택
3. **"Add Redis"** 클릭

---

## 🎯 간단 요약

1. **"New Project"** → **"Deploy from GitHub repo"** → 저장소 선택
2. **Settings** → Root Directory: `backend` 설정
3. **"New"** → **"Database"** → **"Add Redis"**
4. **Variables** → 환경 변수 추가
5. 배포 완료 대기 (5-10분)
6. **Networking** → 공개 URL 확인
7. 헬스 체크: `https://your-app.railway.app/api/health`

---

## ✅ 완료!

**이제 Railway 배포가 완료됩니다!**

문제가 있으면 **"View Logs"**에서 오류를 확인하세요!

