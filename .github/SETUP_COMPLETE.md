# 🎉 Cloudflare Tunnel 설정 완료!

## ✅ 완료된 모든 작업

1. ✅ Cloudflared 설치
2. ✅ Cloudflare 계정 로그인
3. ✅ 터널 생성 (`freeshell`)
4. ✅ 설정 파일 생성
5. ✅ DNS 레코드 자동 설정
6. ✅ 환경 변수 설정
7. ✅ 시작 스크립트 생성

---

## 🌐 도메인 정보

- **도메인**: `freeshell.co.kr`
- **터널 ID**: `10eec12a-9fda-4f30-b2ed-2e75b3b6d2cb`
- **터널 이름**: `freeshell`

---

## 📍 접속 주소

### 공개 주소 (전 세계 어디서나 접속 가능)
- **프론트엔드**: https://freeshell.co.kr
- **백엔드 API**: https://api.freeshell.co.kr/api

### 로컬 주소 (개발용)
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:3001/api

---

## 🚀 서버 시작 방법

### 1단계: 백엔드 서버 시작

**터미널 1 열기:**
```powershell
cd backend
npm run dev
```

### 2단계: 프론트엔드 서버 시작

**터미널 2 열기:**
```powershell
npm run dev
```

### 3단계: Cloudflare Tunnel 시작

**터미널 3 열기:**
```powershell
cd .github
.\start-tunnel.ps1
```

또는 직접:
```powershell
cloudflared tunnel run freeshell
```

---

## 📊 터널 상태 확인

```powershell
# 터널 목록 확인
cloudflared tunnel list

# 터널 정보 확인
cloudflared tunnel info freeshell
```

---

## 🧪 테스트

### 1. 로컬 Health Check
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing
```

### 2. 공개 Health Check
```powershell
Invoke-WebRequest -Uri "https://api.freeshell.co.kr/api/health" -UseBasicParsing
```

### 3. 브라우저 테스트
https://freeshell.co.kr

---

## 📋 설정 파일 위치

### Cloudflare Tunnel 설정
- **위치**: `C:\Users\partn\.cloudflared\config.yml`
- **내용**:
  ```yaml
  tunnel: 10eec12a-9fda-4f30-b2ed-2e75b3b6d2cb
  credentials-file: C:\Users\partn\.cloudflared\10eec12a-9fda-4f30-b2ed-2e75b3b6d2cb.json

  ingress:
    - hostname: api.freeshell.co.kr
      service: http://localhost:3001
    - hostname: freeshell.co.kr
      service: http://localhost:3000
    - service: http_status:404
  ```

### 환경 변수

#### backend/.env
```env
FRONTEND_URL=https://freeshell.co.kr
```

#### .env (프론트엔드)
```env
VITE_API_BASE_URL=https://api.freeshell.co.kr/api
```

---

## 🔍 DNS 레코드 확인

Cloudflare 대시보드에서 확인:
- https://dash.cloudflare.com → `freeshell.co.kr` → DNS → Records

자동 생성된 레코드:
- **freeshell.co.kr** → `10eec12a-9fda-4f30-b2ed-2e75b3b6d2cb.cfargotunnel.com` (CNAME)
- **api.freeshell.co.kr** → `10eec12a-9fda-4f30-b2ed-2e75b3b6d2cb.cfargotunnel.com` (CNAME)

---

## 💡 유용한 명령어

```powershell
# 터널 목록
cloudflared tunnel list

# 터널 정보
cloudflared tunnel info freeshell

# 터널 실행
cloudflared tunnel run freeshell

# 설정 파일 확인
cat $env:USERPROFILE\.cloudflared\config.yml

# DNS 레코드 확인
nslookup freeshell.co.kr
nslookup api.freeshell.co.kr

# Health Check
Invoke-WebRequest -Uri "https://api.freeshell.co.kr/api/health" -UseBasicParsing
```

---

## 🔒 보안 고려사항

### 중요 파일 (절대 공유하지 마세요!)
- `C:\Users\partn\.cloudflared\cert.pem` (인증서)
- `C:\Users\partn\.cloudflared\10eec12a-9fda-4f30-b2ed-2e75b3b6d2cb.json` (Credentials)
- `backend/.env` (API 키 등)
- `.env` (환경 변수)

---

## 🐛 문제 해결

### 터널이 연결되지 않음

1. 서버가 실행 중인지 확인
2. 터널 상태 확인: `cloudflared tunnel list`
3. DNS 전파 확인: https://www.whatsmydns.net

### CORS 에러

1. `backend/.env`에서 `FRONTEND_URL=https://freeshell.co.kr` 확인
2. 백엔드 서버 재시작

### 포트 충돌

```powershell
# 포트 사용 확인
netstat -ano | findstr "3000"
netstat -ano | findstr "3001"

# 프로세스 종료
taskkill /PID [프로세스ID] /F
```

---

## 📖 참고 문서

- [Cloudflare Tunnel 공식 문서](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Cloudflare 대시보드](https://dash.cloudflare.com)
- [터널 시작 스크립트](.github/start-tunnel.ps1)
- [전체 설정 가이드](.github/TUNNEL_COMPLETE_GUIDE.md)
- [가비아 DNS 설정 가이드](.github/GABIA_DNS_SETUP.md)

---

## ✨ 완료!

이제 `freeshell.co.kr` 도메인으로 전 세계 어디서나 접속할 수 있습니다!

**공개 주소**: https://freeshell.co.kr

서버를 시작하고 터널을 실행하면 바로 사용할 수 있습니다.

