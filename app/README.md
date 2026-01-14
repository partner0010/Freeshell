# AI Content Platform - 실제 서비스 수준 코드

## 디렉토리 구조

```
app/
├── orchestrator/          # AI Orchestrator
│   ├── orchestrator.py   # 핵심 뇌
│   ├── intent.py         # Intent 분석
│   ├── planner.py        # Task Plan 생성
│   ├── executor.py      # Plan 실행
│   └── state.py         # State Machine
│
├── engines/              # 엔진 구현
│   ├── base.py          # Engine 인터페이스
│   ├── ai_engine.py     # AI Engine
│   ├── rule_engine.py   # Rule Engine
│   └── fallback_engine.py # Fallback Engine
│
├── ethics/               # 윤리 시스템
│   └── ethics_guard.py  # Ethics Guard
│
├── shortform/            # 숏폼 생성
│   ├── ffmpeg_renderer.py
│   └── scene_processor.py
│
├── motion/               # 모션 적용
│   └── motion_applier_v2.py
│
├── models/               # 데이터 모델
│   ├── request.py
│   └── response.py
│
├── utils/                # 유틸리티
│   └── logger.py
│
└── main.py              # FastAPI 서버
```

## 실행 방법

### 1. 의존성 설치

```bash
cd app
pip install -r requirements.txt
```

### 2. 서버 실행

```bash
python main.py
```

또는

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 3. API 테스트

```bash
curl -X POST "http://localhost:8000/generate/shortform" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "행복한 일상 영상을 만들어주세요",
    "duration": 30,
    "style": "animation"
  }'
```

## 핵심 원칙 구현

✅ **AI 의존도 100% 금지**: AI → Rule → Fallback 순서
✅ **Fallback 필수**: 모든 단계에서 Fallback 제공
✅ **플러그인 구조**: Engine 등록 방식
✅ **상태 기반 실행**: State Machine 사용
✅ **윤리/법적 Guard**: Ethics Guard 통합

## Scene JSON 예시

```json
{
  "scenes": [
    {
      "duration": 5,
      "image": "face.png",
      "motion": "slow_breath",
      "emotion": "warm",
      "voice": "voice.wav",
      "subtitle": {
        "text": "괜찮아, 나는 여기 있어",
        "start": 1,
        "end": 4
      }
    }
  ]
}
```

## FFmpeg 명령 예시

```bash
ffmpeg -loop 1 -i face.png \
 -i voice.wav \
 -vf "subtitles=sub.srt,scale=1080:1920" \
 -t 5 \
 -c:v libx264 -pix_fmt yuv420p output.mp4
```

---

**실제 서비스 수준의 코드 구조가 완성되었습니다!** 🚀
