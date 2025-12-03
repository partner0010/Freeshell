# 🌐 가비아 도메인 DNS 서버 변경 가이드 (freeshell.co.kr)

## 전체 프로세스

1. ✅ Cloudflare에 도메인 추가
2. ⏳ 가비아에서 DNS 서버 변경
3. ⏳ DNS 전파 대기
4. ⏳ Cloudflare Tunnel 설정

---

## 1단계: Cloudflare에 도메인 추가

### Cloudflare 대시보드에서 도메인 추가

1. **브라우저에서 접속**
   - https://dash.cloudflare.com
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

5. **네임서버 정보 확인**
   - Cloudflare가 2개의 네임서버를 제공합니다
   - 예시:
     ```
     alice.ns.cloudflare.com
     bob.ns.cloudflare.com
     ```
   - **이 정보를 복사해두세요!** (가비아에서 사용할 예정)

---

## 2단계: 가비아에서 DNS 서버 변경

### 가비아 사이트 접속 및 로그인

1. **가비아 접속**
   - https://www.gabia.com 접속
   - 로그인

2. **도메인 관리 메뉴로 이동**
   - 상단 메뉴에서 **"도메인"** 클릭
   - 또는 **"마이페이지"** → **"도메인 관리"** 클릭

3. **도메인 선택**
   - `freeshell.co.kr` 도메인 찾기
   - 도메인 옆 **"관리"** 또는 **"설정"** 클릭

4. **네임서버 변경**
   - **"네임서버 설정"** 또는 **"DNS 설정"** 메뉴 클릭
   - **"네임서버 변경"** 또는 **"DNS 서버 변경"** 클릭

5. **Cloudflare 네임서버 입력**
   - 기존 네임서버를 삭제하고
   - Cloudflare에서 받은 2개의 네임서버 입력:
     ```
     alice.ns.cloudflare.com
     bob.ns.cloudflare.com
     ```
   - (실제로 받은 네임서버로 변경하세요)

6. **저장/적용**
   - **"저장"** 또는 **"적용"** 클릭
   - 변경 확인 메시지 확인

### 가비아 네임서버 변경 화면 예시

**변경 전:**
```
ns1.gabia.co.kr
ns2.gabia.co.kr
```

**변경 후:**
```
alice.ns.cloudflare.com
bob.ns.cloudflare.com
```

---

## 3단계: DNS 전파 대기

### 전파 확인

1. **Cloudflare 대시보드 확인**
   - https://dash.cloudflare.com
   - 도메인 선택
   - 상태가 **"Checking nameservers"** → **"Active"**로 변경될 때까지 대기

2. **전파 시간**
   - 보통 **5분~1시간** 소요
   - 최대 **24시간**까지 걸릴 수 있음

3. **전파 확인 도구 사용 (선택)**
   - https://www.whatsmydns.net
   - `freeshell.co.kr` 입력
   - Cloudflare 네임서버로 변경되었는지 확인

---

## 4단계: DNS 전파 완료 후

DNS 전파가 완료되면 (Cloudflare 대시보드에서 "Active" 상태):

1. ✅ Cloudflare Tunnel 로그인
2. ✅ 터널 생성
3. ✅ 설정 파일 생성
4. ✅ DNS 레코드 설정
5. ✅ 환경 변수 설정
6. ✅ 터널 실행

---

## 문제 해결

### 가비아에서 네임서버 변경이 안 됨

1. **도메인 잠금 해제 확인**
   - 가비아 도메인 관리에서 **"도메인 잠금"** 또는 **"Transfer Lock"** 해제
   - 일부 도메인은 잠금 상태일 수 있음

2. **변경 권한 확인**
   - 도메인 등록 후 **24시간 이내**에는 변경이 제한될 수 있음
   - 가비아 고객센터 문의: 1588-5821

3. **화면이 다를 경우**
   - 가비아 사이트 업데이트로 메뉴 위치가 다를 수 있음
   - **"도메인"** → **"DNS 설정"** 또는 **"네임서버"** 메뉴 찾기

### DNS 전파가 너무 오래 걸림

1. **브라우저 캐시 삭제**
2. **다른 네트워크에서 확인** (모바일 데이터 등)
3. **최대 24시간 대기** (보통 몇 분~1시간)

---

## 다음 단계

1. ⏳ Cloudflare에 도메인 추가 (지금 할 일)
2. ⏳ 가비아에서 DNS 서버 변경 (지금 할 일)
3. ⏳ DNS 전파 대기 (5분~1시간)
4. ⏳ Cloudflare Tunnel 설정 (전파 완료 후)

---

## 참고

- 가비아 고객센터: 1588-5821
- Cloudflare 지원: https://dash.cloudflare.com/support
- DNS 전파 확인: https://www.whatsmydns.net

