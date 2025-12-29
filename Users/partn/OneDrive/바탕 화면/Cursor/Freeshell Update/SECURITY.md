# Shell 보안 가이드

## 🔒 보안 기능

### 1. 입력 검증 및 Sanitization
- **XSS 방지**: HTML 태그, JavaScript 이벤트 핸들러 제거
- **SQL Injection 방지**: SQL 키워드 패턴 검사
- **Command Injection 방지**: 시스템 명령어 패턴 검사
- **입력 길이 제한**: 최대/최소 길이 검증
- **타입 검증**: 문자열, 숫자, 이메일, URL 검증

### 2. Rate Limiting
- **API 요청 제한**: 
  - 일반 API: 1분에 100회
  - 검색 API: 1분에 50회
  - 모델 API: 1분에 30회
  - 이미지 생성 API: 1분에 20회
- **IP 기반 추적**: 클라이언트 IP 주소 기반 제한
- **자동 정리**: 만료된 Rate Limit 항목 자동 삭제

### 3. 보안 헤더
- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: SAMEORIGIN
- **X-XSS-Protection**: 1; mode=block
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: geolocation, microphone, camera 차단
- **Strict-Transport-Security**: HTTPS 강제 (프로덕션)
- **Content-Security-Policy**: 스크립트, 스타일, 이미지, 연결 소스 제한

### 4. 환경 변수 보안
- **서버 사이드 전용**: 클라이언트에서 환경 변수 접근 방지
- **민감 정보 마스킹**: 로그에 API 키 노출 방지
- **검증**: 필수 환경 변수 존재 확인
- **형식 검증**: API 키 형식 검증

### 5. CSRF 보호
- **토큰 생성**: 랜덤 CSRF 토큰 생성
- **토큰 검증**: 요청 시 토큰 검증
- **HttpOnly 쿠키**: JavaScript 접근 방지
- **SameSite**: Cross-site 요청 방지

### 6. API 보안
- **입력 검증**: 모든 API 엔드포인트에서 입력 검증
- **Rate Limiting**: 모든 API에 Rate Limiting 적용
- **에러 메시지**: 민감한 정보 노출 방지
- **API 키 보호**: 클라이언트에 API 키 노출 방지

## 🛡️ 보안 모범 사례

### 환경 변수 설정
```env
# 필수
NODE_ENV=production
NEXTAUTH_SECRET=your-secret-key-at-least-32-characters-long
NEXTAUTH_URL=https://freeshell.co.kr

# API 키
OPENAI_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=your-key-here
GOOGLE_API_KEY=your-key-here
```

### .gitignore 확인
다음 파일들이 `.gitignore`에 포함되어 있는지 확인:
- `.env`
- `.env.local`
- `.env*.local`

### 프로덕션 배포 시 확인 사항
1. ✅ HTTPS 강제 설정
2. ✅ 환경 변수 설정 확인
3. ✅ Rate Limiting 활성화
4. ✅ 보안 헤더 적용
5. ✅ 입력 검증 활성화
6. ✅ 에러 로깅 설정 (민감 정보 제외)

## 🔍 보안 점검 체크리스트

- [x] 입력 검증 및 Sanitization
- [x] Rate Limiting
- [x] 보안 헤더
- [x] 환경 변수 보안
- [x] CSRF 보호
- [x] API 보안
- [x] XSS 방지
- [x] SQL Injection 방지
- [x] Command Injection 방지
- [x] SSRF 방지 (URL 검증)

## 📝 보안 업데이트 내역

### 2024-01-XX
- ✅ 입력 검증 및 Sanitization 라이브러리 추가
- ✅ Rate Limiting 구현
- ✅ 보안 헤더 강화
- ✅ 환경 변수 보안 강화
- ✅ CSRF 보호 추가
- ✅ API 라우트 보안 강화
- ✅ Middleware 보안 적용

