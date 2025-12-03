# 🌐 freeshell.co.kr 도메인 설정 가이드

## 전체 프로세스

1. ✅ 도메인 구매 완료 (`freeshell.co.kr`)
2. ⏳ Cloudflare에 도메인 추가
3. ⏳ DNS 서버 변경
4. ⏳ Cloudflare Tunnel 로그인
5. ⏳ 터널 생성
6. ⏳ DNS 레코드 설정
7. ⏳ 환경 변수 설정
8. ⏳ 터널 실행 및 테스트

---

## 1단계: Cloudflare에 도메인 추가

### 방법 1: Cloudflare 대시보드에서 추가

1. **Cloudflare 대시보드 접속**
   - https://dash.cloudflare.com 접속
   - `partner0010@gmail.com`으로 로그인

2. **도메인 추가**
   - 우측 상단 **"Add a Site"** 또는 **"사이트 추가"** 클릭
   - `freeshell.co.kr` 입력
   - **"Add site"** 클릭

3. **플랜 선택**
   - **Free plan** 선택 (무료)
   - **Continue** 클릭

4. **DNS 레코드 스캔**
   - Cloudflare가 기존 DNS 레코드를 자동으로 스캔합니다
   - **Continue** 클릭

5. **DNS 서버 변경 안내**
   - Cloudflare가 2개의 네임서버를 제공합니다
   - 예: `alice.ns.cloudflare.com`, `bob.ns.cloudflare.com`
   - **이 네임서버 정보를 복사해두세요!**

---

## 2단계: 도메인 등록업체에서 DNS 서버 변경

### 도메인 등록업체 확인

도메인을 어디서 구매하셨나요?
- 가비아 (Gabia)
- 후이즈 (Whois)
- 카페24
- 기타

### DNS 서버 변경 방법 (일반)

1. **도메인 등록업체 사이트 로그인**
2. **도메인 관리** 메뉴로 이동
3. **DNS 설정** 또는 **네임서버 설정** 찾기
4. **네임서버 변경** 클릭
5. **Cloudflare에서 받은 2개의 네임서버 입력**
   - 예: `alice.ns.cloudflare.com`
   - 예: `bob.ns.cloudflare.com`
6. **저장** 또는 **적용**

### DNS 서버 변경 예시

**이전 (도메인 등록업체 네임서버):**
```
ns1.gabia.co.kr
ns2.gabia.co.kr
```

**변경 후 (Cloudflare 네임서버):**
```
alice.ns.cloudflare.com
bob.ns.cloudflare.com
```

---

## 3단계: DNS 전파 대기

- DNS 서버 변경 후 **최대 24시간** 소요 (보통 **5분~1시간**)
- Cloudflare 대시보드에서 **"Checking nameservers"** 상태 확인
- 전파 완료되면 **"Active"** 상태로 변경됨

---

## 4단계: Cloudflare Tunnel 설정

DNS 전파가 완료되면:

1. **터널 로그인**
   ```powershell
   cloudflared tunnel login
   ```

2. **터널 생성**
   ```powershell
   cloudflared tunnel create freeshell
   ```

3. **설정 파일 생성**
   - 위치: `C:\Users\[사용자명]\.cloudflared\config.yml`
   - 내용: (터널 ID는 생성 후 확인)

4. **DNS 레코드 설정**
   - Cloudflare 대시보드 → DNS → Records
   - CNAME 레코드 추가

---

## 5단계: DNS 레코드 설정 (Cloudflare 대시보드)

### 레코드 1: 루트 도메인 (메인 사이트)

- **Type**: `CNAME`
- **Name**: `@` (또는 `freeshell.co.kr`)
- **Target**: `[터널-ID].cfargotunnel.com`
- **Proxy status**: ✅ **Proxied** (주황색 구름)
- **TTL**: Auto
- **Save**

### 레코드 2: API 서브도메인

- **Type**: `CNAME`
- **Name**: `api`
- **Target**: `[터널-ID].cfargotunnel.com`
- **Proxy status**: ✅ **Proxied** (주황색 구름)
- **TTL**: Auto
- **Save**

---

## 6단계: 환경 변수 설정

### backend/.env

```env
FRONTEND_URL=https://freeshell.co.kr
```

### 프론트엔드 .env

```env
VITE_API_BASE_URL=https://api.freeshell.co.kr/api
```

---

## 7단계: 터널 실행

```powershell
cloudflared tunnel run freeshell
```

---

## 최종 접속 주소

- **프론트엔드**: https://freeshell.co.kr
- **백엔드 API**: https://api.freeshell.co.kr/api

---

## 문제 해결

### DNS 서버 변경이 안 됨

1. 도메인 등록업체에서 **네임서버 변경 권한** 확인
2. **24시간 이내**에 변경했는지 확인 (일부 업체는 제한 있음)
3. 도메인 등록업체 고객센터 문의

### DNS 전파가 안 됨

1. **DNS 전파 확인 도구** 사용:
   - https://www.whatsmydns.net
   - `freeshell.co.kr` 입력
   - Cloudflare 네임서버로 변경되었는지 확인

2. **최대 24시간** 대기 (보통 몇 분~1시간)

### Cloudflare에서 도메인을 찾을 수 없음

1. DNS 서버 변경이 완료되었는지 확인
2. Cloudflare 대시보드에서 **"Checking nameservers"** 상태 확인
3. 네임서버 정보가 정확한지 확인

---

## 다음 단계

1. ✅ Cloudflare에 도메인 추가
2. ✅ DNS 서버 변경
3. ✅ DNS 전파 대기
4. ⏳ Cloudflare Tunnel 설정
5. ⏳ DNS 레코드 설정
6. ⏳ 환경 변수 설정
7. ⏳ 터널 실행 및 테스트

