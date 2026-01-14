# 단계별 구현 가이드

## STEP A: AI 없이 동작하는 숏폼 생성

### 목적
AI 호출 없이 고정 Scene JSON으로 영상 생성

### 사용 방법

```python
from backend.services.shortform_service import ShortformService

service = ShortformService()

# Scene JSON 준비
scene_json = {
    'type': 'shortform',
    'scenes': [
        {
            'id': 'scene_001',
            'duration': 5,
            'image': 'path/to/image.jpg',
            'subtitle': {
                'text': '안녕하세요',
                'start': 0,
                'end': 4
            }
        }
    ]
}

# 생성
result = service.generate_from_scene_json(scene_json)
```

### API 사용

```bash
curl -X POST "http://localhost:8000/api/shortform/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "scene_json": {
      "type": "shortform",
      "scenes": [...]
    }
  }'
```

## STEP B: Orchestrator 통합

### 목적
Orchestrator가 Scene JSON만 생성하고, 실제 렌더링은 기존 파이프라인 재사용

### 사용 방법

```python
from backend.services.orchestrator_integration import OrchestratorIntegration

integration = OrchestratorIntegration()

# Orchestrator를 통한 생성
request = {
    'prompt': '행복한 일상',
    'type': 'shortform',
    'duration': 30
}

result = integration.generate_with_orchestrator(request, user_id='user123')
```

### API 사용

```bash
curl -X POST "http://localhost:8000/api/shortform/generate/with-orchestrator" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "행복한 일상",
    "type": "shortform",
    "duration": 30
  }'
```

## STEP C: 사진→모션 옵션 추가

### 목적
기존 숏폼 파이프라인에 `photo_motion=true` 옵션 추가

### 사용 방법

```python
from backend.services.shortform_service_v2 import ShortformServiceV2

service = ShortformServiceV2()

# 모션 옵션 활성화
result = service.generate_from_scene_json(
    scene_json,
    photo_motion=True
)
```

### API 사용

```bash
curl -X POST "http://localhost:8000/api/shortform/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "scene_json": {...},
    "photo_motion": true
  }'
```

## 실행 방법

### 1. 의존성 설치

```bash
cd backend
pip install -r requirements.txt
```

### 2. 서버 실행

```bash
python main.py
```

### 3. 테스트

```bash
# STEP A 테스트
curl -X POST "http://localhost:8000/api/shortform/generate" \
  -H "Content-Type: application/json" \
  -d @test_scene.json

# STEP B 테스트
curl -X POST "http://localhost:8000/api/shortform/generate/with-orchestrator" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "테스트", "type": "shortform", "duration": 30}'

# STEP C 테스트
curl -X POST "http://localhost:8000/api/shortform/generate" \
  -H "Content-Type: application/json" \
  -d '{"scene_json": {...}, "photo_motion": true}'
```

## 파일 구조

```
backend/
├── services/
│   ├── shortform_service.py      # STEP A
│   ├── shortform_service_v2.py   # STEP C
│   ├── orchestrator_integration.py  # STEP B
│   └── motion_service.py         # STEP C
│
├── api/
│   └── integrated_routes.py      # 통합 API
│
└── main.py                       # 서버
```

---

**모든 단계가 완료되었습니다!** ✅
