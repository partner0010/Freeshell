# 🚀 Freeshell - 올인원 콘텐츠 AI 플랫폼

올인원 콘텐츠 생성, 관리, 배포를 위한 AI 기반 플랫폼입니다.

## ✨ 주요 기능

- 🤖 **AI 콘텐츠 생성** - OpenAI/Claude를 활용한 자동 콘텐츠 생성
- 📹 **비디오 생성** - 텍스트에서 비디오 자동 생성
- 📝 **블로그 관리** - 블로그 포스트 생성 및 배포
- 📚 **전자책 생성** - E-book 자동 생성
- 📊 **분석 대시보드** - 콘텐츠 성과 분석
- 🔄 **자동 배포** - YouTube, TikTok 등 플랫폼 자동 업로드
- 📅 **스케줄링** - 콘텐츠 자동 생성 및 배포 스케줄

## 🛠️ 기술 스택

### 백엔드
- Node.js + Express + TypeScript
- Prisma ORM
- SQLite (개발) / PostgreSQL (프로덕션)

### 프론트엔드
- React + Vite + TypeScript
- Tailwind CSS
- Zustand (상태 관리)

### 보안
- JWT 인증
- Rate Limiting
- CORS 보안
- 입력 검증 및 Sanitization
- 침입 탐지 시스템

## 🚀 빠른 시작

### 필수 요구사항
- Node.js 18 이상
- npm 또는 yarn

### 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/partner0010/Freeshell.git
cd Freeshell
```

2. **백엔드 설정**
```bash
cd backend
npm install
cp .env.example .env  # 환경 변수 설정
npx prisma generate
npx prisma migrate dev
npm run dev
```

3. **프론트엔드 설정**
```bash
# 새 터미널에서
npm install
npm run dev
```

4. **접속**
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:3001

## 📚 문서

- [설정 가이드](SETUP_GUIDE.md)
- [배포 가이드](DEPLOYMENT_GUIDE.md)
- [보안 체크리스트](SECURITY_CHECKLIST.md)
- [보안 테스트 리포트](PENETRATION_TEST_REPORT.md)
- [프로젝트 완료 리포트](PROJECT_COMPLETE.md)

## 🔒 보안

모든 보안 테스트를 통과했습니다:
- ✅ SQL Injection 방지
- ✅ XSS 방지
- ✅ 인증 우회 방지
- ✅ Rate Limiting 작동
- ✅ CORS 보안 정상

자세한 내용은 [보안 문서](SECURITY_AUDIT_REPORT.md)를 참고하세요.

## 📦 배포

프로덕션 배포는 [배포 가이드](DEPLOYMENT_GUIDE.md)를 참고하세요.

### 권장 배포 플랫폼
- **Railway** - 간단하고 빠른 배포
- **AWS Lightsail** - 저렴한 가격, 완전한 제어
- **Vercel + Railway** - 프론트엔드 + 백엔드 분리 배포

## 🤝 기여

이슈나 풀 리퀘스트를 환영합니다!

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.

---

**프로젝트 상태**: ✅ 프로덕션 준비 완료

