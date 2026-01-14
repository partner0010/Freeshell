# 올인원 스튜디오 - 완전한 스펙 문서

## ✅ 완성된 5단계

### STEP 1: Scene & Character JSON 스펙 ✅
- **파일**: `lib/allinone-studio/scene-character-spec.ts`
- **내용**:
  - Scene JSON 스펙 (완전한 구조)
  - Character JSON 스펙 (2D/3D 공용)
  - Dialogue JSON 스펙
  - 예시 데이터 (Scene 1개, Character 1개)
  - 필드 설명 테이블

### STEP 2: 숏폼 자동 제작 AI 파이프라인 ✅
- **파일**: `lib/allinone-studio/shortform-pipeline.ts`
- **내용**:
  - 전체 파이프라인 흐름도
  - 단계별 입력/출력 데이터 구조
  - 자동화 가능 지점
  - 에디터와 연동 방식
  - 영화 제작으로 전환 구조

### STEP 3: 3D 캐릭터 + 표정·감정 시스템 ✅
- **파일**: `lib/allinone-studio/3d-character-system.ts`
- **내용**:
  - 캐릭터 데이터 구조 (3D 확장)
  - 표정 & 감정 시스템 구조
  - 립싱크 처리 흐름
  - 애니메이션 트리 구조
  - Scene 시스템과 연동 방식

### STEP 4: 콘텐츠 스튜디오 UI 설계 ✅
- **파일**: `lib/allinone-studio/ui-design.ts`
- **내용**:
  - 전체 메뉴 트리
  - 주요 화면 설명
  - 사용자 플로우
  - AI 도우미 위치와 역할
  - 모바일/웹 대응 전략

### STEP 5: Cursor AI 전용 프롬프트 세트 ✅
- **파일**: `lib/allinone-studio/ai-prompts-content.ts`
- **내용**:
  - 스토리 작가 AI System Prompt
  - 캐릭터 디자이너 AI System Prompt
  - 숏폼 제작 AI System Prompt
  - 감정 & 대사 분석 AI System Prompt
  - 에디터 도우미 AI System Prompt
  - 에디터 연동 시 호출 방식

## 📊 전체 시스템 구조 요약

### 데이터 흐름
```
사용자 프롬프트
    ↓
[Story Writer AI] → 스토리 & 대본
    ↓
[Character Designer AI] → 캐릭터 생성
    ↓
[Shortform Creator AI] → Scene 구성
    ↓
[Emotion Analyst AI] → 감정 매핑
    ↓
[Editor Assistant AI] → 개선 제안
    ↓
최종 프로젝트 (Scene + Character + Dialogue)
```

### 파일 구조
```
lib/allinone-studio/
├── scene-character-spec.ts      # STEP 1: JSON 스펙
├── shortform-pipeline.ts         # STEP 2: 파이프라인
├── 3d-character-system.ts       # STEP 3: 3D 시스템
├── ui-design.ts                  # STEP 4: UI 설계
├── ai-prompts-content.ts         # STEP 5: AI 프롬프트
├── schema.ts                     # 기본 스키마
└── ai-roles.ts                   # AI 역할 (기존)
```

## 🎯 핵심 특징

### 1. Scene 기반 구조
- 모든 콘텐츠는 Scene 단위
- Scene은 독립적으로 편집 가능
- Scene을 조합하여 영화 제작

### 2. 완전한 데이터 구조
- Scene: 배경, 카메라, 조명, 캐릭터, 대화, 음악
- Character: 외형, 음성, 표정, 동작
- Dialogue: 대사, 감정, 타이밍, 립싱크

### 3. AI 역할 분리
- 각 단계별 전문 AI
- 명확한 입력/출력 형식
- JSON 기반 통신

### 4. 확장 가능한 구조
- metadata 필드로 확장
- 새로운 블록 타입 추가 가능
- 3D/2D 공용 구조

## 🚀 사용 방법

### 1. 스토리 생성
```typescript
import { CONTENT_AI_PROMPTS } from '@/lib/allinone-studio/ai-prompts-content';

const systemPrompt = CONTENT_AI_PROMPTS['story-writer'];
// AI 호출하여 스토리 생성
```

### 2. 캐릭터 생성
```typescript
import { CharacterSpec } from '@/lib/allinone-studio/scene-character-spec';

const character: CharacterSpec = {
  // 캐릭터 데이터
};
```

### 3. 숏폼 자동 제작
```typescript
import { generateShortform } from '@/lib/allinone-studio/shortform-pipeline';

const output = await generateShortform({
  prompt: '행복한 고양이가 춤추는 숏폼',
  duration: 30,
  style: 'anime',
});
```

### 4. 3D 캐릭터 렌더링
```typescript
import { Character3DRenderer } from '@/lib/allinone-studio/3d-character-system';

const renderer = new Character3DRenderer();
await renderer.loadCharacter(character);
renderer.setExpression('expr-happy', 0.8);
```

## 📝 다음 단계 (구현)

1. **API 엔드포인트 구현**
   - 각 AI 역할별 API
   - 파이프라인 실행 API

2. **프론트엔드 UI 구현**
   - 프로젝트 편집기
   - 캐릭터 제작기
   - 타임라인 편집기

3. **3D 렌더링 엔진 통합**
   - Three.js 또는 Babylon.js
   - 캐릭터 로딩
   - 애니메이션 재생

4. **음성 & 음악 통합**
   - TTS API
   - 립싱크 생성
   - 배경 음악 생성

5. **렌더링 시스템**
   - 비디오 렌더링
   - 최종 출력

---

**올인원 스튜디오 완전한 스펙이 완성되었습니다!** 🎬
