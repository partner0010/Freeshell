# 올인원 스튜디오 - 구현 완성 스펙

## ✅ 완성된 4단계

### STEP 1: 숏폼 자동 렌더링 FFmpeg 파이프라인 ✅
- **파일**: `lib/allinone-studio/render/ffmpeg-pipeline.ts`
- **내용**:
  - 전체 렌더링 파이프라인 7단계
  - Scene → FFmpeg 명령 매핑
  - FFmpeg 명령 예시 (실제 실행 가능)
  - 병렬 처리 구조
  - 렌더 실패 시 재시도 전략
- **특징**: 실제 FFmpeg 명령 포함, 즉시 실행 가능

### STEP 2: 캐릭터 음성 + 감정 TTS 구조 ✅
- **파일**: `lib/allinone-studio/tts/emotion-tts-system.ts`
- **내용**:
  - 전체 TTS 처리 흐름 (5단계)
  - 감정 → 음성 파라미터 매핑
  - Dialogue → 음성 변환 구조
  - Scene 연동 방식
  - 다국어 확장 구조
- **특징**: 상용 API 없이 구조 중심, Web Speech API 또는 오픈소스 TTS 사용

### STEP 3: Scene 기반 AI 편집 도우미 프롬프트 ✅
- **파일**: `lib/allinone-studio/ai/editor-assistant-prompt.ts`
- **내용**:
  - System Prompt 완성본
  - User Prompt 예시 (3가지)
  - 출력 포맷 정의 (JSON Patch)
  - 에디터 연동 방식
  - 잘못된 요청 차단 규칙
- **특징**: 편집 도우미 전용, 코드 수정 금지, JSON Patch만 제안

### STEP 4: 에디터 상태 관리 구조 (Undo/Redo) ✅
- **파일**: `lib/allinone-studio/editor/state-management.ts`
- **내용**:
  - 전체 상태 관리 구조
  - 상태 스냅샷 전략
  - Undo/Redo 알고리즘
  - AI 수정 기록 분리
  - 충돌 방지
  - 대용량 Scene 대응
  - 성능 최적화 전략
- **특징**: 라이브러리 독립적, 구조 중심, 확장 가능

## 📊 핵심 구현 내용

### 1. FFmpeg 파이프라인 (7단계)

```
1. Scene → 이미지/프레임 준비
   → ffmpeg -framerate 30 -i frame-%d.png scene.mp4

2. 음성 + 립싱크 타이밍 적용
   → ffmpeg -i audio1.wav -i audio2.wav -filter_complex "amix" output.wav

3. 장면 전환 (cut, fade, zoom)
   → ffmpeg -i scene1.mp4 -i scene2.mp4 -filter_complex "xfade=transition=fade" output.mp4

4. 자막 자동 삽입
   → ffmpeg -i video.mp4 -vf "subtitles=subtitle.srt" output.mp4

5. 배경 음악 믹싱
   → ffmpeg -i video.mp4 -i bgm.mp3 -filter_complex "amix" output.mp4

6. 해상도/비율 변환
   → ffmpeg -i video.mp4 -vf "scale=1080:1920" output.mp4

7. 최종 렌더링
   → ffmpeg -i video.mp4 -c:v libx264 -crf 23 output.mp4
```

### 2. TTS 시스템 구조

```typescript
감정 → 파라미터 매핑:
- happy: pitch 1.1, speed 1.05
- sad: pitch 0.9, speed 0.85
- angry: pitch 0.95, speed 1.1

성별별 기본값:
- male: pitch 0.85
- female: pitch 1.15

나이별 기본값:
- child: pitch 1.3, speed 1.1
- adult: pitch 1.0, speed 1.0
```

### 3. AI 편집 도우미

```json
{
  "suggestions": [
    {
      "type": "improvement",
      "category": "timing",
      "message": "대화 타이밍 개선",
      "patch": {
        "op": "replace",
        "path": "/dialogues/0/timing/duration",
        "value": 3.5
      }
    }
  ]
}
```

### 4. 상태 관리

```typescript
HistoryManager:
- push(): 상태 저장
- undo(): 이전 상태로
- redo(): 다음 상태로
- canUndo()/canRedo(): 가능 여부 확인

AIHistoryManager:
- addAIChange(): AI 수정 기록
- revertAIChange(): AI 수정 취소
```

## 🚀 사용 방법

### 1. FFmpeg 렌더링
```typescript
import { generateFFmpegPipeline } from '@/lib/allinone-studio/render/ffmpeg-pipeline';

const { commands, script } = generateFFmpegPipeline(renderInput);
// FFmpeg 스크립트 실행
```

### 2. TTS 생성
```typescript
import { generateTTS } from '@/lib/allinone-studio/tts/emotion-tts-system';

const output = await generateTTS({
  characterId: 'char-001',
  gender: 'female',
  emotion: 'happy',
  dialogueText: '안녕하세요!',
  speechSpeed: 1.0,
  tone: 'soft',
  age: 'adult',
});
```

### 3. AI 편집 도우미 호출
```typescript
import { callEditorAssistant } from '@/lib/allinone-studio/ai/editor-assistant-prompt';

const suggestions = await callEditorAssistant(
  sceneJSON,
  '대화 타이밍을 개선해주세요'
);
```

### 4. 상태 관리
```typescript
import { HistoryManager } from '@/lib/allinone-studio/editor/state-management';

const history = new HistoryManager(50);
history.push(currentState, 'edit-dialogue');
const previousState = history.undo();
```

## 📁 파일 구조

```
lib/allinone-studio/
├── render/
│   └── ffmpeg-pipeline.ts          # STEP 1
├── tts/
│   └── emotion-tts-system.ts        # STEP 2
├── ai/
│   └── editor-assistant-prompt.ts   # STEP 3
└── editor/
    └── state-management.ts          # STEP 4
```

## 🎯 핵심 특징

### 1. 실제 실행 가능
- FFmpeg 명령이 실제로 작동
- TTS 구조가 즉시 구현 가능
- 상태 관리가 라이브러리 독립적

### 2. 확장 가능
- 다국어 TTS 지원
- 영화 제작 파이프라인 확장
- 대용량 Scene 대응

### 3. 안정성
- 충돌 방지
- 재시도 전략
- AI 수정 기록 분리

---

**올인원 스튜디오 구현 스펙이 완성되었습니다!** 🎬
