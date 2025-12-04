# 🎯 초간단 배포 가이드 (클릭만 따라하세요!)

**소요 시간**: 6분  
**난이도**: ⭐☆☆☆☆ (매우 쉬움)

---

## 🚀 1단계: Railway (백엔드) - 3분

### 1. 사이트 접속
```
https://railway.app
```

### 2. 회원가입/로그인
```
1. 우측 상단 "Login" 클릭
2. "Login with GitHub" 클릭
3. GitHub 계정으로 로그인
```

### 3. 새 프로젝트 만들기
```
1. "New Project" 또는 "Start a New Project" 클릭
2. "Deploy from GitHub repo" 선택
3. 저장소 목록이 나옵니다!
```

### 4. 저장소 선택
```
만약 "Freeshell" 저장소가 보이면:
→ "partner0010/Freeshell" 클릭
→ "Deploy Now" 클릭

만약 저장소가 안 보이면:
→ "Configure GitHub App" 클릭
→ GitHub 권한 설정 페이지로 이동
→ "Repository access" → "All repositories" 선택
→ 또는 "Only select repositories" → "Freeshell" 선택
→ "Save" 클릭
→ Railway로 돌아와서 새로고침
→ "Freeshell" 저장소 클릭
→ "Deploy Now" 클릭
```

### 5. 설정 변경
```
1. 배포된 프로젝트 카드 클릭
2. 우측 "Settings" 탭 클릭
3. "Service Settings" 섹션:
   - Root Directory: backend 입력
   - Build Command: npm install && npx prisma generate && npm run build
   - Start Command: npm start
4. 하단 "Save Changes" 클릭
```

### 6. 환경 변수 추가
```
1. 좌측 "Variables" 탭 클릭
2. "New Variable" 클릭
3. 다음 변수들을 하나씩 추가:

Name: NODE_ENV
Value: production
→ "Add" 클릭

Name: PORT
Value: 3001
→ "Add" 클릭

Name: FRONTEND_URL
Value: https://freeshell.co.kr
→ "Add" 클릭

Name: JWT_SECRET
Value: (PowerShell에서 아래 명령어 실행 후 복사)
→ "Add" 클릭

Name: OPENAI_API_KEY
Value: (본인의 OpenAI API 키)
→ "Add" 클릭
```

**JWT_SECRET 생성** (PowerShell):
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### 7. PostgreSQL 추가
```
1. 프로젝트 화면에서 우측 상단 "New" 클릭
2. "Database" 선택
3. "Add PostgreSQL" 클릭
4. 자동으로 DATABASE_URL이 연결됨!
```

### 8. 도메인 설정
```
1. 프로젝트 카드 클릭
2. "Settings" 탭
3. "Networking" 섹션
4. "Public Networking" 에서:
   - "Generate Domain" 클릭 (railway.app 도메인 받기)
   - 또는 "Custom Domain" → "api.freeshell.co.kr" 입력
```

### ✅ Railway 완료!

---

## 🎨 2단계: Vercel (프론트엔드) - 2분

### 1. 사이트 접속
```
https://vercel.com
```

### 2. 회원가입/로그인
```
1. 우측 상단 "Sign Up" 클릭
2. "Continue with GitHub" 클릭
3. GitHub 계정으로 로그인
```

### 3. 새 프로젝트
```
1. 우측 상단 "Add New..." 클릭
2. "Project" 선택
```

### 4. 저장소 가져오기
```
1. "Import Git Repository" 섹션에서
2. "partner0010/Freeshell" 찾기
3. 우측 "Import" 버튼 클릭
```

### 5. 프로젝트 설정
```
1. Framework Preset: "Vite" 선택
2. Root Directory: ./ (그대로 둠)
3. Build Command: npm run build (자동 입력됨)
4. Output Directory: dist (자동 입력됨)
```

### 6. 환경 변수 추가
```
1. "Environment Variables" 섹션 펼치기
2. 다음 추가:

Name: VITE_API_URL
Value: https://api.freeshell.co.kr
→ "Add" 클릭
```

