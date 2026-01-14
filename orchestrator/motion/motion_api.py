"""
사진 → 모션 FastAPI 엔드포인트
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field
from typing import Optional
import os
import uuid
import shutil

from .motion_pipeline_v2 import MotionPipelineV2
from .motion_applier import MotionApplier
from ..orchestrator import Orchestrator
from ..engines.ai_engine import AIEngine
from ..engines.rule_engine import RuleEngine
from ..utils.logger import get_logger

logger = get_logger(__name__)

app = FastAPI(title="Image to Motion API")

# 전역 변수
orchestrator = Orchestrator()
orchestrator.register_engine(AIEngine())
orchestrator.register_engine(RuleEngine())

motion_pipeline = MotionPipelineV2(orchestrator)
motion_applier = MotionApplier()

# 이미지 저장 디렉토리
image_dir = "storage/images"
os.makedirs(image_dir, exist_ok=True)


class MotionRequest(BaseModel):
    """모션 적용 요청"""
    prompt: str = Field(..., description="모션 프롬프트")
    duration: float = Field(5.0, ge=1.0, le=60.0, description="영상 길이 (초)")
    use_ai: bool = Field(True, description="AI 사용 여부")


@app.post("/api/motion/apply")
async def apply_motion(
    file: UploadFile = File(...),
    prompt: str = "",
    duration: float = 5.0,
    use_ai: bool = True
):
    """
    이미지에 모션 적용
    
    Args:
        file: 이미지 파일
        prompt: 모션 프롬프트
        duration: 영상 길이
        use_ai: AI 사용 여부
        
    Returns:
        생성 결과
    """
    try:
        # 이미지 저장
        image_id = str(uuid.uuid4())
        image_ext = os.path.splitext(file.filename)[1] or '.jpg'
        image_path = os.path.join(image_dir, f"{image_id}{image_ext}")
        
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 모션 생성
        result = await motion_pipeline.process(
            image_path=image_path,
            prompt=prompt,
            duration=duration,
            use_ai=use_ai
        )
        
        if not result.success:
            raise HTTPException(status_code=500, detail=result.error)
        
        # 모션 적용
        video_result = await motion_applier.apply_motion(
            image_path=image_path,
            motion_data=result.motion_data
        )
        
        if not video_result['success']:
            raise HTTPException(status_code=500, detail=video_result.get('error'))
        
        return JSONResponse({
            'success': True,
            'video_path': video_result['video_path'],
            'motion_level': result.level.value,
            'method': result.method,
            'motion_data': result.motion_data.to_dict()
        })
        
    except Exception as e:
        logger.error(f"Motion application error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/motion/download/{video_id}")
async def download_video(video_id: str):
    """영상 다운로드"""
    video_path = os.path.join("storage/motion_videos", f"{video_id}.mp4")
    
    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="Video not found")
    
    return FileResponse(
        video_path,
        media_type="video/mp4",
        filename=f"motion_{video_id}.mp4"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
