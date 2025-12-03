# 🚀 배포 가이드 - freeshell.co.kr

**소요 시간**: 약 15분  
**난이도**: 쉬움 ⭐⭐☆☆☆

---

## 📋 **준비 완료!**

### ✅ 생성된 파일
1. ✅ `vercel.json` - Vercel 설정
2. ✅ `backend/railway.json` - Railway 설정
3. ✅ `backend/.env.production` - 프로덕션 환경 변수

---

## 🎯 **배포 순서**

### 1단계: Railway 회원가입 (백엔드)
```
1. https://railway.app 접속
2. "Start a New Project" 클릭
3. GitHub로 로그인
```

### 2단계: Railway 프로젝트 생성
```
1. "Deploy from GitHub repo" 선택
2. 또는 "Empty Project" → "Deploy from CLI"
```

### 3단계: Railway CLI 설치 및 배포
```powershell
# CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 초기화
cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell\backend"
railway init

# 배포
railway up

# 도메인 설정
railway domain
```

### 4단계: Railway 환경 변수 설정
```
Railway 대시보드에서:

1. Variables 탭 클릭
2. 다음 변수 추가:

NODE_ENV=production
PORT=3001
FRONTEND_URL=https://freeshell.co.kr
JWT_SECRET=YOUR_STRONG_RANDOM_STRING_HERE
OPENAI_API_KEY=YOUR_OPENAI_KEY
```

### 5단계: PostgreSQL 추가 (Railway)
```
1. Railway 대시보드에서 "New" 클릭
2. "Database" → "PostgreSQL" 선택
3. DATABASE_URL 자동 생성됨
```

### 6단계: Vercel 회원가입 (프론트엔드)
```
1. https://vercel.com 접속
2. GitHub로 로그인
```

### 7단계: Vercel CLI 설치 및 배포
```powershell
# CLI 설치
npm install -g vercel

# 로그인
vercel login

# 프로젝트로 이동
cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\Freeshell"

# 배포
vercel --prod

# 질문에 답변:
# - Set up and deploy? Y
# - Which scope? (본인 계정 선택)
# - Link to existing project? N
# - Project name? freeshell
# - Directory? ./
# - Override settings? N
```

### 8단계: 환경 변수 설정 (Vercel)
```
Vercel 대시보드에서:

1. 프로젝트 선택
2. Settings → Environment Variables
3. 추가:

VITE_API_URL=https://api.freeshell.co.kr
```

### 9단계: 도메인 연결
```
# Railway (백엔드)
1. Railway 대시보드 → Settings → Domains
2. Custom Domain: api.freeshell.co.kr
3. CNAME 레코드 복사

# Vercel (프론트엔드)
1. Vercel 대시보드 → Settings → Domains
2. Add Domain: freeshell.co.kr, www.freeshell.co.kr
3. DNS 레코드 안내 받음
```

### 10단계: Cloudflare DNS 설정
```
Cloudflare 대시보드에서:

1. DNS 관리 이동
2. 레코드 추가:

Type: CNAME
Name: @
Target: (Vercel에서 받은 주소)

Type: CNAME
Name: www
Target: (Vercel에서 받은 주소)

Type: CNAME
Name: api
Target: (Railway에서 받은 주소)
```

---

## 🎯 **간단 명령어 요약**

### 백엔드 배포 (Railway)
```powershell
npm install -g @railway/cli
railway login
cd backend
railway init
railway up
```

### 프론트엔드 배포 (Vercel)
```powershell
npm install -g vercel
vercel login
vercel --prod
```

---

## 🔑 **필요한 환경 변수**

### Railway (백엔드)
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://freeshell.co.kr
DATABASE_URL=(자동 생성)
JWT_SECRET=(생성 필요)
OPENAI_API_KEY=(본인 키)
ANTHROPIC_API_KEY=(본인 키)
```

### Vercel (프론트엔드)
```env
VITE_API_URL=https://api.freeshell.co.kr
```

---

## 🔐 **JWT Secret 생성**

```powershell
# PowerShell에서 실행
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

복사해서 Railway 환경 변수에 붙여넣기

---

## ✅ **배포 확인**

### 1. 백엔드 확인
```
https://api.freeshell.co.kr/api/health
```

### 2. 프론트엔드 확인
```
https://freeshell.co.kr
```

### 3. 로그인 테스트
```
아이디: admin
비밀번호: Admin123!@#
```

---

## 🐛 **문제 해결**

### Railway 배포 실패 시
```powershell
# 로그 확인
railway logs

# 재배포
railway up --detach
```

### Vercel 배포 실패 시
```powershell
# 로그 확인
vercel logs

# 재배포
vercel --prod --force
```

### 도메인 연결 안 될 시
```
1. DNS 전파 확인 (최대 24시간)
2. Cloudflare Proxy 상태 확인 (주황색 구름)
3. SSL/TLS 설정: Full
```

---

## 💰 **예상 비용**

### Railway
- 무료 플랜: $5 크레딧/월
- Hobby 플랜: $5/월 (추가 크레딧)
- **예상**: 무료로 충분

### Vercel
- Hobby 플랜: 무료
- **예상**: $0/월

### 총 비용
**월 $0** (무료 플랜으로 충분)

---

## 🎉 **배포 완료 후**

### 접속 URL
```
https://freeshell.co.kr
```

### API 문서
```
https://api.freeshell.co.kr/api-docs
```

### 관리자 로그인
```
아이디: admin
비밀번호: Admin123!@#
```

---

## 📊 **배포 체크리스트**

- [ ] Railway CLI 설치
- [ ] Railway 로그인
- [ ] 백엔드 배포
- [ ] PostgreSQL 추가
- [ ] Railway 환경 변수 설정
- [ ] Vercel CLI 설치
- [ ] Vercel 로그인
- [ ] 프론트엔드 배포
- [ ] Vercel 환경 변수 설정
- [ ] Cloudflare DNS 설정
- [ ] 배포 확인
- [ ] 로그인 테스트

---

**준비 완료! 이제 명령어를 실행하세요!** 🚀

**질문이 있으면 언제든 물어보세요!** 💪
