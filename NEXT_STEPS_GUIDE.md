# 다음 단계 진행 가이드

## 🎯 현재 상태
- ✅ 프론트엔드: 완성
- ✅ 백엔드: 완성
- ✅ 보안 시스템: 완성
- ⏳ 실제 배포: 대기 중

---

## 📋 다음 단계 옵션

### 옵션 1: 로컬에서 먼저 테스트 (권장) ⭐
**목적**: 서버 배포 전에 로컬에서 모든 기능이 작동하는지 확인

**시간**: 30분 ~ 1시간

### 옵션 2: 서버에 바로 배포
**목적**: 온라인에서 바로 사용 가능하도록 배포

**시간**: 2-3시간 (서버 신청 포함)

### 옵션 3: 기능 개선 후 배포
**목적**: 플랫폼 연동 완성 등 개선 후 배포

**시간**: 1-2주

---

## 🚀 옵션 1: 로컬 테스트 (가장 추천!)

### 1단계: 백엔드 서버 시작

```bash
# PowerShell에서 (현재 디렉토리 확인)
cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\TinTop\backend"

# 의존성 설치
npm.cmd install

# 환경 변수 파일 생성
copy .env.example .env

# .env 파일 편집 (메모장으로 열기)
notepad .env
```

`.env` 파일에 최소한 다음 내용 추가:
```env
PORT=3001
NODE_ENV=development

# AI API 키 (최소 하나 필요)
OPENAI_API_KEY=sk-your-key-here
# 또는
CLAUDE_API_KEY=sk-ant-your-key-here

# 데이터베이스
DATABASE_URL="file:./data/database.db"
```

### 2단계: 데이터베이스 초기화

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma migrate dev
```

### 3단계: 백엔드 서버 실행

```bash
# 개발 모드로 실행
npm.cmd run dev
```

성공하면:
```
✅ 서버가 http://localhost:3001 에서 실행 중입니다
```

### 4단계: 프론트엔드 시작 (새 터미널)

```bash
# 새 PowerShell 창 열기
cd "C:\Users\partn\OneDrive\바탕 화면\Cursor\TinTop"

# 의존성 설치 (처음만)
npm.cmd install

# 개발 서버 실행
npm.cmd run dev
```

성공하면:
```
✅ 프론트엔드가 http://localhost:5173 에서 실행 중입니다
```

### 5단계: 테스트

1. 브라우저에서 `http://localhost:5173` 접속
2. 콘텐츠 생성 페이지로 이동
3. 콘텐츠 생성 테스트
4. 백엔드 API 응답 확인

---

## 🌐 옵션 2: 서버 배포

### 1단계: 서버 선택 및 신청

#### 추천 1: AWS Lightsail (월 4,500원, 첫 달 무료)
- **신청**: https://lightsail.aws.amazon.com/
- **플랜**: $3.50/월 (약 4,500원)
- **지역**: 서울 리전 선택
- **OS**: Ubuntu 22.04 LTS

#### 추천 2: 카페24 VPS (월 9,900원, 한국어 지원)
- **신청**: https://www.cafe24.com/vps/
- **⚠️ 중요**: "VPS 서비스" 선택 (웹호스팅 아님!)
- **플랜**: VPS 스타터 (월 9,900원)
- **OS**: Ubuntu 22.04 LTS

### 2단계: 서버 접속 정보 확인

서버 신청 후 이메일로 받을 정보:
- 서버 IP 주소 (예: `123.456.789.0`)
- SSH 접속 정보
  - 사용자명: `root` 또는 `ubuntu`
  - 비밀번호: (이메일에서 확인)

### 3단계: 서버 자동 설정

#### 방법 A: 자동 스크립트 (가장 쉬움)

```bash
# 로컬에서 서버에 스크립트 업로드
# (Windows에서는 WinSCP 또는 FileZilla 사용)

# 서버에 접속 (PowerShell에서)
ssh root@your-server-ip

# 자동 설정 스크립트 실행
cd /root
wget https://raw.githubusercontent.com/your-repo/backend/scripts/setup-server.sh
chmod +x setup-server.sh
./setup-server.sh
```

#### 방법 B: 수동 설정

```bash
# 서버 접속
ssh root@your-server-ip

# 시스템 업데이트
apt-get update && apt-get upgrade -y

# Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# FFmpeg 설치
apt-get install -y ffmpeg

# PM2 설치 (프로세스 관리)
npm install -g pm2
```

