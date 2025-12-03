# 🚀 Freeshell 완벽 시작 가이드

> **모든 기능이 완벽하게 작동하는 올인원 콘텐츠 AI 플랫폼**

## ⚡ 빠른 시작 (3단계)

### 1️⃣ 데이터베이스 초기화 및 관리자 생성

```bash
cd backend
npm install
npm run reset-db
```

**자동으로 수행되는 작업:**
- ✅ 데이터베이스 파일 생성
- ✅ 테이블 마이그레이션
- ✅ 관리자 계정 자동 생성
- ✅ 환경 변수 자동 설정

### 2️⃣ 백엔드 서버 시작

```bash
# backend 폴더에서
npm run dev
```

**서버 실행 확인:**
- 🌐 API 서버: http://localhost:5000
- 📚 Swagger 문서: http://localhost:5000/api-docs
- 💚 헬스체크: http://localhost:5000/api/health

### 3️⃣ 프론트엔드 시작

```bash
# 루트 폴더에서 (새 터미널)
npm install
npm run dev
```

**프론트엔드 접속:**
- 🎨 웹사이트: http://localhost:5173

---

## 👑 관리자 로그인

### 기본 관리자 계정
```
이메일: admin@freeshell.co.kr
비밀번호: Admin123!@#
```

### 로그인 후 확인사항
1. ✅ 상단 네비게이션에 "👑 마스터 컨트롤" 메뉴 표시
2. ✅ `/admin` 페이지 접근 가능
3. ✅ 모든 사용자 관리 기능 사용 가능

---

## 📋 시스템 요구사항

### 필수 소프트웨어
- **Node.js**: 18.0.0 이상
- **npm**: 9.0.0 이상

### 권장 사양
- **RAM**: 4GB 이상
- **디스크**: 10GB 이상 여유 공간

---

## 🔧 문제 해결

### ❌ 데이터베이스 오류
```bash
cd backend
npm run reset-db
```

### ❌ 포트 충돌
```bash
# backend/.env 파일 수정
PORT=5001  # 다른 포트 번호로 변경
```

### ❌ 관리자 로그인 안됨
```bash
cd backend

# 관리자 확인
npm run check-admin

# 관리자 비밀번호 재설정
npm run reset-admin

# 새 관리자 생성
npm run create-admin
```

### ❌ npm install 오류
```bash
# 캐시 삭제 후 재시도
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 주요 기능

### 1. 콘텐츠 자동 생성
- 🎥 YouTube, TikTok, Instagram 쇼츠
- 🎨 자동 썸네일 생성
- 🎵 배경음악 및 효과음
- 📝 자막 자동 생성 (다국어)
- 🎬 비디오 편집 및 합성

### 2. AI 채팅
- 🤖 OpenAI GPT-4
- 🧠 Anthropic Claude
- 🔮 Google Gemini
- 💬 실시간 대화
- 📚 히스토리 저장

### 3. 전자책 생성
- 📖 PDF, EPUB 형식
- 🎨 표지 자동 생성
- 🌍 다국어 지원
- 📝 목차 자동 생성
- 💰 판매 플랫폼 연동

### 4. 블로그 자동 발행
- 📰 WordPress, Medium, Blogger
- 🔍 SEO 최적화
- 📅 예약 발행
- 🏷️ 태그 자동 생성
- 📊 성과 분석

### 5. 수익 관리
- 💰 실시간 수익 통계
- 📈 플랫폼별 분석
- 💳 결제 연동
- 📊 대시보드

### 6. 스케줄링
- ⏰ 자동 콘텐츠 생성
- 📅 정기 업로드
- 🔥 트렌드 기반 주제
- 📝 템플릿 관리

### 7. 관리자 기능
- 👥 사용자 관리
- ✅ 회원 승인/거부
- 🔒 권한 관리
- 📊 시스템 통계
- 🔍 자동 점검

---

## 🎯 사용 흐름

### 일반 사용자
1. 회원가입 → 관리자 승인 대기
2. 승인 후 로그인
3. 콘텐츠 생성
4. 플랫폼 연동
5. 자동 업로드
6. 수익 확인

### 관리자
1. 관리자 계정으로 로그인
2. `/admin` 페이지 접속
3. 승인 대기 사용자 관리
4. 시스템 모니터링
5. 자동 점검 실행
6. 성능 최적화

---

## 🔐 보안 기능

### 인증 & 권한
- ✅ JWT 토큰 인증 (30일 유효)
- ✅ bcrypt 비밀번호 해싱 (12 rounds)
- ✅ 역할 기반 접근 제어 (RBAC)
- ✅ 관리자 승인 시스템

### API 보안
- ✅ Rate Limiting (요청 제한)
- ✅ CORS 정책
- ✅ Helmet 보안 헤더
- ✅ XSS 방지
- ✅ SQL Injection 방지
- ✅ CSRF 보호

### 데이터 보호
- ✅ 민감 정보 암호화
- ✅ 안전한 세션 관리
- ✅ 로그 보안 처리
- ✅ 환경 변수 보호

---

## 📚 API 문서

### Swagger UI
http://localhost:5000/api-docs

### 주요 엔드포인트

#### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보
- `POST /api/auth/forgot-password` - 비밀번호 찾기
- `POST /api/auth/reset-password` - 비밀번호 재설정

#### 콘텐츠
- `POST /api/content/generate` - 콘텐츠 생성
- `GET /api/content` - 콘텐츠 목록
- `GET /api/content/:id` - 콘텐츠 상세
- `PUT /api/content/:id` - 콘텐츠 수정
- `DELETE /api/content/:id` - 콘텐츠 삭제

#### 관리자
- `GET /api/admin/users` - 사용자 목록
- `PUT /api/admin/users/:id/approve` - 사용자 승인
- `PUT /api/admin/users/:id/role` - 역할 변경
- `GET /api/admin/stats` - 통계 조회

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

### 환경 변수 설정
```bash
# backend/.env
NODE_ENV=production
PORT=5000
DATABASE_URL="file:./prisma/data/database.db"
JWT_SECRET="your-production-secret-min-32-chars"
FRONTEND_URL="https://yourdomain.com"
```

### 실행
```bash
# 백엔드
cd backend
npm start

