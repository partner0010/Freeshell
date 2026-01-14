# 차세대 종합 콘텐츠 플랫폼 전체 전략

## 핵심 비전

**AI Orchestrator를 중심으로 콘텐츠 생성 → 유통 → 전문가 도움 → 수익이 하나의 생태계로 순환되는 차세대 종합 플랫폼**

## 전체 아키텍처

```
[User]
  ↓
[Unified Content Studio]
  ├─ 텍스트 생성
  ├─ 이미지 생성
  ├─ 숏폼 생성
  ├─ 영상 생성
  ├─ 음성 생성
  └─ 3D 콘텐츠
  ↓
[AI Orchestrator]
  ├─ Intent 분석
  ├─ Task Plan 생성
  ├─ Step 실행
  ├─ Engine 선택
  ├─ Fallback 처리
  └─ 결과 통합
  ↓
[Engines]
  ├─ Shortform Engine
  ├─ Image→Motion Engine
  ├─ Voice Engine
  ├─ Rule Engine (Fallback)
  └─ Expert Engine
  ↓
[Guard Systems]
  ├─ Ethics Guard
  ├─ Security Guard
  └─ Quality Guard
  ↓
[Content Feed / Expert Market / Revenue System]
  ├─ 콘텐츠 유통
  ├─ 전문가 매칭
  └─ 수익 분배
```

## 핵심 구성 요소

### 1. AI Orchestrator (중앙 제어)

**위치**: `orchestrator/core/`

**책임**:
- 사용자 Intent 분석
- Task Plan 생성
- Step 실행 관리
- Engine 선택 및 Fallback
- 결과 통합

**핵심 클래스**:
- `Orchestrator`: 메인 오케스트레이터
- `Task`: 작업 단위
- `Step`: 실행 단계
- `Engine`: 처리 엔진 (AI/Rule/Template/Expert)
- `StateMachine`: 상태 관리

**특징**:
- AI 실패 시 자동 Fallback
- 플러그인 기반 확장
- 상태 기반 실행

### 2. 콘텐츠 생성 엔진

#### 2.1 숏폼 생성 (Shortform Engine)

**위치**: `orchestrator/video/`

**기능**:
- Scene JSON 기반 영상 생성
- FFmpeg 렌더링 파이프라인
- GPU/CPU 자동 선택
- 자막, 음성, 배경 통합

**데이터 구조**:
- `Scene`: 장면 정보
- `Character`: 캐릭터 정보
- `Voice`: 음성 정보
- `Subtitle`: 자막 정보

**처리 흐름**:
```
User Prompt → Script → Scene JSON → Character → Voice → FFmpeg → MP4
```

#### 2.2 이미지 → 모션 (Image→Motion Engine)

**위치**: `orchestrator/motion/`

**기능**:
- 정적 이미지에 모션 적용
- 표정, 눈, 호흡, 고개 움직임
- AI/Rule 하이브리드 생성
- Scene 통합

**데이터 구조**:
- `MotionData`: 모션 데이터
- `ExpressionData`: 표정 데이터
- `EyeMotion`: 눈 모션
- `BreathMotion`: 호흡 모션

**처리 흐름**:
```
Image + Prompt → MotionData → Scene → Video
```

#### 2.3 음성 생성 (Voice Engine)

**위치**: `orchestrator/voice/` (구현 예정)

**기능**:
- TTS (Text-to-Speech)
- 감정 표현
- 남성/여성 음성
- Lip-sync 데이터 생성

### 3. Guard Systems

#### 3.1 Ethics Guard

**위치**: `orchestrator/ethics/`

**기능**:
- 윤리 가이드라인 검증
- 동의 확인
- 위험 평가
- 차단 플로우

**핵심 원칙**:
- ❌ "사람을 복제" → 금지
- ✅ "기억과 감정을 보존" → 허용

**처리 흐름**:
```
Request → Consent Check → Risk Assessment → Allow/Block/Warn
```

### 4. 전문가 시스템

**위치**: `orchestrator/expert/`

