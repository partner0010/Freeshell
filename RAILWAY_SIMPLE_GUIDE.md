# Railway 초간단 가이드 (한눈에 보기)

## 🎯 지금 Railway 워크스페이스에 있다면?

### 1️⃣ 프로젝트 만들기

**화면에서:**
- **"New Project"** 버튼 클릭
- **"Deploy from GitHub repo"** 선택
- GitHub 저장소 선택 (없으면 만들기)
- **"Deploy"** 클릭

---

### 2️⃣ 설정 변경 (중요!)

**프로젝트 화면에서:**

1. **"Settings"** 탭 클릭
2. **"Service"** 섹션에서:
   - **Root Directory**: `backend` 입력
   - **Build Command**: `npm run build` 입력
   - **Start Command**: `npm start` 입력
3. **"Save"** 클릭

---

### 3️⃣ Redis 추가

1. **"New"** 버튼 클릭 (왼쪽 상단)
2. **"Database"** 선택
3. **"Add Redis"** 클릭
4. 끝! (자동 설정됨)

---

### 4️⃣ 환경 변수 추가

1. **"Settings"** → **"Variables"** 탭 클릭
2. **"New Variable"** 버튼 클릭
3. 다음 변수들을 하나씩 추가:

```
변수명: OPENAI_API_KEY
값: sk-your-key-here
[Add]

변수명: DATABASE_URL
값: file:./data/database.db
[Add]

변수명: PORT
값: 3001
[Add]

변수명: NODE_ENV
값: production
[Add]

변수명: JWT_SECRET
값: (PowerShell에서 생성 - 아래 참고)
[Add]

변수명: API_KEY
값: (PowerShell에서 생성 - 아래 참고)
[Add]

변수명: ENCRYPTION_KEY
값: (PowerShell에서 생성 - 아래 참고)
[Add]
```

**보안 키 생성 (PowerShell):**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
이 명령을 3번 실행하여 3개 키 생성

---

### 5️⃣ 배포 확인

1. **"Deployments"** 탭 클릭
2. 배포 상태 확인 (5-10분 소요)
3. **"View Logs"** 클릭하여 로그 확인
4. 상태가 **"Active"**가 되면 성공!

---

### 6️⃣ 공개 URL 확인

1. **"Settings"** → **"Networking"** 탭 클릭
2. **"Generate Domain"** 클릭
3. 공개 URL 확인 (예: `https://your-app.railway.app`)

---

### 7️⃣ 테스트

브라우저에서:
```
https://your-app.railway.app/api/health
```

**응답이 보이면 성공!** ✅

---

## ⚠️ 문제가 생기면?

### 배포 실패
- **"View Logs"** 클릭하여 오류 확인
- 환경 변수가 모두 설정되었는지 확인

### Redis 안 보임
- **"New"** → **"Database"** → **"Add Redis"**

### 환경 변수 안 먹힘
- **"Redeploy"** 버튼 클릭하여 재배포

---

## ✅ 완료!

**이제 서버 없이 프로그램이 실행됩니다!**

**공개 URL**: `https://your-app.railway.app`

