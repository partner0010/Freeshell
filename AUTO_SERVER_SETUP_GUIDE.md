# 완전 자동화된 서버 설정 가이드

## 🚀 원클릭 배포

### 가장 간단한 방법

**서버 IP만 입력하면 모든 것이 자동으로 설정됩니다!**

```bash
# 1. 스크립트 실행 권한 부여
chmod +x backend/scripts/one-click-deploy.sh

# 2. 원클릭 배포 실행
./backend/scripts/one-click-deploy.sh [서버IP] [사용자명]
```

**예시**:
```bash
./backend/scripts/one-click-deploy.sh 123.456.789.0 root
```

---

## 📋 자동으로 수행되는 작업

### 1. 서버 초기 설정 (자동)
- ✅ 시스템 업데이트
- ✅ 필수 패키지 설치 (curl, git, build-essential 등)
- ✅ Node.js 20.x 설치
- ✅ FFmpeg 설치
- ✅ PM2 설치
- ✅ Redis 설치 및 설정
- ✅ 방화벽 설정
- ✅ Nginx 설정
- ✅ 디렉토리 생성

### 2. 프로젝트 배포 (자동)
- ✅ 로컬 빌드
- ✅ 파일 업로드
- ✅ 의존성 설치
- ✅ Prisma 설정
- ✅ 서버 빌드
- ✅ .env 파일 생성 (없는 경우)

### 3. 서버 시작 (자동)
- ✅ PM2로 서버 시작
- ✅ 자동 재시작 설정
- ✅ 헬스 체크

---

## 🛠️ 수동 설정 방법

### 방법 1: 서버 초기 설정만 (처음 한 번만)

```bash
# 서버에 접속
ssh root@your-server-ip

# 스크립트 업로드 후 실행
chmod +x backend/scripts/auto-setup-server.sh
./backend/scripts/auto-setup-server.sh
```

### 방법 2: 환경 변수 설정

```bash
cd backend
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh
```

대화형으로 질문에 답하면 `.env` 파일이 자동 생성됩니다.

---

## 📝 단계별 가이드

### 1단계: 서버 준비

**서버가 필요합니다:**
- AWS Lightsail (월 4,500원, 첫 달 무료)
- 카페24 VPS (월 9,900원)
- 기타 VPS 서버

**서버 정보:**
- IP 주소: `123.456.789.0` (예시)
- 사용자명: `root` 또는 `ubuntu`
- 비밀번호: 서버 제공자로부터 받음

### 2단계: 원클릭 배포

```bash
# 로컬 컴퓨터에서
cd TinTop
chmod +x backend/scripts/one-click-deploy.sh
./backend/scripts/one-click-deploy.sh 123.456.789.0 root
```

**자동으로 수행되는 작업:**
1. 서버 초기 설정 (처음 한 번만)
2. 프로젝트 빌드
3. 파일 업로드
4. 서버 설정
5. 서버 시작
6. 헬스 체크

### 3단계: API 키 설정

```bash
# 서버에 접속
ssh root@123.456.789.0

# .env 파일 수정
cd /opt/all-in-one-content-ai/backend
nano .env

# API 키 입력
OPENAI_API_KEY=sk-your-key-here
# 또는
CLAUDE_API_KEY=sk-ant-your-key-here

# 서버 재시작
pm2 restart all-in-one-content-ai
```

---

## ✅ 확인 방법

### 서버 상태 확인

```bash
# 서버에 접속
ssh root@your-server-ip

# PM2 상태 확인
pm2 status

# 서버 로그 확인
pm2 logs all-in-one-content-ai

# 헬스 체크
curl http://localhost:3001/api/health
```

### 외부에서 접속 확인

```bash
# 브라우저에서
http://your-server-ip:3001/api/health

# 또는 curl로
curl http://your-server-ip:3001/api/health
```

---

## 🔧 문제 해결

### 서버 시작 실패

```bash
# 로그 확인
pm2 logs all-in-one-content-ai

# .env 파일 확인
cat .env

# 수동 재시작
pm2 restart all-in-one-content-ai
```

### Redis 연결 실패

```bash
# Redis 상태 확인
sudo systemctl status redis-server

# Redis 재시작
sudo systemctl restart redis-server
```

### 포트 충돌

```bash
# 포트 사용 확인
sudo netstat -tulpn | grep 3001

# 프로세스 종료
pm2 delete all-in-one-content-ai
```

---

## 📊 자동 설정 내용

### 설치되는 소프트웨어

- **Node.js 20.x**: 최신 LTS 버전
- **FFmpeg**: 비디오 처리
- **PM2**: 프로세스 관리
- **Redis**: 캐싱 시스템
- **Nginx**: 리버스 프록시 (선택)
- **UFW**: 방화벽

### 생성되는 디렉토리

```
/opt/all-in-one-content-ai/
├── backend/
│   ├── data/          # 데이터베이스
│   ├── uploads/       # 업로드 파일
│   │   ├── videos/
│   │   ├── images/
│   │   └── audio/
│   └── logs/          # 로그 파일
```

### 설정되는 방화벽 규칙

- 포트 22: SSH
- 포트 80: HTTP
- 포트 443: HTTPS
- 포트 3001: API

---

## 🎯 완료!

**이제 서버가 완전히 자동으로 설정되고 배포됩니다!**

- ✅ 모든 의존성 자동 설치
- ✅ 환경 변수 자동 생성
- ✅ 서버 자동 시작
- ✅ 헬스 체크 자동화

**다음 단계**: API 키만 설정하면 바로 사용 가능! 🚀