### 7. 배포!
```
1. 하단 "Deploy" 버튼 클릭
2. 2-3분 대기...
3. "Congratulations!" 화면 나오면 성공!
```

### 8. 도메인 추가
```
1. 프로젝트 대시보드에서
2. 상단 "Settings" 탭 클릭
3. 좌측 "Domains" 메뉴 클릭
4. "Add" 버튼 클릭
5. "freeshell.co.kr" 입력
6. "Add" 클릭
7. "www.freeshell.co.kr"도 똑같이 추가
```

### ✅ Vercel 완료!

---

## 🌐 3단계: Cloudflare (DNS) - 1분

### 1. 사이트 접속
```
https://dash.cloudflare.com
```

### 2. 로그인
```
Cloudflare 계정으로 로그인
```

### 3. 도메인 선택
```
"freeshell.co.kr" 클릭
```

### 4. DNS 레코드 추가
```
1. 좌측 "DNS" 메뉴 클릭
2. "Add record" 버튼 클릭 (3번 반복)

첫 번째 레코드:
- Type: CNAME
- Name: @
- Target: cname.vercel-dns.com
- Proxy status: Proxied (주황색 구름)
→ "Save" 클릭

두 번째 레코드:
- Type: CNAME
- Name: www
- Target: cname.vercel-dns.com
- Proxy status: Proxied (주황색 구름)
→ "Save" 클릭

세 번째 레코드:
- Type: CNAME
- Name: api
- Target: (Railway에서 받은 도메인).railway.app
- Proxy status: Proxied (주황색 구름)
→ "Save" 클릭
```

### ✅ Cloudflare 완료!

---

## 🎉 완료! 확인하기

### 5-10분 후 (DNS 전파 대기)

#### 백엔드 확인
```
https://api.freeshell.co.kr/api/health
→ {"status":"healthy"} 나오면 성공!
```

#### 프론트엔드 확인
```
https://freeshell.co.kr
→ 로그인 화면 나오면 성공!
```

#### 로그인 테스트
```
https://freeshell.co.kr
아이디: admin
비밀번호: Admin123!@#
→ 로그인 성공!
```

---

## 🐛 문제 발생 시

### Railway 배포 실패
```
1. Railway 프로젝트 → "Deployments" 탭
2. 최신 배포 클릭 → "View Logs"
3. 오류 메시지 확인
```

### Vercel 배포 실패
```
1. Vercel 프로젝트 → "Deployments"
2. 최신 배포 클릭 → "View Function Logs"
3. 오류 메시지 확인
```

### DNS 연결 안 됨
```
1. https://dnschecker.org 접속
2. "freeshell.co.kr" 입력
3. 전 세계 DNS 전파 확인
4. 아직 전파 중이면 1시간 대기
```

---

## 💡 핵심 요약

### Railway (백엔드)
```
1. GitHub 연결
2. Freeshell 선택
3. 환경 변수 추가
4. PostgreSQL 추가
→ 끝!
```

### Vercel (프론트엔드)
```
1. GitHub 연결
2. Freeshell 선택
3. 환경 변수 추가
4. 도메인 추가
→ 끝!
```

### Cloudflare (DNS)
```
1. DNS 메뉴
2. CNAME 레코드 3개 추가
→ 끝!
```

---

## 🎯 체크리스트

- [ ] Railway 회원가입/로그인
- [ ] Railway 프로젝트 생성
- [ ] Railway 환경 변수 추가
- [ ] Railway PostgreSQL 추가
- [ ] Vercel 회원가입/로그인
- [ ] Vercel 프로젝트 생성
- [ ] Vercel 환경 변수 추가
- [ ] Vercel 도메인 추가
- [ ] Cloudflare DNS 레코드 추가
- [ ] 배포 확인 (5-10분 후)

---

**이대로만 하면 됩니다!** ✅  
**막히는 부분 있으면 언제든 물어보세요!** 💪

**소요 시간: 6분 + DNS 전파 대기** ⏱️

