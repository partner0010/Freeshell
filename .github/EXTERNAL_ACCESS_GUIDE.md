# 🌐 외부 접속 가이드

로컬 서버를 외부에서 접속할 수 있도록 설정하는 방법입니다.

## 🚀 방법 1: ngrok 사용 (가장 간단, 권장)

ngrok은 로컬 서버를 인터넷에 공개하는 터널링 서비스입니다.

### 설치

1. **ngrok 다운로드**
   - https://ngrok.com/download 접속
   - Windows 버전 다운로드
   - 또는 Chocolatey 사용: `choco install ngrok`

2. **회원가입 및 인증**
   - https://dashboard.ngrok.com/signup 에서 무료 계정 생성
   - 인증 토큰 받기
   - 명령어로 인증: `ngrok config add-authtoken YOUR_TOKEN`

### 사용 방법

#### 백엔드 서버 터널링
```bash
# 새 터미널에서
ngrok http 3001
```

#### 프론트엔드 서버 터널링
```bash
# 또 다른 터미널에서
ngrok http 3000
```

### 접속 주소

ngrok 실행 후 다음과 같은 주소가 생성됩니다:
```
Forwarding  https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:3001
```

이 주소를 외부에서 접속할 수 있습니다!

### 장점
- ✅ 간단하고 빠름
- ✅ HTTPS 자동 제공
- ✅ 무료 플랜 제공
- ✅ 설정 불필요

### 단점
- ⚠️ 무료 플랜은 주소가 매번 변경됨
- ⚠️ 세션 시간 제한 (8시간)

---

## 🏠 방법 2: 로컬 네트워크 IP 사용

같은 네트워크(Wi-Fi)에 연결된 기기에서만 접속 가능합니다.

### 1. 로컬 IP 주소 확인

**Windows:**
```powershell
ipconfig
# IPv4 주소 확인 (예: 192.168.0.100)
```

**또는:**
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" }
```

### 2. 서버 설정 변경

**백엔드 (.env):**
```env
FRONTEND_URL=http://192.168.0.100:3000
```

**프론트엔드 (.env):**
```env
VITE_API_BASE_URL=http://192.168.0.100:3001/api
```

### 3. 방화벽 설정

**Windows 방화벽 규칙 추가:**
```powershell
# 관리자 권한으로 실행
New-NetFirewallRule -DisplayName "Node.js Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Node.js Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

또는 Windows 방화벽 설정에서:
1. Windows 보안 → 방화벽 및 네트워크 보호
2. 고급 설정
3. 인바운드 규칙 → 새 규칙
4. 포트 선택 → TCP → 특정 로컬 포트: 3000, 3001
5. 연결 허용

### 4. 접속

같은 네트워크의 다른 기기에서:
```
http://192.168.0.100:3000  (프론트엔드)
http://192.168.0.100:3001  (백엔드)
```

### 장점
- ✅ 무료
- ✅ 빠른 속도
- ✅ 제한 없음

### 단점
- ⚠️ 같은 네트워크에서만 접속 가능
- ⚠️ 공유기 설정 필요할 수 있음

---

## ☁️ 방법 3: 클라우드 배포 (프로덕션 권장)

### Railway (가장 간단)

1. **Railway 가입**
   - https://railway.app 접속
   - GitHub 계정으로 로그인

2. **프로젝트 배포**
   - "New Project" → "Deploy from GitHub repo"
   - Freeshell 저장소 선택
   - 자동 배포 시작

3. **환경 변수 설정**
   - Settings → Variables
   - 필요한 환경 변수 추가

4. **접속**
   - Railway가 자동으로 URL 제공
   - 예: `https://freeshell-production.up.railway.app`

### Vercel (프론트엔드) + Railway (백엔드)

**프론트엔드:**
1. https://vercel.com 접속
2. GitHub 저장소 연결
3. 자동 배포

**백엔드:**
1. Railway 사용 (위 참고)

### 장점
- ✅ 24/7 접속 가능
- ✅ HTTPS 자동 제공
- ✅ 도메인 연결 가능
- ✅ 프로덕션 환경

### 단점
- ⚠️ 무료 플랜 제한 있음
- ⚠️ 설정 필요

---

## 🔧 빠른 설정 스크립트

### ngrok 자동 실행 스크립트

**start-ngrok.ps1:**
```powershell
# 백엔드 ngrok
Start-Process ngrok -ArgumentList "http 3001" -WindowStyle Normal

# 프론트엔드 ngrok (5초 후)
Start-Sleep -Seconds 5
Start-Process ngrok -ArgumentList "http 3000" -WindowStyle Normal

Write-Host "ngrok이 실행되었습니다!" -ForegroundColor Green
Write-Host "ngrok 대시보드: http://localhost:4040" -ForegroundColor Cyan
```

### 방화벽 자동 설정 스크립트

**setup-firewall.ps1:**
```powershell
# 관리자 권한 필요
New-NetFirewallRule -DisplayName "Freeshell Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Freeshell Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
Write-Host "방화벽 규칙이 추가되었습니다!" -ForegroundColor Green
```

---

## 📱 모바일에서 테스트

### ngrok 사용 시
1. ngrok 주소를 모바일 브라우저에 입력
2. 즉시 접속 가능

### 로컬 네트워크 사용 시
1. PC와 모바일이 같은 Wi-Fi에 연결
2. PC의 IP 주소로 접속
3. 예: `http://192.168.0.100:3000`

---

## 🔒 보안 주의사항

### 개발 환경
- ✅ ngrok은 개발/테스트용으로 안전
- ✅ 세션 시간 제한으로 자동 종료

### 프로덕션
- ⚠️ 로컬 서버를 직접 공개하지 마세요
- ✅ 클라우드 배포 사용 권장
- ✅ HTTPS 필수
- ✅ 환경 변수 보호

---

## 🎯 추천 방법

### 빠른 테스트
→ **ngrok 사용** (가장 간단)

### 같은 네트워크에서만
→ **로컬 IP 사용**

### 프로덕션 배포
→ **Railway 또는 Vercel 사용**

---

## 📞 문제 해결

### ngrok이 작동하지 않음
1. 인증 토큰 확인
2. 포트가 사용 중인지 확인
3. 방화벽 확인

### 로컬 IP로 접속 안 됨
1. 방화벽 규칙 확인
2. 같은 네트워크인지 확인
3. IP 주소가 변경되지 않았는지 확인

### 외부에서 접속 안 됨
1. 공유기 포트 포워딩 설정
2. ISP가 포트를 막지 않는지 확인
3. 클라우드 배포 고려

---

## 📚 참고

- [ngrok 공식 문서](https://ngrok.com/docs)
- [Railway 배포 가이드](DEPLOYMENT_GUIDE.md)
- [프로젝트 설정 가이드](SETUP_GUIDE.md)

