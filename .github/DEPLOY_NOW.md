# 🚀 지금 바로 배포하기!

**CLI가 설치되었습니다!** ✅  
**이제 사용자님이 직접 실행하세요!** 

---

## 📋 **1단계: Railway 백엔드 배포**

### 터미널 1 (새 PowerShell)
```powershell
# Railway 로그인 (브라우저가 열립니다)
railway login
# → Y 입력하고 브라우저에서 GitHub 로그인

# 백엔드 디렉토리로 이동
cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell\backend"

# Railway 프로젝트 초기화
railway init
# → "Create a new project" 선택
# → 프로젝트 이름: freeshell-backend

# 배포!
railway up
# → 자동으로 배포됩니다 (약 2-3분)

# 도메인 설정
railway domain
# → 생성된 도메인을 복사해두세요 (예: freeshell-backend.up.railway.app)
```

### Railway 대시보드에서 환경 변수 설정
```
1. https://railway.app 접속
2. 프로젝트 클릭
3. Variables 탭 클릭
4. 다음 변수 추가:

NODE_ENV=production
PORT=3001
FRONTEND_URL=https://freeshell.co.kr
JWT_SECRET=YOUR_RANDOM_STRING_HERE
OPENAI_API_KEY=YOUR_KEY_HERE
```

**JWT_SECRET 생성**:
```powershell
# PowerShell에서 실행
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### PostgreSQL 추가
```
1. Railway 대시보드에서 "New" 클릭
2. "Database" → "PostgreSQL" 선택
3. DATABASE_URL이 자동으로 연결됩니다!
```

---

## 📋 **2단계: Vercel 프론트엔드 배포**

### 터미널 2 (새 PowerShell)
```powershell
# Vercel 로그인 (브라우저가 열립니다)
vercel login
# → 브라우저에서 GitHub 로그인

# 프로젝트 디렉토리로 이동
cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell"

# 배포!
vercel --prod

# 질문에 답변:
# Set up and deploy? Y
# Which scope? (본인 계정 선택)
# Link to existing project? N
# Project name? freeshell
# Directory? ./
# Override settings? N
```

### Vercel 대시보드에서 환경 변수 설정
```
1. https://vercel.com 접속
2. 프로젝트 클릭
3. Settings → Environment Variables
4. 추가:

Name: VITE_API_URL
Value: https://YOUR_RAILWAY_DOMAIN (Railway에서 받은 도메인)
```

---

## 📋 **3단계: 도메인 연결**

### Cloudflare DNS 설정
```
1. https://dash.cloudflare.com 접속
2. freeshell.co.kr 선택
3. DNS 탭 클릭
4. 레코드 추가:
```

**프론트엔드 (Vercel)**:
```
Type: CNAME
Name: @
Target: cname.vercel-dns.com
Proxy: ON (주황색 구름)
```

```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy: ON (주황색 구름)
```

**백엔드 (Railway)**:
```
Type: CNAME
Name: api
Target: YOUR_RAILWAY_DOMAIN.railway.app
Proxy: ON (주황색 구름)
```

### Vercel에서 도메인 추가
```
1. Vercel 대시보드 → 프로젝트 선택
2. Settings → Domains
3. Add Domain:
   - freeshell.co.kr
   - www.freeshell.co.kr
```

### Railway에서 커스텀 도메인 설정
```
1. Railway 대시보드 → 프로젝트 선택
2. Settings → Domains
3. Custom Domain: api.freeshell.co.kr
```

---

## ✅ **4단계: 배포 확인**

### 백엔드 확인
```
https://api.freeshell.co.kr/api/health
```
→ 200 OK와 함께 health 정보가 나와야 합니다

### 프론트엔드 확인
```
https://freeshell.co.kr
```
→ 로그인 화면이 나와야 합니다

### 로그인 테스트
```
아이디: admin
비밀번호: Admin123!@#
```

---

## 🎯 **간단 요약**

### 명령어만 복사해서 실행하세요!

**터미널 1 - Railway (백엔드)**:
```powershell
railway login
cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell\backend"
railway init
railway up
railway domain
```

**터미널 2 - Vercel (프론트엔드)**:
```powershell
vercel login
cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell"
vercel --prod
```

**환경 변수 설정**: Railway, Vercel 대시보드에서

**DNS 설정**: Cloudflare에서

---

## 💡 **중요 팁**

1. ✅ Railway 로그인 시 **브라우저**가 자동으로 열립니다
2. ✅ Vercel 로그인 시 **브라우저**가 자동으로 열립니다
3. ✅ 환경 변수는 **반드시** 설정해야 합니다
4. ✅ DNS 전파는 최대 **24시간** 걸릴 수 있습니다

---

## 🐛 **문제 발생 시**

### Railway 배포 실패
```powershell
railway logs
```

### Vercel 배포 실패
```powershell
vercel logs
```

### 도메인 연결 안 됨
```
1. DNS 전파 확인: https://dnschecker.org
2. Cloudflare SSL/TLS: Full로 설정
3. Proxy 상태: ON (주황색 구름)
```

---

## 📊 **예상 소요 시간**

- Railway 배포: 5분
- Vercel 배포: 3분
- 환경 변수 설정: 2분
- DNS 설정: 2분
- DNS 전파 대기: 0~24시간

**총 소요 시간: 약 12분 + DNS 전파 시간**

---

## 🎉 **완료 후**

### 접속 URL
```
https://freeshell.co.kr
```

### API 문서
```
https://api.freeshell.co.kr/api-docs
```

### 로그인
```
아이디: admin
비밀번호: Admin123!@#
```

---

**모든 준비가 완료되었습니다!** ✅  
**이제 명령어를 실행하세요!** 🚀

**질문이 있으면 언제든 물어보세요!** 💪

