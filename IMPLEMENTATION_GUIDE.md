# 🚀 AI 코드 편집 환경 구현 가이드

제공하신 내용을 Shell에 통합하여 "AI가 코드 + UI를 함께 편집하는 환경"을 구현합니다.

## ✅ 현재 Shell 상태

### 이미 구현된 기능
- ✅ 기본 코드 에디터 (`EnhancedCodeEditor`)
- ✅ AI 코드 제안 (`/api/ai/code-suggest`)
- ✅ AI 추천 (`AIRecommendation`)
- ✅ 무료 AI 통합 (Groq, Ollama, Together, OpenRouter 등)
- ✅ 프로젝트 리뷰 (`ProjectReview`)

### 추가해야 할 기능
- ❌ Monaco Editor 통합 (현재 textarea 기반)
- ❌ ChatGPT-like 대화 메모리 시스템
- ❌ Diff 기반 코드 수정 제안
- ❌ AI 튜터 모드 (코드 설명 + 수정 제안 통합)
- ❌ System Prompt 관리
- ❌ 대화 기억 요약 시스템

## 📋 구현 계획

### 1단계: Monaco Editor 통합 ⚡ (진행 중)

**목표**: textarea 기반 에디터를 Monaco Editor로 교체

**작업**:
1. ✅ `@monaco-editor/react` 설치 완료
2. ⏳ `EnhancedCodeEditor`를 Monaco Editor로 교체
3. ⏳ 코드 하이라이팅, 자동완성, IntelliSense 활성화
4. ⏳ 커서 위치 추적, 선택 영역 추적

**파일**:
- `components/EnhancedCodeEditor.tsx` (수정)
- `components/MonacoCodeEditor.tsx` (신규)

### 2단계: ChatGPT-like 대화 메모리 시스템

**목표**: 대화 기억, 요약, 토큰 제한 관리

**작업**:
1. ✅ `lib/services/ai-memory-manager.ts` 생성 완료
2. ⏳ API 엔드포인트 생성 (`/api/ai/chat`)
3. ⏳ 프론트엔드 대화 UI 구현
4. ⏳ System Prompt 관리 UI

**파일**:
- ✅ `lib/services/ai-memory-manager.ts` (완료)
- ✅ `lib/services/ai-prompt-manager.ts` (완료)
- ⏳ `app/api/ai/chat/route.ts` (신규)
- ⏳ `components/AIChatPanel.tsx` (신규)

### 3단계: Diff 기반 코드 수정 제안

**목표**: AI가 코드를 통째로 덮어쓰지 않도록 diff 형식으로만 수정 제안

**작업**:
1. ✅ `lib/services/diff-manager.ts` 생성 완료
2. ⏳ AI 응답에서 diff 추출 및 검증
3. ⏳ Diff UI 컴포넌트 (변경 사항 시각화)
4. ⏳ Diff 적용 기능

**파일**:
- ✅ `lib/services/diff-manager.ts` (완료)
- ⏳ `components/DiffViewer.tsx` (신규)
- ⏳ `components/DiffSuggestion.tsx` (신규)

### 4단계: AI 튜터 모드 통합 UI

**목표**: 코드 에디터 + AI 설명 패널 통합

**작업**:
1. ⏳ 레이아웃 구성 (에디터 왼쪽, AI 패널 오른쪽)
2. ⏳ 실시간 코드 분석 및 설명
3. ⏳ Diff 제안 표시 및 적용
4. ⏳ 대화 히스토리 표시

**파일**:
- ⏳ `components/AITutorEditor.tsx` (신규)
- ⏳ `components/CodeExplanationPanel.tsx` (신규)

### 5단계: System Prompt 관리

**목표**: AI의 "정체성"을 사용자가 커스터마이징

**작업**:
1. ✅ `lib/services/ai-prompt-manager.ts` 생성 완료
2. ⏳ System Prompt 설정 UI
3. ⏳ 모드별 프롬프트 전환 (기본/코드 편집/튜터)
4. ⏳ 커스텀 프롬프트 저장

**파일**:
- ✅ `lib/services/ai-prompt-manager.ts` (완료)
- ⏳ `components/PromptSettings.tsx` (신규)

### 6단계: 대화 기억 요약 시스템

**목표**: 토큰 제한 관리 및 대화 요약

**작업**:
1. ✅ 기본 메모리 관리 완료
2. ⏳ AI 기반 대화 요약 (무료 AI 사용)
3. ⏳ 요약 품질 개선
4. ⏳ 메모리 통계 표시

**파일**:
- ✅ `lib/services/ai-memory-manager.ts` (완료)
- ⏳ `app/api/ai/summarize/route.ts` (신규)

## 🎯 최종 목표

### 사용자 경험
```
┌─────────────────────┬─────────────────────┐
│  Monaco Editor      │  AI 튜터 패널       │
│  (코드 편집)        │  (설명 + 제안)      │
│                     │                     │
│  - 코드 입력        │  - 코드 설명        │
│  - AI 제안 적용     │  - Diff 제안        │
│  - 실시간 분석      │  - 대화 히스토리    │
└─────────────────────┴─────────────────────┘
```

### 핵심 기능
1. **Monaco Editor**: VS Code 수준의 편집 경험
2. **AI 튜터**: 코드를 설명하고 diff로 수정 제안
3. **대화 메모리**: ChatGPT처럼 대화 기억
4. **Diff 기반 수정**: 코드를 망가뜨리지 않음
5. **무료 AI**: Groq, Ollama 등 무료 AI 사용

## 📝 다음 단계

### 즉시 할 일
1. ✅ Monaco Editor 설치 완료
2. ⏳ `EnhancedCodeEditor`를 Monaco로 교체
3. ⏳ AI Chat API 구현
4. ⏳ 통합 UI 구현

### 사용자가 할 일
1. **테스트**: 각 기능이 제대로 작동하는지 확인
2. **피드백**: UI/UX 개선 사항 제안
3. **확장**: 추가 기능 요청

## 🔧 기술 스택

- **에디터**: Monaco Editor (VS Code 에디터)
- **AI**: Groq, Ollama, Together AI (무료)
- **메모리**: 메모리 기반 (실제로는 DB 권장)
- **Diff**: 자체 구현 (실제로는 `diff` 라이브러리 권장)

## 💡 핵심 원칙

1. **AI는 코드를 통째로 덮어쓰지 않는다**
2. **Diff 형식으로만 수정을 제안한다**
3. **대화를 기억하지만 토큰 제한을 관리한다**
4. **무료 AI를 우선 사용한다**

## 🎓 학습 포인트

이 구현을 통해 배울 수 있는 것:
- ChatGPT의 내부 구조 이해
- LLM + 메모리 + 프롬프트 설계
- Diff 알고리즘
- Monaco Editor 통합
- AI 튜터 시스템 설계
