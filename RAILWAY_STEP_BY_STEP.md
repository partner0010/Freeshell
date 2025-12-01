# Railway 단계별 배포 가이드 (화면별 설명)

## 🎯 현재 위치: Railway 워크스페이스

워크스페이스에 들어와 있다면, 다음 단계를 따라하세요!

---

## 📋 1단계: 새 프로젝트 생성

### 화면에서 보이는 것:
- "New Project" 버튼 또는 "+" 버튼
- 또는 빈 화면에 "Create your first project" 메시지

### 해야 할 일:

1. **"New Project"** 버튼 클릭
   - 또는 화면 중앙의 큰 버튼 클릭

2. **"Deploy from GitHub repo"** 선택
   - 여러 옵션이 나타남:
     - "Deploy from GitHub repo" ← **이것 선택!**
     - "Empty Project"
     - "Deploy a template"

3. **GitHub 저장소 선택**
   - GitHub 계정 연동 (처음이면)
   - 저장소 목록에서 선택
   - **또는 저장소가 없다면**:
     - "Create a new repository" 클릭
     - 저장소 이름 입력
     - "Create and Deploy" 클릭

---

## 📋 2단계: 프로젝트 설정 (중요!)

### 화면: 프로젝트 대시보드

프로젝트가 생성되면 다음 화면이 보입니다:
- 왼쪽: 서비스 목록
- 중앙: 배포 상태
- 오른쪽: 설정 메뉴

### 해야 할 일:

#### A. Settings 탭 클릭

1. 왼쪽 상단 또는 오른쪽에 **"Settings"** 탭 클릭

2. **"Service"** 섹션에서:

   **Root Directory** 입력:
   ```
   backend
   ```

   **Build Command** 입력:
   ```
   npm run build
   ```

   **Start Command** 입력:
   ```
   npm start
   ```

3. **"Save"** 버튼 클릭

---

## 📋 3단계: Redis 추가

### 화면: 프로젝트 대시보드

### 해야 할 일:

1. **"New"** 버튼 클릭
   - 왼쪽 상단 또는 중앙에 있음

2. **"Database"** 선택
   - 드롭다운 메뉴에서 선택

3. **"Add Redis"** 클릭
   - Redis 옵션 선택

4. **자동 설정 확인**
   - Redis 서비스가 추가됨
   - `REDIS_URL` 환경 변수가 자동으로 설정됨 ✅

---

## 📋 4단계: 환경 변수 설정

### 화면: 프로젝트 Settings

### 해야 할 일:

1. **"Variables"** 탭 클릭
   - Settings 페이지 내에 있음

2. **"New Variable"** 버튼 클릭

3. **다음 환경 변수들을 하나씩 추가:**

   **변수 1:**
   - Name: `OPENAI_API_KEY`
   - Value: `sk-your-actual-key-here`
   - **"Add"** 클릭

   **변수 2:**
   - Name: `DATABASE_URL`
   - Value: `file:./data/database.db`
   - **"Add"** 클릭

   **변수 3:**
   - Name: `PORT`
   - Value: `3001`
   - **"Add"** 클릭

   **변수 4:**
   - Name: `NODE_ENV`
   - Value: `production`
   - **"Add"** 클릭

   **변수 5: 보안 키 생성**

   **Windows PowerShell에서:**
   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   
   이 명령을 3번 실행하여 3개의 키 생성:
   - `JWT_SECRET` = 첫 번째 키
   - `API_KEY` = 두 번째 키
   - `ENCRYPTION_KEY` = 세 번째 키

   각각 Railway에 추가:
   - Name: `JWT_SECRET`
   - Value: (생성된 첫 번째 키)
   - **"Add"** 클릭

   - Name: `API_KEY`
   - Value: (생성된 두 번째 키)
   - **"Add"** 클릭

   - Name: `ENCRYPTION_KEY`
   - Value: (생성된 세 번째 키)
   - **"Add"** 클릭

---

## 📋 5단계: 배포 시작

### 화면: 프로젝트 대시보드

### 해야 할 일:

1. **"Deployments"** 탭 클릭
   - 또는 자동으로 배포가 시작됨

2. **배포 상태 확인**
   - "Building..." → "Deploying..." → "Active"
   - 5-10분 소요

3. **"View Logs"** 클릭하여 로그 확인
   - 오류가 있으면 여기서 확인

---

## 📋 6단계: 공개 URL 확인

### 화면: 프로젝트 Settings

### 해야 할 일:

1. **"Networking"** 탭 클릭
   - Settings 페이지 내에 있음

2. **"Generate Domain"** 클릭
   - 또는 "Custom Domain" 추가

3. **공개 URL 확인**
   - 예: `https://your-app.railway.app`

---

## 📋 7단계: 헬스 체크

### 브라우저에서:

1. 공개 URL + `/api/health` 접속
   - 예: `https://your-app.railway.app/api/health`

2. **예상 응답:**
   ```json
   {
     "status": "ok",
     "timestamp": "2024-01-01T00:00:00.000Z"
   }
   ```

3. **이 응답이 보이면 성공!** ✅

---

## ⚠️ 문제 해결

### 배포가 실패하는 경우

1. **"View Logs"** 클릭
2. 오류 메시지 확인
3. 일반적인 오류:
   - "Module not found" → 의존성 설치 문제
   - "Port already in use" → PORT 환경 변수 확인
   - "Database error" → DATABASE_URL 확인

### 환경 변수가 적용되지 않는 경우

1. **Variables** 탭에서 변수가 있는지 확인
2. **"Redeploy"** 버튼 클릭하여 재배포

### Redis 연결 실패

1. Redis 서비스가 추가되었는지 확인
2. `REDIS_URL` 환경 변수가 자동 설정되었는지 확인
3. Redis 서비스가 "Active" 상태인지 확인

---

## 🎯 빠른 체크리스트

배포 전 확인:

- [ ] GitHub 저장소에 코드가 푸시되어 있음
- [ ] Railway에서 GitHub 저장소 선택 완료
- [ ] Root Directory: `backend` 설정
- [ ] Build Command: `npm run build` 설정
- [ ] Start Command: `npm start` 설정
- [ ] Redis 서비스 추가 완료
- [ ] 환경 변수 모두 설정 완료
- [ ] 배포 시작됨
- [ ] 헬스 체크 통과

---

## ✅ 완료!

**모든 단계를 완료하면 배포가 완료됩니다!**

**공개 URL**: `https://your-app.railway.app`
**API 엔드포인트**: `https://your-app.railway.app/api`

**다음**: 프론트엔드를 Vercel에 배포하면 완전한 스택 완성!