**기능**:
- 전문가 매칭
- 원격 지원
- 상태 확인
- 보안 점검
- 마켓플레이스

**수익 구조**:
- 서비스 수수료: 15-30%
- 마켓플레이스: 20-30%
- 구독: $9.99/월

### 5. 수익 시스템

**위치**: `orchestrator/revenue/`

**기능**:
- 크레딧 시스템
- 가격 전략
- 수익 예측
- 전환 전략

**수익원**:
1. 콘텐츠 크레딧: $6,396/월 (12%)
2. 전문가 중개: $22,650/월 (45%)
3. 프리미엄 AI: $3,998/월 (8%)
4. 교육/전자책: $4,296/월 (9%)
5. 기업용 관리: $12,968/월 (26%)

## 전체 워크플로우

### 1. 콘텐츠 생성 워크플로우

```
User Request
  ↓
Unified Content Studio
  ↓
AI Orchestrator
  ├─ Intent 분석
  ├─ Task Plan 생성
  └─ Step 실행
      ├─ Shortform Engine
      ├─ Image→Motion Engine
      ├─ Voice Engine
      └─ Rule Engine (Fallback)
  ↓
Ethics Guard 검증
  ↓
Content 생성
  ↓
Content Feed / 저장
```

### 2. 전문가 도움 워크플로우

```
User Request
  ↓
Expert Engine
  ↓
Expert Matcher
  ├─ 스킬 매칭
  ├─ 평점 확인
  └─ 가격 제안
  ↓
Expert 선택
  ↓
Service 제공
  ├─ 원격 지원
  ├─ 상태 확인
  └─ 보안 점검
  ↓
결제 및 수익 분배
```

### 3. 수익 순환 워크플로우

```
User
  ↓
Content 생성 (크레딧 소비)
  ↓
크레딧 부족
  ↓
플랜 업그레이드 제안
  ↓
유료 전환
  ↓
수익 발생
  ├─ 구독 수익
  ├─ 추가 크레딧
  └─ 전문가 수수료
  ↓
플랫폼 운영
  ├─ 서버 비용
  ├─ AI 비용
  └─ 개발 유지
```

## 통합 포인트

### 1. Orchestrator 통합

모든 엔진은 Orchestrator를 통해 통합:

```python
from orchestrator.core import Orchestrator
from orchestrator.video import ShortformEngine
from orchestrator.motion import MotionEngine
from orchestrator.expert import ExpertEngine

orchestrator = Orchestrator()
orchestrator.register_engine(ShortformEngine())
orchestrator.register_engine(MotionEngine())
orchestrator.register_engine(ExpertEngine())
```

### 2. Ethics Guard 통합

모든 요청은 Ethics Guard를 통과:

```python
from orchestrator.ethics import EthicsGuard, BlockingFlow

ethics_guard = EthicsGuard()
blocking_flow = BlockingFlow(ethics_guard)

# 요청 처리 전 검증
result = await blocking_flow.process_request(user_input, user_id)
if not result['allowed']:
    return error_response(result['message'])
```

### 3. Revenue System 통합

모든 사용은 크레딧 시스템과 연동:

```python
from orchestrator.revenue import CreditSystem, CreditType

credit_system = CreditSystem()

# 크레딧 확인
can_use, message = credit_system.can_use_credits(
    user_id, CreditType.SHORTFORM
)

# 크레딧 사용
if can_use:
    credit_system.use_credits(user_id, CreditType.SHORTFORM)
```

## 데이터 흐름

### 콘텐츠 생성 데이터 흐름

```
User Input (Text/Prompt)
  ↓
Orchestrator.process()
  ├─ Intent: "create_shortform"
  ├─ Task: ShortformGenerationTask
  └─ Steps:
      1. Script Generation
      2. Scene JSON Generation
      3. Character Generation
      4. Voice Generation
      5. Video Rendering
  ↓
Scene JSON Array
  ↓
FFmpeg Renderer
  ↓
MP4 Video File
  ↓
Content Feed / Storage
```

### 전문가 매칭 데이터 흐름