# 프론트엔드 (Nginx 등으로 서빙)
# dist 폴더를 웹 서버에 배포
```

---

## 📞 지원 & 문의

### 로그 확인
```bash
# 백엔드 로그
cat backend/logs/combined.log
cat backend/logs/error.log
```

### 데이터베이스 관리
```bash
# Prisma Studio 실행
cd backend
npx prisma studio
```

### 관리자 도구
```bash
cd backend

# 관리자 확인
npm run check-admin

# 비밀번호 재설정
npm run reset-admin

# 새 관리자 생성
npm run create-admin
```

---

## ✅ 체크리스트

### 설치 완료 확인
- [ ] Node.js 18+ 설치됨
- [ ] npm 패키지 설치 완료
- [ ] 데이터베이스 초기화 완료
- [ ] 관리자 계정 생성 완료
- [ ] 백엔드 서버 실행 중
- [ ] 프론트엔드 서버 실행 중

### 기능 테스트
- [ ] 관리자 로그인 성공
- [ ] 관리자 페이지 접근 가능
- [ ] 일반 사용자 회원가입 가능
- [ ] 사용자 승인 기능 작동
- [ ] 콘텐츠 생성 가능
- [ ] AI 채팅 작동

---

## 🎉 완료!

**모든 설정이 완료되었습니다!**

이제 Freeshell을 사용하여:
- ✨ AI 기반 콘텐츠 자동 생성
- 📈 다중 플랫폼 동시 업로드
- 💰 수익 자동 추적
- 🤖 AI 어시스턴트 활용
- 📚 전자책 자동 생성
- 📰 블로그 자동 발행

**즐거운 콘텐츠 제작 되세요!** 🚀✨

---

## 📌 중요 참고사항

### 비밀번호 정책
- 최소 11자 이상
- 대문자, 소문자, 숫자, 특수문자 포함 필수

### 관리자 승인
- 일반 사용자는 회원가입 후 관리자 승인 필요
- 관리자는 승인 없이 즉시 사용 가능

### API 제한
- 일반 사용자: 시간당 100회
- 관리자: 무제한

### AI 사용 제한
- 일반 사용자: 일 100회, 월 3000회
- 관리자: 무제한

---

**Version**: 2.0.0  
**Last Updated**: 2024-12-03  
**Status**: ✅ 완벽 작동 (에러 없음)

