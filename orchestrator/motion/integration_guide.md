# 숏폼 파이프라인 연계 방식

## 개요

모션 시스템을 기존 숏폼 파이프라인과 연계하는 방법

## 1. Scene JSON 통합

### MotionData를 Scene으로 변환

```python
from orchestrator.motion import MotionPipeline, MotionToVideoConverter
from orchestrator.video import RendererFactory

# 1. 모션 생성
pipeline = MotionPipeline()
motion_data = await pipeline.process(
    image_path="character.jpg",
    prompt="행복한 표정, 눈 깜빡임, 고개 끄덕임",
    duration=5.0
)

# 2. Scene으로 변환
converter = MotionToVideoConverter()
scene = await converter.convert_to_scene(
    motion_data,
    voice_path="voice.mp3"
)

# 3. 영상 렌더링
renderer = RendererFactory.create_renderer("output.mp4")
video_path = await renderer.render([scene])
```

## 2. Orchestrator 통합

### Step으로 통합

```python
from orchestrator.core import Step, StepResult, StepStatus
from orchestrator.motion import MotionPipeline

class MotionStep(Step):
    def __init__(self):
        super().__init__(
            step_id="apply_motion",
            name="모션 적용",
            description="이미지에 모션 적용"
        )
        self.pipeline = MotionPipeline()
    
    async def execute(self, context: Dict[str, Any]) -> StepResult:
        image_path = context.get('image_path')
        prompt = context.get('motion_prompt', '')
        
        motion_data = await self.pipeline.process(
            image_path=image_path,
            prompt=prompt,
            duration=context.get('duration', 5.0)
        )
        
        return StepResult(
            step_id=self.step_id,
            status=StepStatus.SUCCESS,
            result=motion_data.to_dict()
        )
```

## 3. 전체 워크플로우

```
User Input
    ↓
Orchestrator
    ↓
Intent 분석: "이미지에 모션 적용"
    ↓
Task Plan 생성
    ├─ Step 1: 이미지 업로드/검증
    ├─ Step 2: 모션 생성 (MotionPipeline)
    │   ├─ AI Engine 시도
    │   └─ Rule Engine Fallback
    ├─ Step 3: 음성 생성 (TTS)
    ├─ Step 4: Scene 생성
    └─ Step 5: 영상 렌더링 (FFmpeg)
    ↓
최종 영상 (mp4)
```

## 4. API 엔드포인트 예시

```python
# FastAPI 예시
@app.post("/api/motion/apply")
async def apply_motion(
    image: UploadFile,
    prompt: str,
    duration: float = 5.0
):
    # 이미지 저장
    image_path = save_uploaded_file(image)
    
    # 모션 생성
    pipeline = MotionPipeline()
    motion_data = await pipeline.process(
        image_path=image_path,
        prompt=prompt,
        duration=duration
    )
    
    # Scene 생성
    converter = MotionToVideoConverter()
    scene = await converter.convert_to_scene(motion_data)
    
    # 영상 렌더링
    renderer = RendererFactory.create_renderer("output.mp4")
    video_path = await renderer.render([scene])
    
    return {"video_url": video_path}
```

## 5. 데이터 흐름

```
Image (JPG/PNG)
    ↓
MotionPipeline
    ├─ AI/Rule Engine
    └─ MotionData 생성
        ├─ expressions
        ├─ eye
        ├─ breath
        ├─ head
        └─ body
    ↓
MotionToVideoConverter
    ↓
Scene 객체
    ↓
FFmpegRenderer
    ↓
Video (MP4)
```

## 6. 캐싱 전략

```python
# 모션 데이터 캐싱
motion_cache = {}

async def get_cached_motion(image_hash: str, prompt: str):
    cache_key = f"{image_hash}:{prompt}"
    if cache_key in motion_cache:
        return motion_cache[cache_key]
    
    motion_data = await pipeline.process(...)
    motion_cache[cache_key] = motion_data
    return motion_data
```

## 7. 배치 처리

```python
# 여러 이미지에 모션 적용
images = ["img1.jpg", "img2.jpg", "img3.jpg"]
scenes = []

for image_path in images:
    motion_data = await pipeline.process(image_path, prompt)
    scene = await converter.convert_to_scene(motion_data)
    scenes.append(scene)

# 한 번에 렌더링
video_path = await renderer.render(scenes)
```
