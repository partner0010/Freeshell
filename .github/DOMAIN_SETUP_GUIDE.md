# 🌐 도메인 연결 가이드

도메인 주소가 있으면 여러 방법으로 연결할 수 있습니다.

## 방법 1: ngrok 유료 플랜 (가장 간단)

### 장점
- ✅ 설정이 매우 간단
- ✅ SSL 인증서 자동 제공
- ✅ 안정적인 연결

### 단계

1. **ngrok 유료 플랜 구독**
   - https://ngrok.com/pricing
   - Starter 플랜 ($8/월) 이상 필요
   - 또는 무료 플랜에서 도메인 예약 (제한적)

2. **도메인 추가**
   ```powershell
   # ngrok 대시보드에서 도메인 추가
   # https://dashboard.ngrok.com/domains
   ```

3. **고정 주소로 터널 시작**
   ```powershell
   # 백엔드
   ngrok http 3001 --domain=your-backend-domain.com
   
   # 프론트엔드
   ngrok http 3000 --domain=your-frontend-domain.com
   ```

4. **환경 변수 설정**
   ```env
   # backend/.env
   FRONTEND_URL=https://your-frontend-domain.com
   
   # 프론트엔드에서도 API 주소 설정
   VITE_API_BASE_URL=https://your-backend-domain.com/api
   ```

---

## 방법 2: Cloudflare Tunnel (무료, 추천!)

### 장점
- ✅ 완전 무료
- ✅ 고정 도메인 사용 가능
- ✅ SSL 자동 제공
- ✅ 빠른 속도

### 단계

1. **Cloudflare 계정 생성**
   - https://dash.cloudflare.com/sign-up
   - 도메인 추가 (이미 있으면 스킵)

2. **Cloudflared 설치**
   ```powershell
   # Windows
   winget install --id Cloudflare.cloudflared
   
   # 또는 직접 다운로드
   # https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
   ```

3. **터널 로그인**
   ```powershell
   cloudflared tunnel login
   ```

4. **터널 생성**
   ```powershell
   cloudflared tunnel create freeshell
   ```

5. **설정 파일 생성**
   ```yaml
   # ~/.cloudflared/config.yml
   tunnel: [터널-ID]
   credentials-file: C:\Users\[사용자명]\.cloudflared\[터널-ID].json
   
   ingress:
     - hostname: api.yourdomain.com
       service: http://localhost:3001
     - hostname: yourdomain.com
       service: http://localhost:3000
     - service: http_status:404
   ```

6. **DNS 레코드 추가**
   - Cloudflare 대시보드에서:
   - `api.yourdomain.com` → CNAME → `[터널-ID].cfargotunnel.com`
   - `yourdomain.com` → CNAME → `[터널-ID].cfargotunnel.com`

7. **터널 실행**
   ```powershell
   cloudflared tunnel run freeshell
   ```

8. **환경 변수 설정**
   ```env
   # backend/.env
   FRONTEND_URL=https://yourdomain.com
   ```

---

## 방법 3: 직접 도메인 연결 (포트 포워딩)

### 장점
- ✅ 완전 무료
- ✅ 직접 제어 가능

### 단계

1. **공인 IP 확인**
   ```powershell
   # 공인 IP 확인
   Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing
   ```

2. **포트 포워딩 설정**
   - 공유기 관리 페이지 접속
   - 포트 포워딩 설정:
     - 외부 포트 80 → 내부 IP:3000 (프론트엔드)
     - 외부 포트 443 → 내부 IP:3000 (프론트엔드)
     - 외부 포트 3001 → 내부 IP:3001 (백엔드)

3. **DNS A 레코드 설정**
   - 도메인 관리 콘솔에서:
   - `yourdomain.com` → A 레코드 → 공인 IP
   - `api.yourdomain.com` → A 레코드 → 공인 IP

4. **동적 IP인 경우 (DDNS)**
   ```powershell
   # DDNS 서비스 사용 (예: No-IP, Duck DNS)
   # 또는 Cloudflare API로 자동 업데이트
   ```

5. **SSL 인증서 설치 (Let's Encrypt)**
   ```powershell
   # Certbot 설치
   # https://certbot.eff.org/
   
   certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com
   ```

6. **환경 변수 설정**
   ```env
   # backend/.env
   FRONTEND_URL=https://yourdomain.com
   ```

---

## 방법 4: localtunnel (무료, 간단)

### 장점
- ✅ 완전 무료
- ✅ 설정 간단
- ⚠️ 주소가 매번 변경 (무료 플랜)

### 단계

1. **localtunnel 설치**
   ```powershell
   npm install -g localtunnel
   ```

2. **터널 시작**
   ```powershell
   # 백엔드
   lt --port 3001 --subdomain your-backend-name
   
   # 프론트엔드
   lt --port 3000 --subdomain your-frontend-name
   ```

3. **환경 변수 설정**
   ```env
   FRONTEND_URL=https://your-frontend-name.loca.lt
   ```

---

## 추천 방법 비교

| 방법 | 비용 | 난이도 | 고정 주소 | SSL | 추천도 |
|------|------|--------|----------|-----|--------|
| **Cloudflare Tunnel** | 무료 | 중 | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **ngrok 유료** | $8/월 | 쉬움 | ✅ | ✅ | ⭐⭐⭐⭐ |
| **직접 연결** | 무료 | 어려움 | ✅ | ✅ | ⭐⭐⭐ |
| **localtunnel** | 무료 | 쉬움 | ❌ | ✅ | ⭐⭐ |

---

## 환경 변수 설정

도메인 연결 후 반드시 설정해야 합니다:

### backend/.env
```env
# 프론트엔드 URL
FRONTEND_URL=https://yourdomain.com

# CORS 허용
ALLOWED_ORIGINS=https://yourdomain.com
```

### 프론트엔드 환경 변수
```env
# .env 또는 .env.production
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### 코드에서 확인
```typescript
// backend/src/index.ts
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:3000']
```

---

## 테스트

### 1. Health Check
```powershell
Invoke-WebRequest -Uri "https://api.yourdomain.com/api/health" -UseBasicParsing
```

### 2. 프론트엔드 접속
```powershell
Start-Process "https://yourdomain.com"
```

### 3. CORS 확인
- 브라우저 개발자 도구 → Network 탭
- CORS 에러가 없는지 확인

---

## 문제 해결

### CORS 에러
- `FRONTEND_URL` 환경 변수 확인
- 백엔드 재시작

### SSL 인증서 오류
- Cloudflare Tunnel: 자동 처리됨
- 직접 연결: Let's Encrypt 재발급

### 연결 안 됨
- 방화벽 확인
- 포트 포워딩 확인
- DNS 전파 확인 (최대 24시간)

---

## 다음 단계

1. ✅ 도메인 연결 완료
2. ✅ 환경 변수 설정
3. ✅ 테스트 완료
4. 📝 프로덕션 배포 가이드 참고

---

## 참고 문서

- [Cloudflare Tunnel 문서](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [ngrok 도메인 설정](https://ngrok.com/docs/cloud-edge/domains/)
- [Let's Encrypt 가이드](https://letsencrypt.org/getting-started/)

