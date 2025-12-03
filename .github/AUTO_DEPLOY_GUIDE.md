# 🤖 완전 자동 배포 가이드

**GitHub Actions로 자동 배포!**  
**코드만 푸시하면 자동으로 배포됩니다!** ✨

---

## 🎯 **배포 방법 (가장 쉬운 방법)**

### 옵션 1: GitHub 연동으로 자동 배포 (추천! ⭐⭐⭐⭐⭐)

이 방법이 **가장 쉽고 자동화**되어 있습니다!

#### 1단계: GitHub 저장소 만들기
```
1. https://github.com 접속
2. 우측 상단 "+" → "New repository" 클릭
3. Repository name: freeshell
4. Public 또는 Private 선택
5. "Create repository" 클릭
```

#### 2단계: 코드를 GitHub에 푸시
```powershell
# Git 초기화 (아직 안 했다면)
git init

# 모든 파일 추가
git add .

# 커밋
git commit -m "🚀 Freeshell 초기 배포"

# GitHub 저장소 연결 (본인의 username으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/freeshell.git

# 푸시!
git push -u origin main
```

#### 3단계: Railway 연동 (백엔드)
```
1. https://railway.app 접속
2. "New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. freeshell 저장소 선택
5. Root Directory: backend
6. 환경 변수 추가:
   - NODE_ENV=production
   - PORT=3001
   - FRONTEND_URL=https://freeshell.co.kr
   - JWT_SECRET=(랜덤 문자열)
   - OPENAI_API_KEY=(본인 키)
7. PostgreSQL 추가: "New" → "Database" → "PostgreSQL"
8. Custom Domain 설정: api.freeshell.co.kr
```

#### 4단계: Vercel 연동 (프론트엔드)
```
1. https://vercel.com 접속
2. "Add New..." → "Project" 클릭
3. Import Git Repository → freeshell 선택
4. Root Directory: ./
5. Framework Preset: Vite
6. 환경 변수 추가:
   - VITE_API_URL=https://api.freeshell.co.kr
7. "Deploy" 클릭
8. 배포 완료 후 Settings → Domains
9. freeshell.co.kr 추가
```

#### 5단계: Cloudflare DNS 설정
```
1. https://dash.cloudflare.com 접속
2. freeshell.co.kr 선택
3. DNS 레코드 추가:

@ → CNAME → cname.vercel-dns.com (Proxy ON)
www → CNAME → cname.vercel-dns.com (Proxy ON)
api → CNAME → (Railway 도메인).railway.app (Proxy ON)
```

**완료!** 이제부터 코드를 푸시하면 **자동으로 배포**됩니다! 🎉

---

## 🚀 **배포 자동화 완료!**

### 이제부터 배포 방법:
```powershell
# 코드 수정 후
git add .
git commit -m "업데이트"
git push
```

**그게 전부입니다!** GitHub에 푸시하면:
1. ✅ GitHub Actions가 자동 실행
2. ✅ Railway가 백엔드 자동 배포
3. ✅ Vercel이 프론트엔드 자동 배포
4. ✅ 1-2분 후 https://freeshell.co.kr에 반영!

---

## 🎯 **옵션 2: Docker로 자동 배포**

### Railway에 Docker로 배포
```dockerfile
# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "start"]
```

Railway는 Dockerfile을 자동으로 감지하고 배포합니다!

---

## 🎯 **옵션 3: CLI로 수동 배포** (참고용)

만약 정말 CLI로 하고 싶다면:

### Railway 토큰 발급
```
1. https://railway.app/account/tokens
2. "Create New Token" 클릭
3. 토큰 복사
```

### 배포 실행
```powershell
$env:RAILWAY_TOKEN = "YOUR_TOKEN_HERE"
cd backend
railway up --detach
```

### Vercel 토큰 발급
```
1. https://vercel.com/account/tokens
2. "Create" 클릭
3. 토큰 복사
```

### 배포 실행
```powershell
$env:VERCEL_TOKEN = "YOUR_TOKEN_HERE"
vercel --token $env:VERCEL_TOKEN --prod --yes
```

---

## 💡 **추천 방법**

**옵션 1 (GitHub 연동)이 가장 좋습니다!** ⭐⭐⭐⭐⭐

**이유**:
- ✅ 한 번만 설정하면 됨
- ✅ 자동 배포
- ✅ 롤백 쉬움
- ✅ 팀 협업 가능
- ✅ CI/CD 파이프라인
- ✅ 배포 히스토리

---

## 📊 **배포 상태 확인**

### Railway 대시보드
```
https://railway.app
→ 프로젝트 선택
→ Deployments 탭
→ 로그 확인
```

### Vercel 대시보드
```
https://vercel.com
→ 프로젝트 선택
→ Deployments
→ 상태 확인
```

---

## 🎉 **결론**

### 가장 쉬운 방법:
1. ✅ GitHub에 코드 푸시
2. ✅ Railway에서 저장소 연결
3. ✅ Vercel에서 저장소 연결
4. ✅ Cloudflare DNS 설정
5. ✅ 끝!

**이후 배포**:
```bash
git push
```

**그게 전부입니다!** 🎊

---

**GitHub 저장소가 있으신가요?**  
**없다면 지금 바로 만들어드릴까요?** 🚀

