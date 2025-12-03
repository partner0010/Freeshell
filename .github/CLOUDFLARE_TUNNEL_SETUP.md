# 🌐 Cloudflare Tunnel 설정 가이드

## 1단계: Cloudflared 설치

### 방법 1: winget 사용 (권장)

```powershell
# 약관에 동의하고 설치
winget install --id Cloudflare.cloudflared
```

### 방법 2: 직접 다운로드

1. https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/ 접속
2. Windows용 다운로드
3. 압축 해제 후 `cloudflared.exe`를 PATH에 추가

### 설치 확인

```powershell
cloudflared --version
```

---

## 2단계: Cloudflare 계정 준비

1. **Cloudflare 계정 생성** (없는 경우)
   - https://dash.cloudflare.com/sign-up
   - 무료 계정으로 충분합니다

2. **도메인 추가** (이미 있으면 스킵)
   - Cloudflare 대시보드에서 도메인 추가
   - DNS 서버 변경 안내 따르기

---

## 3단계: 자동 설정 스크립트 실행

```powershell
cd .github
.\setup-cloudflare-tunnel.ps1
```

스크립트가 다음을 자동으로 처리합니다:
- ✅ Cloudflared 설치 확인
- ✅ 서버 실행 확인
- ✅ Cloudflare 로그인
- ✅ 터널 생성
- ✅ 설정 파일 생성
- ✅ 환경 변수 설정 안내

---

## 4단계: 수동 설정 (스크립트 사용 안 할 경우)

### 1. Cloudflare 로그인

```powershell
cloudflared tunnel login
```

브라우저가 열리면:
1. Cloudflare 계정으로 로그인
2. 권한 승인

### 2. 터널 생성

```powershell
cloudflared tunnel create freeshell
```

터널 ID가 생성됩니다 (예: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### 3. 설정 파일 생성

설정 파일 위치: `C:\Users\[사용자명]\.cloudflared\config.yml`

```yaml
tunnel: [터널-ID]
credentials-file: C:\Users\[사용자명]\.cloudflared\[터널-ID].json

ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:3001
  - hostname: yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

**터널 ID 확인:**
```powershell
cloudflared tunnel list
```

### 4. DNS 레코드 설정

Cloudflare 대시보드 (https://dash.cloudflare.com)에서:

1. 도메인 선택
2. **DNS** → **Records** 클릭
3. 다음 레코드 추가:

**레코드 1: API 서브도메인**
- **Type**: CNAME
- **Name**: `api`
- **Target**: `[터널-ID].cfargotunnel.com`
- **Proxy status**: Proxied (주황색 구름) ✅
- **Save**

**레코드 2: 루트 도메인**
- **Type**: CNAME
- **Name**: `@` (또는 루트 도메인)
- **Target**: `[터널-ID].cfargotunnel.com`
- **Proxy status**: Proxied (주황색 구름) ✅
- **Save**

### 5. 환경 변수 설정

**backend/.env 파일:**
```env
FRONTEND_URL=https://yourdomain.com
```

**프론트엔드 .env 파일:**
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### 6. 터널 실행

```powershell
cloudflared tunnel run freeshell
```

터널이 실행되면:
- 프론트엔드: `https://yourdomain.com`
- 백엔드 API: `https://api.yourdomain.com/api`

---

## 5단계: 백그라운드 실행 (선택)

터널을 백그라운드에서 실행하려면:

### Windows 서비스로 등록

```powershell
# 관리자 권한으로 실행
cloudflared service install
```

### 서비스 시작/중지

```powershell
# 시작
net start cloudflared

# 중지
net stop cloudflared
```

---

## 테스트

### 1. Health Check

```powershell
Invoke-WebRequest -Uri "https://api.yourdomain.com/api/health" -UseBasicParsing
```

### 2. 프론트엔드 접속

브라우저에서:
```
https://yourdomain.com
```

### 3. CORS 확인

브라우저 개발자 도구 → Network 탭에서 CORS 에러 확인

---

## 문제 해결

### 터널이 연결되지 않음

1. **DNS 전파 확인**
   - DNS 레코드가 제대로 설정되었는지 확인
   - 전파에는 최대 24시간 걸릴 수 있음 (보통 몇 분)

2. **터널 ID 확인**
   ```powershell
   cloudflared tunnel list
   ```

3. **설정 파일 확인**
   ```powershell
   cat $env:USERPROFILE\.cloudflared\config.yml
   ```

### CORS 에러

1. **환경 변수 확인**
   - `FRONTEND_URL`이 올바른지 확인
   - 백엔드 서버 재시작

2. **CORS 설정 확인**
   ```typescript
   // backend/src/index.ts
   const allowedOrigins = process.env.FRONTEND_URL 
     ? [process.env.FRONTEND_URL]
     : ['http://localhost:3000']
   ```

### 서버가 실행되지 않음

터널은 로컬 서버를 포워딩하므로:
- 백엔드: `http://localhost:3001` 실행 중이어야 함
- 프론트엔드: `http://localhost:3000` 실행 중이어야 함

---

## 자주 묻는 질문

### Q: 무료로 사용할 수 있나요?
A: 네, Cloudflare Tunnel은 완전 무료입니다.

### Q: 고정 도메인을 사용할 수 있나요?
A: 네, 자신의 도메인을 사용할 수 있습니다.

### Q: SSL 인증서는?
A: Cloudflare가 자동으로 SSL 인증서를 제공합니다.

### Q: 속도는?
A: Cloudflare의 글로벌 네트워크를 사용하므로 매우 빠릅니다.

### Q: 여러 도메인을 사용할 수 있나요?
A: 네, 설정 파일에 여러 hostname을 추가할 수 있습니다.

---

## 다음 단계

1. ✅ Cloudflare Tunnel 설정 완료
2. ✅ 도메인 연결 완료
3. ✅ 환경 변수 설정 완료
4. 📝 프로덕션 배포 가이드 참고

---

## 참고 문서

- [Cloudflare Tunnel 공식 문서](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Cloudflare 대시보드](https://dash.cloudflare.com)
- [자동 설정 스크립트](setup-cloudflare-tunnel.ps1)