### 4단계: 프로젝트 배포

#### 방법 A: Git 사용 (권장)

```bash
# 서버에서
cd /opt
git clone your-repository-url all-in-one-content-ai
cd all-in-one-content-ai/backend

# 의존성 설치
npm install --production

# 환경 변수 설정
nano .env
# (API 키 등 입력)

# 데이터베이스 초기화
npx prisma generate
npx prisma migrate deploy

# 서버 시작
pm2 start dist/index.js --name all-in-one-content-ai
pm2 save
pm2 startup
```

#### 방법 B: 파일 업로드

1. 로컬에서 빌드:
```bash
cd backend
npm run build
```

2. WinSCP 또는 FileZilla로 서버에 업로드

3. 서버에서:
```bash
cd /opt/all-in-one-content-ai/backend
npm install --production
npx prisma generate
npx prisma migrate deploy
pm2 start dist/index.js --name all-in-one-content-ai
pm2 save
```

### 5단계: 환경 변수 설정

서버에서 `.env` 파일 편집:
```bash
nano /opt/all-in-one-content-ai/backend/.env
```

필수 내용:
```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://your-server-ip:5173

# AI API 키
OPENAI_API_KEY=sk-your-key-here

# 데이터베이스
DATABASE_URL="file:./data/database.db"
```

### 6단계: 방화벽 설정

```bash
# Ubuntu 방화벽 설정
ufw allow 22/tcp    # SSH
ufw allow 3001/tcp  # 백엔드
ufw allow 80/tcp   # HTTP (선택)
ufw allow 443/tcp  # HTTPS (선택)
ufw enable
```

### 7단계: 테스트

```bash
# 서버에서 헬스 체크
curl http://localhost:3001/api/health

# 외부에서 테스트 (로컬 컴퓨터에서)
curl http://your-server-ip:3001/api/health
```

---

## 🔧 옵션 3: 기능 개선 후 배포

### 우선순위 높은 개선 사항

1. **플랫폼 연동 완성** (1-2주)
   - YouTube OAuth 완성
   - TikTok API 연동
   - Instagram API 연동
   - 점수 향상: +10점

2. **사용자 인증 UI** (1주)
   - 로그인/회원가입 페이지
   - 프로필 관리
   - 점수 향상: +5점

3. **테스트 코드** (2주)
   - 단위 테스트
   - 통합 테스트
   - 점수 향상: +5점

---

## 💡 추천 순서

### 초보자라면:
1. ✅ **옵션 1: 로컬 테스트 먼저** (30분)
2. ✅ 서버 신청 및 배포 (2-3시간)
3. ⏳ 기능 개선 (나중에)

### 경험자라면:
1. ✅ 서버 신청 및 배포 (1-2시간)
2. ✅ 로컬 테스트 병행
3. ⏳ 기능 개선

---

## 🆘 문제 해결

### 백엔드가 시작 안 됨
```bash
# 포트 확인
netstat -ano | findstr :3001

# 로그 확인
cd backend
npm.cmd run dev
# (에러 메시지 확인)
```

### 프론트엔드가 시작 안 됨
```bash
# 포트 확인
netstat -ano | findstr :5173

# 의존성 재설치
rm -rf node_modules
npm.cmd install
```

### API 연결 안 됨
- 백엔드가 실행 중인지 확인
- `http://localhost:3001/api/health` 접속 테스트
- 프론트엔드의 `API_BASE_URL` 확인

---

## ✅ 체크리스트

### 로컬 테스트 전
- [ ] Node.js 18 이상 설치됨
- [ ] AI API 키 준비됨 (OpenAI 또는 Claude)
- [ ] PowerShell 실행 정책 설정됨

### 서버 배포 전
- [ ] 로컬 테스트 완료
- [ ] 서버 신청 완료
- [ ] SSH 접속 가능
- [ ] API 키 준비됨

### 배포 후
- [ ] 헬스 체크 성공
- [ ] 프론트엔드 접속 가능
- [ ] 콘텐츠 생성 테스트 성공

---

## 📞 다음 단계 선택

**어떤 옵션으로 진행하시겠습니까?**

1. **로컬 테스트 먼저** → 옵션 1 따라하기
2. **서버 바로 배포** → 옵션 2 따라하기
3. **기능 개선 먼저** → 옵션 3 따라하기

선택해주시면 더 자세한 가이드를 제공하겠습니다!

