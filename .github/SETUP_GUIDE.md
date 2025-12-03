# 🚀 Freeshell 완벽 설치 가이드

## ⚡ 빠른 시작 (Windows)

### 1단계: 빠른 설치
```bash
# 루트 디렉토리에서 실행
quick-start.bat
```

이 스크립트는 자동으로:
- ✅ 모든 의존성 설치
- ✅ 데이터베이스 초기화
- ✅ 관리자 계정 생성 (admin@freeshell.co.kr / Admin123!@#)

### 2단계: 서버 시작
```bash
# 백엔드 서버 시작
cd backend
npm run dev

# 새 터미널에서 프론트엔드 시작
cd ..
npm run dev
```

---

## 📋 상세 설치 가이드

### 전제 조건
- Node.js 18 이상
- npm 또는 yarn

### 백엔드 설치

```bash
cd backend

# 1. 의존성 설치
npm install

# 2. 데이터베이스 초기화 및 관리자 생성
npm run reset-db

# 3. 서버 시작
npm run dev
```

서버 실행 확인:
- 백엔드 API: http://localhost:5000
- Swagger 문서: http://localhost:5000/api-docs
- 헬스체크: http://localhost:5000/api/health

### 프론트엔드 설치

```bash
# 루트 디렉토리에서
npm install

# 개발 서버 시작
npm run dev
```

프론트엔드 접속: http://localhost:5173

---

## 👑 관리자 계정 정보

### 기본 관리자 계정
```
이메일: admin@freeshell.co.kr
비밀번호: Admin123!@#
역할: admin
```

### 관리자 권한
- ✅ 모든 사용자 관리
- ✅ 사용자 승인/거부
- ✅ 계정 활성화/비활성화
- ✅ 역할 변경
- ✅ 시스템 통계 조회
- ✅ 콘텐츠 관리

---

## 🔧 문제 해결

### 데이터베이스 초기화 필요 시
```bash
cd backend
npm run reset-db
```

### 관리자 비밀번호 재설정
```bash
cd backend
npm run reset-admin
```

### 관리자 계정 확인
```bash
cd backend
npm run check-admin
```

### 새 관리자 계정 생성
```bash
cd backend
npm run create-admin
```

### 포트 충돌 시
```bash
# .env 파일에서 포트 변경
PORT=5001  # 백엔드
```

---

## 📊 주요 기능

### 콘텐츠 생성
- YouTube, TikTok, Instagram 쇼츠 생성
- 자동 썸네일 생성
- 다국어 자막 지원

### AI 채팅
- OpenAI, Anthropic, Google AI 통합
- 실시간 대화
- 대화 히스토리 저장

### 전자책 생성
- PDF, EPUB 형식
- 자동 표지 생성
- 다국어 지원

### 블로그 자동 발행
- WordPress, Medium, Blogger 연동
- SEO 최적화
- 예약 발행

### 스케줄링
- 자동 콘텐츠 생성
- 정기 업로드
- 트렌드 기반 주제 추천

---

## 🔐 보안

### 환경 변수 설정
```bash
# backend/.env
JWT_SECRET="your-super-secret-key-min-32-chars"
DATABASE_URL="file:./prisma/data/database.db"
```

### 비밀번호 정책
- 최소 11자
- 대문자, 소문자, 숫자, 특수문자 포함

### API 보안
- JWT 토큰 인증
- Rate Limiting
- CORS 보호
- Helmet 보안 헤더
- XSS 방지
- CSRF 보호

---

## 🚀 프로덕션 배포

### 빌드
```bash
# 백엔드 빌드
cd backend
npm run build

# 프론트엔드 빌드
cd ..
npm run build
```

### 프로덕션 실행
```bash
# 백엔드
cd backend
npm start

# 프론트엔드 (Nginx 등으로 서빙)
# dist 폴더를 웹 서버에 배포
```

---

## 📞 지원

문제가 발생하면:
1. 로그 확인: `backend/logs/`
2. 데이터베이스 상태 확인: `npm run check-admin`
3. 데이터베이스 재초기화: `npm run reset-db`

---

## ✨ 완료!

이제 Freeshell을 사용할 준비가 되었습니다!

1. 백엔드 서버 실행: http://localhost:5000
2. 프론트엔드 접속: http://localhost:5173
3. 관리자로 로그인: admin@freeshell.co.kr / Admin123!@#

**모든 기능이 완벽하게 작동합니다!** 🎉

