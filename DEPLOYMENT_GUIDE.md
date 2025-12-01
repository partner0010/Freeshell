# 서버 배포 완전 가이드

## 🎯 목표
최소 비용으로 온라인 서버에 배포하기

## 1단계: 서버 임대

### 🥇 최고 추천: AWS Lightsail (월 4,500원, 첫 달 무료!)

**가격**: $3.50/월 (약 4,500원)
**첫 달 무료**: 신규 고객 첫 달 $0
**사양**: 1코어/512MB/20GB SSD
**지역**: 서울 리전 지원 ✅

**신청 방법**: `AWS_LIGHTSAIL_SETUP.md` 파일 참고

### 🥈 대안: 카페24 VPS (월 9,900원, 한국어 지원)

**⚠️ 중요: "VPS 서비스"를 신청해야 합니다!**
- ❌ 웹호스팅 신청하지 말 것!
- ❌ 도메인 신청하지 말 것!
- ✅ **VPS (가상서버)** 신청!

#### 신청 방법:

1. **카페24 VPS 페이지 접속**: https://www.cafe24.com/vps/
   - 또는 카페24 메인 → "호스팅" → "VPS" 클릭

2. **"VPS 스타터" 플랜 선택** (월 9,900원)
   - CPU: 1코어
   - RAM: 1GB
   - 스토리지: 20GB SSD

3. **운영체제 선택**: **Ubuntu 22.04 LTS** (추천)

4. **결제 완료**

5. **이메일 확인** (몇 분 ~ 몇 시간 내)
   - 서버 IP 주소 (예: 123.456.789.0)
   - SSH 접속 정보
     - 사용자명: `root` 또는 `ubuntu`
     - 비밀번호: (이메일에서 확인)

**자세한 신청 가이드**: `CAFE24_SETUP_GUIDE.md` 파일 참고

---

## 2단계: 서버 초기 설정

### 방법 1: 자동 스크립트 (권장)

```bash
# 로컬 컴퓨터에서
chmod +x backend/scripts/setup-server.sh

# 서버에 스크립트 업로드 후 실행
ssh root@your-server-ip
./setup-server.sh
```

### 방법 2: 수동 설정

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

# PM2 설치
npm install -g pm2
```

---

## 3단계: 프로젝트 배포

### 방법 1: 자동 배포 스크립트 (권장)

```bash
# 로컬 컴퓨터에서
cd backend
chmod +x scripts/deploy.sh
./scripts/deploy.sh your-server-ip root
```

### 방법 2: 수동 배포

```bash
# 1. 로컬에서 빌드
cd backend
npm run build

# 2. 서버에 파일 업로드 (rsync 사용)
rsync -avz --exclude 'node_modules' \
  ./ root@your-server-ip:/opt/all-in-one-content-ai/backend/

# 3. 서버에서 설정
ssh root@your-server-ip
cd /opt/all-in-one-content-ai/backend
npm install --production
npx prisma generate
npx prisma migrate deploy

# 4. 환경 변수 설정
nano .env
# API 키 등 입력

# 5. 서버 시작
pm2 start dist/index.js --name all-in-one-content-ai
pm2 save
```

---

## 4단계: 환경 변수 설정

서버에서 `.env` 파일 생성:

```bash
cd /opt/all-in-one-content-ai/backend
nano .env
```

다음 내용 입력:

```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://your-domain.com

# AI API 키 (최소 하나)
OPENAI_API_KEY=sk-your-key-here
# 또는
CLAUDE_API_KEY=sk-ant-your-key-here

# 데이터베이스
DATABASE_URL="file:./data/database.db"

# 기타 설정
LOG_LEVEL=info
```

---

## 5단계: Nginx 리버스 프록시 설정 (선택)

도메인을 사용한다면:

```bash
# Nginx 설정 파일 생성
sudo nano /etc/nginx/sites-available/all-in-one-content-ai
```

다음 내용 입력:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        root /opt/all-in-one-content-ai/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

활성화:

```bash
sudo ln -s /etc/nginx/sites-available/all-in-one-content-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6단계: SSL 인증서 설정 (HTTPS)

Let's Encrypt 무료 인증서:

```bash
sudo certbot --nginx -d your-domain.com
```

자동 갱신 설정:

```bash
sudo certbot renew --dry-run
```

---

## 7단계: 모니터링 설정

### PM2 모니터링

```bash
# 상태 확인
pm2 status

# 로그 확인
pm2 logs all-in-one-content-ai

# 재시작
pm2 restart all-in-one-content-ai

# 자동 재시작 설정
pm2 startup
pm2 save
```

### 헬스 체크

```bash
# 서버 상태 확인
curl http://localhost:3001/api/health

# 외부에서 확인
curl http://your-server-ip:3001/api/health
```

---

## 8단계: 프론트엔드 배포

### 프론트엔드 빌드

```bash
# 로컬에서
npm run build
```

### 서버에 업로드

```bash
# 빌드된 파일 업로드
rsync -avz dist/ root@your-server-ip:/opt/all-in-one-content-ai/frontend/dist/
```

### Nginx 설정 (위 5단계 참고)

---

## 🔒 보안 체크리스트

- [ ] 방화벽 설정 완료
- [ ] SSH 키 인증 설정 (비밀번호 비활성화)
- [ ] 불필요한 포트 차단
- [ ] 정기 업데이트 설정
- [ ] SSL 인증서 설치
- [ ] .env 파일 권한 설정 (chmod 600)
- [ ] 로그 모니터링 설정

---

## 💰 예상 비용

### 월 비용
- 서버 임대: 9,900원 (카페24 VPS)
- 도메인: 0원 (서브도메인 사용) 또는 15,000원/년
- SSL 인증서: 0원 (Let's Encrypt)
- **총: 월 9,900원 ~ 10,000원**

### 초기 비용
- 서버 설정 시간: 1-2시간
- 도메인 구매 (선택): 15,000원/년

---

## 🐛 문제 해결

### 서버 접속 안 됨
```bash
# 방화벽 확인
sudo ufw status

# 포트 확인
sudo netstat -tlnp | grep 3001
```

### 서버가 자동 재시작 안 됨
```bash
pm2 startup
pm2 save
```

### 로그 확인
```bash
pm2 logs all-in-one-content-ai
tail -f /opt/all-in-one-content-ai/backend/logs/combined.log
```

---

## ✅ 배포 완료 확인

1. **헬스 체크**: `curl http://your-server-ip:3001/api/health`
2. **프론트엔드 접속**: `http://your-domain.com`
3. **콘텐츠 생성 테스트**: 실제로 콘텐츠 생성해보기

---

## 📞 지원

문제가 발생하면:
1. 로그 확인: `pm2 logs`
2. 서버 상태 확인: `pm2 status`
3. 헬스 체크: `/api/health` 엔드포인트

