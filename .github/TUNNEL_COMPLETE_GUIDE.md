# 🎉 Cloudflare Tunnel 설정 완료!

## ✅ 완료된 작업

1. ✅ Cloudflared 설치
2. ✅ Cloudflare 계정 로그인
3. ✅ 터널 생성 (`freeshell`)
4. ✅ 설정 파일 생성
5. ✅ DNS 레코드 자동 설정
6. ✅ 환경 변수 설정
7. ✅ 서버 시작 스크립트 생성

---

## 🌐 도메인 정보

- **도메인**: `freeshell.co.kr`
- **터널 ID**: `10eec12a-9fda-4f30-b2ed-2e75b3b6d2cb`
- **터널 이름**: `freeshell`

---

## 📍 접속 주소

### 로컬 (개발용)
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:3001/api

### 공개 (프로덕션)
- **프론트엔드**: https://freeshell.co.kr
- **백엔드 API**: https://api.freeshell.co.kr/api

---

## 🚀 서버 시작 방법

### 방법 1: 자동 시작 스크립트 (권장)

```powershell
cd .github
.\start-with-tunnel.ps1
```

이 스크립트는 자동으로:
1. 백엔드 서버 시작 (포트 3001)
2. 프론트엔드 서버 시작 (포트 3000)
3. Cloudflare Tunnel 시작

### 방법 2: 수동 시작

#### 터미널 1: 백엔드 서버
```powershell
cd backend
npm run dev
```

#### 터미널 2: 프론트엔드 서버
```powershell
npm run dev
```

#### 터미널 3: Cloudflare Tunnel
```powershell
cloudflared tunnel run freeshell
```

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
1. https://dash.cloudflare.com 접속
2. `freeshell.co.kr` 도메인 선택
3. **DNS** → **Records** 메뉴

다음 레코드가 자동으로 생성되었습니다:
- **freeshell.co.kr** → `10eec12a-9fda-4f30-b2ed-2e75b3b6d2cb.cfargotunnel.com` (CNAME, Proxied)
- **api.freeshell.co.kr** → `10eec12a-9fda-4f30-b2ed-2e75b3b6d2cb.cfargotunnel.com` (CNAME, Proxied)

---

## 🧪 테스트

### 1. Health Check (로컬)
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing
```

### 2. Health Check (공개)
```powershell
Invoke-WebRequest -Uri "https://api.freeshell.co.kr/api/health" -UseBasicParsing
```

### 3. 프론트엔드 접속
브라우저에서:
- https://freeshell.co.kr

---

## 📊 터널 상태 확인

### 터널 목록 확인
```powershell
cloudflared tunnel list
```

### 터널 정보 확인
```powershell
cloudflared tunnel info freeshell
```

### 터널 연결 상태 확인
```powershell
# Cloudflare 대시보드에서 확인
# https://dash.cloudflare.com
# Zero Trust → Networks → Tunnels
```

---

## 🔧 터널 관리

### 터널 시작
```powershell
cloudflared tunnel run freeshell
```

### 터널 중지
```powershell
# Ctrl+C 또는 프로세스 종료
```

### 터널 삭제 (주의!)
```powershell
cloudflared tunnel delete freeshell
```

---

## 🖥️ Windows 서비스로 등록 (선택)

터널을 백그라운드에서 항상 실행하려면:

### 1. 서비스 설치 (관리자 권한 필요)
```powershell
# PowerShell을 관리자 권한으로 실행
cloudflared service install
```

### 2. 서비스 시작
```powershell
net start cloudflared
```

### 3. 서비스 중지
```powershell
net stop cloudflared
```

### 4. 서비스 제거
```powershell
cloudflared service uninstall
```

---

## 📝 로그 확인

### 터널 로그
터널 실행 시 콘솔에 표시됩니다.

### 서비스 로그 (Windows 서비스로 실행 시)
```powershell
# 이벤트 뷰어에서 확인
eventvwr.msc
```

---

## 🔒 보안 고려사항

### 1. 인증서 파일 보호
- **위치**: `C:\Users\partn\.cloudflared\cert.pem`
- **중요**: 이 파일을 절대 공유하지 마세요!

### 2. Credentials 파일 보호
- **위치**: `C:\Users\partn\.cloudflared\10eec12a-9fda-4f30-b2ed-2e75b3b6d2cb.json`
- **중요**: 이 파일을 절대 공유하지 마세요!

### 3. 환경 변수
- API 키 등 민감한 정보는 `.env` 파일에 저장
- `.env` 파일은 Git에 커밋하지 않기 (`.gitignore`에 추가됨)

---

## 🐛 문제 해결

### 터널이 연결되지 않음

1. **터널 상태 확인**
   ```powershell
   cloudflared tunnel list
   ```

2. **DNS 전파 확인**
   - DNS 변경은 최대 24시간 소요 (보통 몇 분)
   - https://www.whatsmydns.net 에서 확인

3. **설정 파일 확인**
   ```powershell
   cat $env:USERPROFILE\.cloudflared\config.yml
   ```

### CORS 에러

1. **환경 변수 확인**
   - `backend/.env`에서 `FRONTEND_URL=https://freeshell.co.kr` 확인
   - 백엔드 서버 재시작

2. **브라우저 캐시 삭제**

### 서버가 시작되지 않음

1. **포트 충돌 확인**
   ```powershell
   netstat -ano | findstr "3000"
   netstat -ano | findstr "3001"
   ```

2. **프로세스 종료**
   ```powershell
   # 포트를 사용 중인 프로세스 ID 확인 후
   taskkill /PID <프로세스ID> /F
   ```

### "tunnel credentials file not found" 에러

1. **Credentials 파일 확인**
   ```powershell
   Test-Path "$env:USERPROFILE\.cloudflared\10eec12a-9fda-4f30-b2ed-2e75b3b6d2cb.json"
   ```

2. **다시 로그인**
   ```powershell
   cloudflared tunnel login
   ```

---

## 📖 참고 문서

- [Cloudflare Tunnel 공식 문서](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Cloudflare 대시보드](https://dash.cloudflare.com)
- [가비아 DNS 설정 가이드](./.github/GABIA_DNS_SETUP.md)
- [자동 시작 스크립트](./.github/start-with-tunnel.ps1)

---

## 🎯 다음 단계

1. ✅ 서버 시작 (`.\start-with-tunnel.ps1`)
2. ✅ https://freeshell.co.kr 접속 테스트
3. ✅ API 테스트
4. 📝 프로덕션 배포 최적화
5. 📝 모니터링 설정

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

## ✨ 완료!

이제 `freeshell.co.kr` 도메인으로 전 세계 어디서나 접속할 수 있습니다!

**접속 주소**: https://freeshell.co.kr