```
User Request
  ↓
ServiceRequest
  ├─ service_type
  ├─ description
  └─ budget
  ↓
Expert Matcher
  ├─ Skill Matching
  ├─ Rating Check
  └─ Price Comparison
  ↓
Matched Experts (5명)
  ↓
User Selection
  ↓
Service Session
  ↓
Payment & Revenue Split
```

## 핵심 차별화 요소

### 1. AI Orchestrator 중심
- 모든 기능이 Orchestrator를 통해 통합
- AI 실패 시 자동 Fallback
- 플러그인 기반 확장

### 2. 하이브리드 시스템
- AI + Rule 기반
- 항상 동작 보장
- 비용 최적화

### 3. Ethics First
- 윤리 가이드라인 준수
- 동의 기반 운영
- 위험 자동 차단

### 4. 전문가 생태계
- 전문가 수익화
- 사용자 도움
- 강력한 락인

### 5. 현실적 수익 모델
- 무료 사용자 유입
- 자연스러운 전환
- 지속 가능한 구조

## MVP 범위

### Phase 1 (MVP) - 포함 ✅

1. **AI Orchestrator**
   - 기본 Orchestrator
   - AI/Rule Engine
   - Fallback 처리

2. **숏폼 생성**
   - Scene JSON 기반
   - FFmpeg 렌더링
   - 기본 템플릿

3. **이미지 → 모션**
   - 기본 모션 적용
   - Rule 기반 생성

4. **Ethics Guard**
   - 기본 검증
   - 동의 확인

5. **전문가 매칭**
   - 기본 매칭
   - 실시간 채팅

6. **크레딧 시스템**
   - 기본 크레딧
   - 플랜 구분

### Phase 1 (MVP) - 제외 ❌

1. 고급 원격 제어
2. 서버 관리
3. 포렌식 도구
4. 마켓플레이스
5. 기업용 기능

## 확장 전략

### Phase 2 (3-6개월)

1. **고급 콘텐츠 생성**
   - 3D 콘텐츠
   - 고급 모션
   - 실시간 렌더링

2. **마켓플레이스**
   - 전자책 판매
   - 강의 플랫폼
   - 템플릿 마켓

3. **기업용 기능**
   - 원격 관리
   - 대량 처리
   - API 접근

### Phase 3 (6-12개월)

1. **고급 AI 기능**
   - 커스텀 모델
   - 실시간 학습
   - 멀티모달

2. **생태계 확장**
   - 플러그인 시스템
   - 외부 개발자
   - 오픈 API

3. **글로벌 확장**
   - 다국어 지원
   - 지역별 최적화
   - 글로벌 결제

## 성공 지표

### 사용자 지표
- 총 사용자 수
- 일일 활성 사용자 (DAU)
- 월간 활성 사용자 (MAU)
- 유료 전환율

### 수익 지표
- 월간 반복 수익 (MRR)
- 사용자당 평균 수익 (ARPU)
- 고객 획득 비용 (CAC)
- 고객 생애 가치 (LTV)

### 기술 지표
- AI 성공률
- Fallback 사용률
- 평균 응답 시간
- 시스템 가동률

## 다음 단계

### 즉시 구현 (1-2주)

1. **통합 테스트**
   - Orchestrator 통합
   - 엔진 연동
   - Guard 시스템 검증

2. **API 엔드포인트**
   - RESTful API
   - WebSocket (실시간)
   - 인증/인가

3. **프론트엔드 기본**
   - Unified Content Studio UI
   - 전문가 매칭 UI
   - 크레딧 관리 UI

### 단기 구현 (1-2개월)

1. **MVP 완성**
   - 모든 핵심 기능
   - 기본 UI/UX
   - 결제 통합

2. **테스트 및 최적화**
   - 성능 최적화
   - 보안 강화
   - 사용자 테스트

3. **베타 출시**
   - 제한적 출시
   - 피드백 수집
   - 개선 반영

---

**이 문서는 Cursor AI가 플랫폼 개발을 진행하는 기준 문서입니다.**
