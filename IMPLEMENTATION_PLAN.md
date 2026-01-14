# 구현 계획

## Phase 1 구현 순서

### Step 1: 프로젝트 초기화 (1일)
- [ ] Next.js 프로젝트 생성
- [ ] TypeScript 설정
- [ ] Tailwind CSS 설정
- [ ] shadcn/ui 설치
- [ ] 기본 디렉토리 구조 생성

### Step 2: 데이터베이스 설정 (1일)
- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 스키마 생성
- [ ] Prisma/Drizzle ORM 설정
- [ ] 마이그레이션 실행

### Step 3: 인증 시스템 (2일)
- [ ] NextAuth.js 설정
- [ ] 소셜 로그인 (Google, GitHub)
- [ ] 사용자 프로필 페이지
- [ ] 인증 미들웨어

### Step 4: AI Orchestrator (3일)
- [ ] Provider 인터페이스 정의
- [ ] Ollama 통합
- [ ] HuggingFace API 통합
- [ ] Groq API 통합
- [ ] Together API 통합
- [ ] Fallback 로직 구현
- [ ] 모니터링 시스템

### Step 5: 텍스트 생성 기능 (2일)
- [ ] 프롬프트 입력 UI
- [ ] AI 생성 API
- [ ] 결과 표시/편집
- [ ] 저장 기능

### Step 6: 이미지 생성 기능 (2일)
- [ ] 이미지 프롬프트 UI
- [ ] AI 이미지 생성 API
- [ ] 이미지 뷰어
- [ ] 다운로드 기능

### Step 7: 템플릿 시스템 (2일)
- [ ] 템플릿 데이터베이스
- [ ] 템플릿 갤러리 UI
- [ ] 템플릿 검색/필터
- [ ] 템플릿 사용 기능

### Step 8: 대시보드 (2일)
- [ ] 콘텐츠 목록
- [ ] 사용량 통계
- [ ] 빠른 액션 버튼

### Step 9: 테스트 & 배포 (2일)
- [ ] 통합 테스트
- [ ] 성능 최적화
- [ ] 배포 준비

---

## 핵심 파일 생성 순서

1. `lib/ai/orchestrator.ts` - AI 오케스트레이터
2. `lib/ai/providers/` - AI Provider 구현
3. `app/api/ai/generate/route.ts` - AI 생성 API
4. `app/(create)/text/page.tsx` - 텍스트 생성 페이지
5. `app/(create)/image/page.tsx` - 이미지 생성 페이지
6. `components/ai/PromptInput.tsx` - 프롬프트 입력 컴포넌트
7. `components/ai/GenerationResult.tsx` - 결과 표시 컴포넌트

---

**시작 준비 완료!**
