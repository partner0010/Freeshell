# Shell - 통합 AI 솔루션

AI 검색, 콘텐츠 생성, 동영상 제작까지 모든 것을 하나로 통합한 올인원 AI 솔루션입니다.

## 주요 기능

### 1. AI 검색 엔진
- 실시간 맞춤형 페이지 생성
- 다중 AI 모델 지원 (GPT-4, Claude, Gemini)
- 음성 검색 지원
- 고급 검색 필터

### 2. Spark 워크스페이스
- 노코드 AI 에이전트
- 복잡한 작업 자동화
- 비디오, 문서, 프레젠테이션, 웹사이트 생성

### 3. AI 드라이브
- 생성된 콘텐츠 저장 및 관리
- 버전 관리
- 공유 및 협업

### 4. 포켓 - 올인원 동영상 제작
- **1단계**: ChatGPT로 대본 및 캐릭터 프롬프트 생성
- **2단계**: Google Wisk로 연출 장면 이미지 생성 (최대 50개)
- **3단계**: Google Wisk + Grok4로 애니메이션 생성
- **4단계**: MMAudio AI로 오디오 합성
- 3D 애니메이션, 실사형, 사진 복원형 지원

### 5. AI 에이전트 협력
- 검색 에이전트: 정보 수집
- 분석 에이전트: 데이터 분석
- 요약 에이전트: 내용 요약

### 6. 기타 기능
- 이미지 생성 (DALL-E 3)
- 번역 (다국어 지원)
- 교차 검색 (여러 검색 엔진 통합)
- 심층 연구 및 분석

## 기술 스택

- **Next.js 14** - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **Framer Motion** - 애니메이션
- **OpenAI API** - AI 기능 통합
- **React Markdown** - 마크다운 렌더링
- **Recharts** - 데이터 시각화
- **React Hot Toast** - 알림
- **Zustand** - 상태 관리
- **Prisma** - 데이터베이스 ORM
- **NextAuth** - 인증

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
# OpenAI API (필수 - 실제 AI 기능 사용 시)
OPENAI_API_KEY=sk-your-openai-api-key-here

# 선택사항
ANTHROPIC_API_KEY=your-anthropic-api-key-here
GOOGLE_API_KEY=your-google-api-key-here
KLING_API_KEY=your-kling-api-key-here
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 데이터베이스 (선택사항)
DATABASE_URL=your-database-url
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

**참고**: API 키 없이도 시뮬레이션 모드로 작동합니다. 실제 AI 기능을 사용하려면 OpenAI API 키가 필요합니다. 자세한 내용은 `AI_SETUP.md`를 참고하세요.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
shell/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   ├── auth/              # 인증 페이지
│   ├── dashboard/         # 대시보드
│   └── ...
├── components/            # React 컴포넌트
│   ├── Pocket.tsx        # 포켓 동영상 제작
│   ├── SearchEngine.tsx  # AI 검색 엔진
│   └── ...
├── lib/                   # 유틸리티 및 라이브러리
│   ├── video-production.ts  # 동영상 제작 엔진
│   ├── openai.ts         # OpenAI 통합
│   └── ...
└── public/                # 정적 파일
```

## 주요 기능 상세

### 포켓 - 동영상 제작 프로세스

1. **대본 생성**: ChatGPT가 주제를 바탕으로 대본과 캐릭터 프롬프트 생성
2. **이미지 생성**: Google Wisk (DALL-E 3)로 연출 장면 이미지 생성 (최대 50개)
3. **애니메이션**: Google Wisk + Grok4 (Kling AI)로 자연스러운 움직임 생성
4. **오디오 합성**: MMAudio AI로 배경 음악, 나레이션, 효과음 생성
5. **최종 합성**: 모든 요소를 하나의 영상으로 통합

### AI 에이전트 협력

여러 AI 에이전트가 순차적으로 협력하여 작업을 수행합니다:
- 검색 에이전트가 정보를 수집
- 분석 에이전트가 데이터를 분석
- 요약 에이전트가 최종 결과를 요약

## 라이선스

MIT

## 기여

기여를 환영합니다! 이슈를 열거나 Pull Request를 제출해주세요.

## 지원

문제가 발생하거나 질문이 있으시면 이슈를 열어주세요.
