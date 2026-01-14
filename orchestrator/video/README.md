# Scene JSON + FFmpeg 렌더링 파이프라인

## 개요

Scene JSON 기반으로 숏폼 영상(mp4)을 생성하는 완성형 파이프라인

## Scene JSON 스키마

### 필수 요소

```json
{
  "id": "scene_001",
  "duration": 5.0,
  "background": {
    "type": "image",
    "source": "/path/to/background.jpg",
    "motion": "static"
  },
  "characters": [
    {
      "id": "char_001",
      "name": "캐릭터 이름",
      "image_path": "/path/to/character.png",
      "position": {"x": 0.5, "y": 0.3, "z": 0.0},
      "scale": 1.2,
      "emotion": "happy",
      "motion": "zoom_in"
    }
  ],
  "voice": {
    "text": "대사 텍스트",
    "file_path": "/path/to/voice.mp3",
    "start_time": 0.0,
    "duration": 4.5,
    "emotion": "excited",
    "speaker_id": "char_001"
  },
  "subtitles": [
    {
      "text": "자막 텍스트",
      "start_time": 0.0,
      "duration": 4.5,
      "position": "bottom",
      "style": {
        "font_size": 28,
        "font_color": "#FFFFFF",
        "background_color": "rgba(0,0,0,0.7)"
      }
    }
  ],
  "effects": ["sparkle"],
  "transition": "fade"
}
```

## FFmpeg 렌더링 명령 예시

### 단일 Scene 렌더링

```bash
ffmpeg -y \
  -loop 1 -t 5.0 -i background.jpg \
  -loop 1 -t 5.0 -i character.png \
  -i voice.mp3 \
  -filter_complex "
    [0:v]scale=1080:1920[bg];
    [1:v]scale=1296:-1[char];
    [bg][char]overlay=540:576:enable='between(t,0,5)'[overlay];
    [overlay]drawtext=text='안녕하세요':fontsize=28:fontcolor=0xFFFFFF:x=(w-text_w)/2:y=h-th-50:enable='between(t,0,4.5)'[final]
  " \
  -map "[final]" -map 2:a \
  -c:v libx264 -preset medium -crf 23 \
  -c:a aac -b:a 128k -ar 44100 \
  -r 30 -s 1080x1920 \
  scene_001.mp4
```

### Scene 연결

```bash
# concat.txt 파일 생성
file '/path/to/scene_001.mp4'
file '/path/to/scene_002.mp4'
file '/path/to/scene_003.mp4'

# 연결
ffmpeg -y -f concat -safe 0 -i concat.txt -c copy output.mp4
```

## 자막 타이밍 처리

### drawtext 필터 사용

```python
# 자막 필터 생성
drawtext = (
    f"drawtext=text='{text}':"
    f"fontsize={font_size}:"
    f"fontcolor={font_color}:"
    f"x=(w-text_w)/2:"
    f"y=h-th-50:"
    f"enable='between(t,{start_time},{start_time + duration})':"
    f"box=1:boxcolor={bg_color}:boxborderw=5"
)
```

### 다중 자막 처리

```python
# 시간순 정렬 후 순차 적용
sorted_subs = sorted(subtitles, key=lambda s: s.start_time)
for sub in sorted_subs:
    # 각 자막에 대해 drawtext 필터 생성
    ...
```

## 이미지 → 영상 변환 구조

### 1. 배경 이미지 처리

```python
# 정적 이미지 → 영상
ffmpeg -loop 1 -t {duration} -i background.jpg -vf "scale=1080:1920" bg_video.mp4
```

### 2. 캐릭터 오버레이

```python
# 캐릭터 이미지 오버레이
overlay = f"[bg][char]overlay={x_pos}:{y_pos}:enable='between(t,0,{duration})'"
```

### 3. 모션 적용

```python
# Zoom In
zoompan=z='min(zoom+0.0015,1.5)':d={frames}:s=1080x1920

# Pan Right
crop=iw*0.8:ih:iw*0.1-iw*0.2*t/{duration}:0,scale=1080:1920
```

## GPU/CPU 분기 처리

### GPU 감지

```python
# NVIDIA GPU 확인
nvidia-smi

# AMD GPU 확인
rocm-smi
```

### GPU 인코더 사용

```python
# NVIDIA
-c:v h264_nvenc -preset fast -gpu 0

# AMD
-c:v h264_amf

# Intel
-c:v h264_qsv
```

### 자동 선택

```python
renderer = RendererFactory.create_renderer(
    output_path="output.mp4",
    force_cpu=False  # GPU 자동 감지
)
```

## 사용 예시

```python
from orchestrator.video import Scene, RendererFactory

# Scene JSON 로드
scenes = load_scenes_from_json("scenes.json")

# Renderer 생성
renderer = RendererFactory.create_renderer(
    output_path="output.mp4",
    width=1080,
    height=1920,
    fps=30
)

# 렌더링
video_path = await renderer.render(scenes)
```

## 환경 변수

```env
# GPU 사용 설정
USE_GPU=auto  # auto, true, false

# FFmpeg 경로 (선택)
FFMPEG_PATH=/usr/bin/ffmpeg
```

## 의존성

```bash
# FFmpeg 설치 필요
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows
# https://ffmpeg.org/download.html
```

## 성능 최적화

### CPU 렌더링
- `-preset medium`: 속도와 품질 균형
- `-crf 23`: 품질 설정 (낮을수록 고품질)

### GPU 렌더링
- `-preset fast`: GPU 최적화
- 병렬 처리 가능

## 제한사항

1. **이미지 경로**: 모든 이미지/음성 파일이 존재해야 함
2. **FFmpeg 버전**: 최신 버전 권장
3. **메모리**: 고해상도/긴 영상은 메모리 많이 사용
4. **GPU**: NVIDIA GPU만 완전 지원 (AMD/Intel 부분 지원)
