# Scene JSON + FFmpeg 렌더링 파이프라인 구현 완료

## ✅ 구현 완료 항목

### 1. Scene JSON 스키마 ✅
- `scene_schema.py`: 완전한 타입 정의
- `Scene`, `Character`, `Voice`, `Subtitle`, `Background` 클래스
- `EmotionType`, `MotionType` Enum
- JSON 직렬화/역직렬화 지원

### 2. 실제 JSON 예제 ✅
- `scene_example.json`: 3개 Scene 예제
- 실제 사용 가능한 구조
- 모든 필수 요소 포함

### 3. FFmpeg 렌더링 명령 ✅
- `ffmpeg_renderer.py`: 완전한 렌더링 파이프라인
- 실제 사용 가능한 FFmpeg 명령 생성
- Filter Complex 자동 생성

### 4. 자막 타이밍 처리 방식 ✅
- `drawtext` 필터 사용
- `enable='between(t,start,end)'` 타이밍 제어
- 다중 자막 순차 처리
- 스타일 커스터마이징

### 5. 이미지 → 영상 변환 구조 ✅
- 배경 이미지 → 영상 변환
- 캐릭터 오버레이 처리
- 모션 효과 적용 (zoom, pan, fade)
- 스케일 및 위치 조정

### 6. GPU/CPU 분기 처리 ✅
- `gpu_renderer.py`: GPU 가속 렌더러
- `renderer_factory.py`: 자동 선택
- NVIDIA/AMD GPU 감지
- CPU Fallback 지원

## 핵심 기능

### Scene JSON 구조

```python
Scene(
    id="scene_001",
    duration=5.0,
    background=Background(type="image", source="bg.jpg"),
    characters=[
        Character(
            id="char_001",
            image_path="char.png",
            position=Position(x=0.5, y=0.3),
            emotion=EmotionType.HAPPY
        )
    ],
    voice=Voice(text="대사", file_path="voice.mp3"),
    subtitles=[Subtitle(text="자막", start_time=0.0, duration=4.5)]
)
```

### FFmpeg 명령 생성

```python
# 자동으로 생성되는 명령
ffmpeg -y \
  -loop 1 -t 5.0 -i background.jpg \
  -loop 1 -t 5.0 -i character.png \
  -i voice.mp3 \
  -filter_complex "[0:v]scale=1080:1920[bg];[1:v]scale=1296:-1[char];[bg][char]overlay=540:576[overlay];[overlay]drawtext=...:[final]" \
  -map "[final]" -map 2:a \
  -c:v libx264 -preset medium -crf 23 \
  -c:a aac -b:a 128k \
  output.mp4
```

### GPU/CPU 자동 선택

```python
# Factory 패턴으로 자동 선택
renderer = RendererFactory.create_renderer(
    output_path="output.mp4",
    force_cpu=False  # GPU 자동 감지
)

# GPU 사용 가능 시
# -c:v h264_nvenc (NVIDIA)
# -c:v h264_amf (AMD)

# GPU 없을 시
# -c:v libx264 (CPU)
```

## 사용 예시

```python
from orchestrator.video import Scene, RendererFactory
import json

# Scene JSON 로드
with open("scenes.json") as f:
    data = json.load(f)
    scenes = [Scene.from_dict(s) for s in data['scenes']]

# Renderer 생성
renderer = RendererFactory.create_renderer(
    output_path="output/shortform.mp4",
    width=1080,
    height=1920,
    fps=30
)

# 렌더링
video_path = await renderer.render(scenes)
print(f"Video saved to: {video_path}")

# 정리
renderer.cleanup()
```

## 실행 방법

```bash
# 의존성 확인
ffmpeg -version

# 예시 실행
python orchestrator/video/example_render.py
```

## 다음 단계

1. ✅ Scene JSON 스키마 완료
2. ✅ FFmpeg 렌더링 파이프라인 완료
3. ⏭️ TTS 음성 생성 통합
4. ⏭️ 이미지 생성 통합
5. ⏭️ Orchestrator와 통합

---

**모든 핵심 기능이 구현되었습니다!** 🎉
