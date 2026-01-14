"""
숏폼 자동 생성 백엔드 서버
실제 배포 가능한 수준의 구현
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional
import uuid
import os
from datetime import datetime
import logging

from ..services.job_queue import JobQueue, get_job_queue
from ..services.job_manager import JobManager, get_job_manager
from ..config import settings

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Shortform Generation API",
    description="AI-powered shortform video generation",
    version="1.0.0"
)

# FastAPI startup 이벤트에서 워커 시작
@app.on_event("startup")
async def startup_event():
    """서버 시작 시 작업 큐 워커 시작"""
    queue = get_job_queue()
    queue.start_worker()
    logger.info("Shortform generation server started")

# CORS 설정 (Netlify 도메인 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 요청 모델
class ShortformRequest(BaseModel):
    userPrompt: str
    style: str  # 'realistic' | 'anime' | 'cartoon'
    duration: int  # 15, 30, 60
    userId: str

# 응답 모델
class ShortformResponse(BaseModel):
    success: bool
    jobId: str
    message: str
    statusUrl: str

class JobStatusResponse(BaseModel):
    jobId: str
    status: str  # 'pending' | 'processing' | 'completed' | 'failed'
    progress: int  # 0-100
    currentStep: Optional[str]
    videoUrl: Optional[str]
    error: Optional[str]

@app.get("/")
async def root():
    """Health check"""
    return {
        "status": "ok",
        "service": "shortform-generation",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    """Health check with queue status"""
    queue = get_job_queue()
    manager = get_job_manager()
    
    return {
        "status": "ok",
        "queue_size": queue.get_queue_size(),
        "processing": queue.get_processing_count(),
        "environment": settings.ENVIRONMENT
    }

@app.post("/api/v1/generate", response_model=ShortformResponse)
async def generate_shortform(
    request: ShortformRequest,
    queue: JobQueue = Depends(get_job_queue),
    manager: JobManager = Depends(get_job_manager)
):
    """
    숏폼 생성 요청
    """
    # 1. 요청 검증
    if not request.userPrompt or len(request.userPrompt.strip()) == 0:
        raise HTTPException(status_code=400, detail="userPrompt is required")
    
    if request.style not in ['realistic', 'anime', 'cartoon']:
        raise HTTPException(status_code=400, detail="Invalid style")
    
    if request.duration not in [15, 30, 60]:
        raise HTTPException(status_code=400, detail="Invalid duration")
    
    # 2. 작업 ID 생성
    job_id = f"{request.userId}-{uuid.uuid4().hex[:8]}-{int(datetime.now().timestamp())}"
    
    # 3. 작업 등록
    manager.create_job(job_id, {
        'userPrompt': request.userPrompt,
        'style': request.style,
        'duration': request.duration,
        'userId': request.userId,
        'createdAt': datetime.now().isoformat(),
    })
    
    # 4. 큐에 작업 추가
    await queue.enqueue(job_id, {
        'userPrompt': request.userPrompt,
        'style': request.style,
        'duration': request.duration,
        'userId': request.userId,
    })
    
    logger.info(f"Job {job_id} enqueued")
    
    return ShortformResponse(
        success=True,
        jobId=job_id,
        message="Shortform generation started",
        statusUrl=f"/api/v1/job/{job_id}/status"
    )

@app.get("/api/v1/job/{job_id}/status", response_model=JobStatusResponse)
async def get_job_status(
    job_id: str,
    manager: JobManager = Depends(get_job_manager)
):
    """
    작업 상태 조회
    """
    job = manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # 비디오 URL 생성
    video_url = None
    if job.get('videoPath'):
        video_url = f"{settings.API_BASE_URL}/api/v1/job/{job_id}/download"
    
    return JobStatusResponse(
        jobId=job_id,
        status=job['status'],
        progress=job.get('progress', 0),
        currentStep=job.get('currentStep'),
        videoUrl=video_url,
        error=job.get('error')
    )

@app.get("/api/v1/job/{job_id}/download")
async def download_video(
    job_id: str,
    manager: JobManager = Depends(get_job_manager)
):
    """
    완성된 영상 다운로드
    """
    job = manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job['status'] != 'completed':
        raise HTTPException(status_code=400, detail="Job not completed")
    
    video_path = job.get('videoPath')
    if not video_path or not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="Video file not found")
    
    return FileResponse(
        video_path,
        media_type="video/mp4",
        filename=f"shortform-{job_id}.mp4",
        headers={
            "Content-Disposition": f"attachment; filename=shortform-{job_id}.mp4"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
        log_level="info"
    )
