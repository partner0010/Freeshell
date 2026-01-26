# 캐릭터 콘텐츠 생성 파이프라인

**작성 일시**: 2026-01-25  
**목표**: Script → Character → Voice → Motion → Video → Feed/Live/Archive 전체 흐름 구현

---

## 구현 완료

### 파일 구조
```
backend/character/
├── pipeline.py        ✅ (새로 추가)
├── router.py          ✅ (콘텐츠 생성 엔드포인트 추가)
└── schemas.py         ✅ (CharacterContentRequest/Response 추가)
```

---

## 파이프라인 흐름

```
Script → Character → Voice → Motion → Video → Feed / Live / Archive
```

### 1. Script (스크립트)
- 텍스트 입력 또는 AI 생성
- Scene 단위로 구조화
- 타이밍 및 대사 정보 포함

### 2. Character (캐릭터)
- 캐릭터 정보 조회
- base_image, voice_model, personality 추출

### 3. Voice (음성)
- `generate_character_voice()` 사용
- TTS 또는 Voice Cloning
- 캐릭터 personality 반영

### 4. Motion (모션)
- 캐릭터 이미지에 모션 적용
- MotionService 활용
- soft_breath, head_nod 등

### 5. Video (비디오)
- VideoComposer로 합성
- 이미지 + 음성 + 자막 결합
- FFmpeg 렌더링

### 6. Feed / Live / Archive (배포)
- Feed: 커뮤니티 피드에 게시
- Live: 라이브 스트리밍 준비
- Archive: 아카이브에 저장

---

## API 엔드포인트

### `POST /api/v1/characters/{character_id}/content`

**요청:**
```json
{
  "script": "안녕하세요, 저는 AI 하나입니다. 오늘은 재미있는 이야기를 들려드리겠습니다.",
  "output_type": "feed",  // feed, live, archive, video
  "motion_type": "soft_breath",
  "video_resolution": "1080p",  // 720p, 1080p
  "include_subtitles": true
}
```

**응답:**
```json
{
  "success": true,
  "video_url": "storage/character_content/video_char_001_123456.mp4",
  "video_path": "storage/character_content/video_char_001_123456.mp4",
  "duration": 5.5,
  "voice_path": "storage/character_voices/voice_char_001_123456.wav",
  "motion_path": "storage/motion/motion_char_001_123456.mp4",
  "feed_id": "feed_char_001_123456",
  "live_id": null,
  "archive_id": null,
  "metadata": {
    "character_id": "char_001",
    "output_type": "feed",
    "motion_type": "soft_breath",
    "resolution": "1080p"
  }
}
```

---

## 사용 예시

### Python 코드
```python
from backend.character.pipeline import (
    CharacterContentPipeline,
    CharacterContentRequest,
    OutputType
)

# 파이프라인 생성
pipeline = CharacterContentPipeline()

# 요청 생성
request = CharacterContentRequest(
    script="안녕하세요, 저는 AI 하나입니다.",
    character_id="char_001",
    output_type=OutputType.FEED,
    motion_type="soft_breath",
    video_resolution="1080p"
)

# 파이프라인 실행
result = await pipeline.generate(request)

if result.success:
    print(f"Video created: {result.video_url}")
    print(f"Feed ID: {result.feed_id}")
```

### API 호출
```bash
curl -X POST "http://localhost:8000/api/v1/characters/char_001/content" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "script": "안녕하세요, 저는 AI 하나입니다.",
    "output_type": "feed",
    "motion_type": "soft_breath",
    "video_resolution": "1080p"
  }'
```

---

## 통합된 모듈

### 기존 모듈 활용
- **Script**: `backend/app/services/ai_orchestrator.py`
- **Character**: `backend/character/service.py`
- **Voice**: `backend/character/voice_generator.py`
- **Motion**: `backend/services/motion_service.py`
- **Video**: `backend/app/services/video_composer.py`
- **Feed/Live/Archive**: TODO (다음 단계)

---

## 다음 단계

### 즉시 개선 가능
1. **백그라운드 작업**: Celery를 사용한 비동기 처리
2. **진행률 추적**: WebSocket을 통한 실시간 진행률 업데이트
3. **에러 핸들링**: 각 단계별 상세한 에러 처리

### 모듈 통합
1. **Feed 모듈**: FeedService와 통합
2. **Live 모듈**: Live 스트리밍 서비스 통합
3. **Archive 모듈**: ArchiveManager와 통합

---

## 주의사항

1. **비용**: 각 단계별 API 호출 비용 발생 가능 (ElevenLabs, AI 생성 등)
2. **처리 시간**: 전체 파이프라인은 수 분 소요될 수 있음
3. **리소스**: 비디오 렌더링은 CPU/메모리 집약적
