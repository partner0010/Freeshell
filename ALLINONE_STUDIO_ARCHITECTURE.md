# 올인원 스튜디오 - 전체 시스템 아키텍처

## 🎯 시스템 개요

AI 기반 올인원 콘텐츠 제작 플랫폼
- 영상 / 숏폼 / 이미지 / 캐릭터 / 음성 / 음악
- 2D + 3D 지원
- 표정 / 제스처 / 감정 표현
- 대화형 캐릭터
- 영화·애니메이션 제작

## 🏗️ 전체 시스템 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    프론트엔드 (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ 메인 대시보드 │  │ 콘텐츠 생성   │  │ 프로젝트 편집 │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              API 서버 (Next.js API Routes)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ /api/allinone-studio/generate                        │   │
│  │ /api/allinone-studio/character                       │   │
│  │ /api/allinone-studio/scene                           │   │
│  │ /api/allinone-studio/render                          │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌───▼──────┐ ┌─────▼──────┐
│ Story &      │ │ Character │ │ Scene      │
│ Script AI    │ │ Generator │ │ Composer   │
└──────────────┘ └───────────┘ └────────────┘
        │              │              │
┌───────▼──────┐ ┌───▼──────┐ ┌─────▼──────┐
│ Animation &  │ │ Voice &   │ │ Video      │
│ Expression   │ │ Music     │ │ Renderer   │
└──────────────┘ └───────────┘ └────────────┘
```

## 📊 데이터 구조

### 1. Scene (장면)
```typescript
interface Scene {
  id: string;
  name: string;
  type: 'shortform' | 'video' | 'animation' | 'movie';
  background: {
    type: 'image' | 'video' | '3d' | 'color';
    source: string;
  };
  camera: {
    position: { x, y, z };
    rotation: { x, y, z };
  };
  characters: Character[];
  dialogues: Dialogue[];
  music: {
    type: 'bgm' | 'sfx';
    track?: string;
    volume: number;
  };
  timing: {
    start: number;
    duration: number;
  };
}
```

### 2. Character (캐릭터)
```typescript
interface Character {
  id: string;
  name: string;
  gender: 'male' | 'female';
  style: 'anime' | 'realistic' | 'cartoon' | '3d';
  appearance: {
    face: string;
    hair: string;
    clothes: string;
  };
  voice: {
    type: 'male' | 'female';
    age: 'child' | 'teen' | 'adult';
    tone: 'soft' | 'normal' | 'loud';
  };
  expressions: Expression[];
  motions: Motion[];
}
```

### 3. Dialogue (대화)
```typescript
interface Dialogue {
  id: string;
  characterId: string;
  text: string;
  emotion: EmotionState;
  expression?: string;
  motion?: string;
  timing: {
    start: number;
    duration: number;
  };
  voice?: {
    text: string;
    voiceId?: string;
    speed?: number;
    pitch?: number;
  };
  lipSync?: {
    enabled: boolean;
    data?: number[];
  };
}
```

## 🤖 AI 역할 분리

### 1. Story & Script AI
- **역할**: 스토리와 대본 작성
- **입력**: 사용자 요구사항
- **출력**: Scene 단위 스크립트, 대화, 캐릭터 정의

### 2. Character Generator AI
- **역할**: 캐릭터 생성
- **입력**: 스토리 정보
- **출력**: 캐릭터 외형, 음성, 표정, 동작 정의

### 3. Scene Composer AI
- **역할**: 장면 구성
- **입력**: 스크립트, 캐릭터
- **출력**: 배경, 카메라, 조명, 캐릭터 배치

### 4. Animation & Expression Engine AI
- **역할**: 애니메이션과 표현 생성
- **입력**: 대화, 감정, 캐릭터
- **출력**: 표정, 동작, 립싱크 데이터

### 5. Voice & Music Engine AI
- **역할**: 음성과 음악 생성
- **입력**: 대화, 장면 분위기
- **출력**: TTS 음성, 배경 음악

## 🔄 콘텐츠 제작 플로우

### 숏폼 제작 파이프라인

```
1. 프롬프트 입력
   ↓
2. Story & Script AI
   → 스토리 생성
   → 대본 작성
   → Scene 구조화
   ↓
3. Character Generator AI
   → 캐릭터 생성
   → 표정/동작 정의
   ↓
4. Scene Composer AI
   → 배경 설정
   → 카메라 앵글
   → 캐릭터 배치
   ↓
5. Animation & Expression Engine AI
   → 표정 애니메이션
   → 립싱크 생성
   → 동작 생성
   ↓
6. Voice & Music Engine AI
   → 음성 생성 (TTS)
   → 배경 음악 생성
   ↓
