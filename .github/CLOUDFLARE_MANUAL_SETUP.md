# Cloudflare Zero Trust 수동 설정 가이드

## 🚨 현재 문제

`https://freeshell.co.kr` 접속 시 **HTTP 403 Forbidden** 에러 발생

## ✅ 해결 방법

### 1단계: Cloudflare Zero Trust 대시보드 접속

```
https://one.dash.cloudflare.com
```

로그인 후 계정 선택

---

### 2단계: Access Policy 확인 및 제거

1. 왼쪽 메뉴: **Access → Applications**
2. `freeshell.co.kr` 관련 Application이 있는지 확인
3. 있다면:
   - 클릭 → **Edit**
   - **Delete Application** 클릭
   - 또는 Policy를 **Bypass**로 변경

---

### 3단계: Tunnel 설정 확인

1. 왼쪽 메뉴: **Networks → Tunnels**
2. `freeshell` 터널 찾기
3. 터널 상태가 **HEALTHY (초록색)** 인지 확인
4. **Configure** 버튼 클릭

---

### 4단계: Public Hostnames 설정

**Public Hostnames** 탭에서:

#### Hostname 1: 메인 도메인

- **Public hostname**: `freeshell.co.kr`
- **Service**: 
  - Type: `HTTP`
  - URL: `localhost:3000`
- **Additional application settings** (펼치기):
  - ✅ **No TLS Verify** 체크
  - **HTTP Host Header**: 비워두기
- **Save hostname** 클릭

#### Hostname 2: API 도메인

- **Public hostname**: `api.freeshell.co.kr`
- **Service**:
  - Type: `HTTP`
  - URL: `localhost:3001`
- **Additional application settings**:
  - ✅ **No TLS Verify** 체크
- **Save hostname** 클릭

---

### 5단계: 저장 및 확인

1. 모든 변경사항 **Save** 클릭
2. 터널이 **HEALTHY** 상태인지 재확인
3. **1-2분 대기** (설정 적용 시간)

---

### 6단계: 테스트

브라우저에서 접속:

```
https://freeshell.co.kr
```

✅ 정상적으로 로드되어야 함

---

## 🔍 문제 해결

### Public Hostname이 이미 존재하는 경우

1. 기존 hostname 클릭 → **Edit**
2. 설정 확인 및 수정:
   - URL이 `localhost:3000`인지 확인
   - **No TLS Verify** 체크 확인
3. **Save** 클릭

### 여전히 403 에러가 발생하는 경우

1. **Access → Applications** 에서 모든 정책 제거
2. 터널 재시작:
   - PowerShell에서 `cloudflared` 프로세스 종료
   - 다시 시작
3. 5-10분 대기 후 재시도

---

## 📝 현재 설정 정보

**터널 ID**: `10eec12a-9fda-4f30-b2ed-2e75b3b6d2cb`  
**터널 이름**: `freeshell`

**설정 파일**: `C:\Users\partn\.cloudflared\config.yml`

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

---

## 🌐 임시 해결책

Cloudflare 설정이 적용될 때까지:

**로컬 접속**: `http://localhost:3000`

**ngrok 사용**: 
```bash
ngrok http 3000
```

---

## 📞 추가 도움

1. Cloudflare Community: https://community.cloudflare.com
2. Cloudflare Zero Trust Docs: https://developers.cloudflare.com/cloudflare-one/

