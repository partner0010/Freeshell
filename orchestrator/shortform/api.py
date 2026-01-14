"""
숏폼 생성 FastAPI 엔드포인트
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid
import os

from ..orchestrator import Orchestrator
from ..engines.ai_engine import AIEngine
from ..engines.rule_engine import RuleEngine
from .job_manager import JobManager
from .shortform_generator import ShortformGenerator
from ..utils.logger import get_logger

logger = get_logger(__name__)

app = FastAPI(title="Shortform Generation API")

# 전역 변수
orchestrator = Orchestrator()
job_manager = JobManager()
shortform_generator = ShortformGenerator(orchestrator)

# 엔진 등록
orchestrator.register_engine(AIEngine())
orchestrator.register_engine(RuleEngine())


class ShortformRequest(BaseModel):
    """숏폼 생성 요청"""
    prompt: str = Field(..., description="생성 프롬프트")
    duration: int = Field(30, ge=15, le=60, description="영상 길이 (초)")
    style: Optional[str] = Field("animation", description="스타일 (animation, realistic, cinematic)")
    user_id: Optional[str] = Field(None, description="사용자 ID")
    
    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "행복한 일상 영상을 만들어주세요",
                "duration": 30,
                "style": "animation"
            }
        }


class JobStatusResponse(BaseModel):
    """작업 상태 응답"""
    job_id: str
    status: str
    progress: float
    message: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


@app.post("/api/shortform/generate", response_model=JobStatusResponse)
async def generate_shortform(
    request: ShortformRequest,
    background_tasks: BackgroundTasks
):
    """
    숏폼 생성 요청
    
    Returns:
        JobStatusResponse: 작업 ID 및 초기 상태
    """
    try:
        # 1. Job 생성
        job_id = str(uuid.uuid4())
        job = job_manager.create_job(
            job_id=job_id,
            user_id=request.user_id or "anonymous",
            prompt=request.prompt,
            duration=request.duration,
            style=request.style
        )
        
        # 2. 백그라운드 작업 등록
        background_tasks.add_task(
            process_shortform_job,
            job_id,
            request.prompt,
            request.duration,
            request.style
        )
        
        return JobStatusResponse(
            job_id=job_id,
            status="pending",
            progress=0.0,
            message="Job created, processing started"
        )
        
    except Exception as e:
        logger.error(f"Error creating job: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/shortform/status/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """작업 상태 조회"""
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobStatusResponse(
        job_id=job_id,
        status=job['status'],
        progress=job.get('progress', 0.0),
        message=job.get('message'),
        result=job.get('result'),
        error=job.get('error')
    )


@app.get("/api/shortform/download/{job_id}")
async def download_video(job_id: str):
    """영상 다운로드"""
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job['status'] != 'completed':
        raise HTTPException(status_code=400, detail="Job not completed")
    
    video_path = job.get('result', {}).get('video_path')
    if not video_path or not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="Video file not found")
    
    return FileResponse(
        video_path,
        media_type="video/mp4",
        filename=f"shortform_{job_id}.mp4"
    )


async def process_shortform_job(
    job_id: str,
    prompt: str,
    duration: int,
    style: str
):
    """
    숏폼 생성 작업 처리
    
    Args:
        job_id: 작업 ID
        prompt: 프롬프트
        duration: 영상 길이
        style: 스타일
    """
    try:
        # 작업 상태 업데이트
        job_manager.update_job_status(job_id, "processing", 0.0, "Starting generation")
        
        # 숏폼 생성
        result = await shortform_generator.generate(
            prompt=prompt,
            duration=duration,
            style=style,
            job_id=job_id
        )
        
        if result['success']:
            # 성공
            job_manager.update_job_status(
                job_id,
                "completed",
                100.0,
                "Generation completed",
                result=result
            )
        else:
            # 실패
            job_manager.update_job_status(
                job_id,
                "failed",
                0.0,
                "Generation failed",
                error=result.get('error', 'Unknown error')
            )
            
    except Exception as e:
        logger.error(f"Job {job_id} failed: {e}")
        job_manager.update_job_status(
            job_id,
            "failed",
            0.0,
            "Generation failed",
            error=str(e)
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