7. Video Renderer
   → 모든 요소 합성
   → 최종 영상 렌더링
   ↓
8. Preview & Editor
   → 미리보기
   → 편집 가능
```

## 🎬 프론트엔드 메뉴 구조

```
/allinone-studio
 ├── / (메인 대시보드)
 │   ├── 숏폼 제작
 │   ├── 영상 제작
 │   ├── 애니메이션 제작
 │   ├── 영화 제작
 │   └── 캐릭터 제작
 │
 ├── /create (콘텐츠 생성)
 │   ├── 프롬프트 입력
 │   ├── 생성 단계 표시
 │   └── 진행 상황 모니터링
 │
 ├── /project/[id] (프로젝트 편집)
 │   ├── Scene 편집기
 │   ├── 캐릭터 편집
 │   ├── 대화 편집
 │   ├── 음성/음악 편집
 │   └── 미리보기
 │
 └── /projects (프로젝트 목록)
     ├── 프로젝트 목록
     ├── 검색/필터
     └── 프로젝트 관리
```

## 🛠️ 기술 스택

### 프론트엔드
- **Framework**: Next.js 14 (App Router)
- **UI**: React, Tailwind CSS
- **State**: Zustand
- **3D**: Three.js (선택사항)

### 백엔드
- **API**: Next.js API Routes
- **AI**: 무료 AI 서비스 (Groq, Ollama, HuggingFace)
- **Storage**: localStorage (임시), 추후 DB 연동

### 외부 서비스 (무료/오픈소스)
- **TTS**: 
  - Web Speech API (브라우저 기본)
  - Coqui TTS (오픈소스)
  - Piper TTS (로컬)
- **음악 생성**:
  - MusicGen (HuggingFace)
  - AudioCraft (Meta)
- **이미지 생성**:
  - Stable Diffusion (로컬/API)
  - DALL-E (API 키 필요 시)
- **애니메이션**:
  - Three.js (3D)
  - Lottie (2D)
  - CSS Animations

## 📈 단계별 구현 로드맵

### Phase 1: 기본 구조 ✅
- [x] 데이터 스키마 정의
- [x] AI 역할 분리
- [x] 메인 페이지
- [x] 생성 API 기본 구조

### Phase 2: 캐릭터 생성 + 표정
- [ ] 캐릭터 생성 UI
- [ ] 2D 캐릭터 렌더링
- [ ] 표정 시스템
- [ ] 감정 표현

### Phase 3: 음성 + 립싱크
- [ ] TTS 통합
- [ ] 음성 생성
- [ ] 립싱크 데이터 생성
- [ ] 음성-애니메이션 동기화

### Phase 4: 숏폼 자동 제작
- [ ] 스토리 생성
- [ ] Scene 구성
- [ ] 자동 편집
- [ ] 미리보기

### Phase 5: Scene 시스템
- [ ] Scene 편집기
- [ ] 다중 Scene 관리
- [ ] Scene 전환 효과
- [ ] 타임라인 편집

### Phase 6: 영화 제작 모드
- [ ] 다중 Scene 편집
- [ ] 고급 카메라 제어
- [ ] 음악/음향 효과
- [ ] 최종 렌더링

## 🔧 핵심 구현 포인트

### 1. Scene 기반 구조
- 모든 콘텐츠는 Scene 단위로 관리
- Scene은 독립적으로 편집 가능
- Scene을 조합하여 영화 제작

### 2. 표현 요소 분해
- 표정: Face Blendshape
- 감정: Emotion State
- 입모양: Lip Sync
- 몸짓: Motion Clip
- 시선: Eye Tracking
- 대화: Dialogue Engine

### 3. AI 협업
- 각 단계별 전문 AI 역할
- 이전 단계 결과를 다음 단계에 전달
- 사용자가 중간 수정 가능

### 4. 실시간 미리보기
- Scene 편집 시 즉시 미리보기
- 음성/음악 동기화 확인
- 애니메이션 프리뷰

## 📝 다음 단계

1. **캐릭터 생성 UI 구현**
   - 캐릭터 편집기
   - 2D 캐릭터 렌더링
   - 표정/동작 선택

2. **TTS 통합**
   - Web Speech API 또는 오픈소스 TTS
   - 음성 생성 및 저장

3. **애니메이션 엔진**
   - CSS 애니메이션
   - Canvas 기반 2D 애니메이션
   - 립싱크 동기화

4. **렌더링 시스템**
   - Canvas 기반 비디오 렌더링
   - WebCodecs API 활용
   - 최종 영상 출력

---

**올인원 스튜디오 시스템 아키텍처가 완성되었습니다!** 🎬
