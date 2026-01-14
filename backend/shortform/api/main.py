"""
STEP 1: 숏폼 자동 생성 백엔드 코드
FastAPI 기반 실제 구현
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import uuid
import os
from datetime import datetime

from .services.prompt_refiner import refine_prompt
from .services.script_generator import generate_script
from .services.scene_generator import generate_scene_json
from .services.character_generator import generate_characters
from .services.tts_generator import generate_voices
from .services.subtitle_generator import generate_subtitles
from .services.video_renderer import render_video
from .services.job_manager import JobManager

app = FastAPI(title="Shortform Generation API")

# 작업 관리자
job_manager = JobManager()

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

class JobStatusResponse(BaseModel):
    jobId: str
    status: str  # 'pending' | 'processing' | 'completed' | 'failed'
    progress: int  # 0-100
    currentStep: Optional[str]
    videoPath: Optional[str]
    error: Optional[str]

@app.post("/generate/shortform", response_model=ShortformResponse)
async def generate_shortform(
    request: ShortformRequest,
    background_tasks: BackgroundTasks
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
    job_manager.create_job(job_id, {
        'userPrompt': request.userPrompt,
        'style': request.style,
        'duration': request.duration,
        'userId': request.userId,
    })
    
    # 4. 백그라운드 작업 시작
    background_tasks.add_task(
        process_shortform_generation,
        job_id,
        request.userPrompt,
        request.style,
        request.duration,
        request.userId
    )
    
    return ShortformResponse(
        success=True,
        jobId=job_id,
        message="Shortform generation started"
    )

@app.get("/job/{job_id}/status", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """
    작업 상태 조회
    """
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobStatusResponse(
        jobId=job_id,
        status=job['status'],
        progress=job.get('progress', 0),
        currentStep=job.get('currentStep'),
        videoPath=job.get('videoPath'),
        error=job.get('error')
    )

@app.get("/job/{job_id}/download")
async def download_video(job_id: str):
    """
    완성된 영상 다운로드
    """
    job = job_manager.get_job(job_id)
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
        filename=f"shortform-{job_id}.mp4"
    )

async def process_shortform_generation(
    job_id: str,
    user_prompt: str,
    style: str,
    duration: int,
    user_id: str
):
    """
    숏폼 생성 전체 프로세스
    """
    try:
        # 단계 2: 프롬프트 정제
        job_manager.update_job(job_id, {
            'status': 'processing',
            'progress': 10,
            'currentStep': 'refining-prompt'
        })
        refined_prompt = refine_prompt(user_prompt, style, duration)
        
        # 단계 3: 스크립트 생성
        job_manager.update_job(job_id, {
            'progress': 20,
            'currentStep': 'generating-script'
        })
        script = await generate_script(refined_prompt)
        
        # 단계 4: Scene JSON 생성
        job_manager.update_job(job_id, {
            'progress': 30,
            'currentStep': 'generating-scenes'
        })
        scenes = await generate_scene_json(script, style, duration)
        
        # 단계 5: 캐릭터 메타 생성
        job_manager.update_job(job_id, {
            'progress': 40,
            'currentStep': 'generating-characters'
        })
        characters = await generate_characters(scenes, style)
        
        # 단계 6: TTS 음성 생성
        job_manager.update_job(job_id, {
            'progress': 50,
            'currentStep': 'generating-voices'
        })
        voice_files = await generate_voices(scenes, characters)
        
        # 단계 7: 자막 생성
        job_manager.update_job(job_id, {
            'progress': 60,
            'currentStep': 'generating-subtitles'
        })
        subtitles = await generate_subtitles(scenes)
        
        # 단계 8: FFmpeg 렌더링
        job_manager.update_job(job_id, {
            'progress': 70,
            'currentStep': 'rendering-video'
        })
        video_path = await render_video(scenes, characters, voice_files, subtitles, job_id)
        
        # 단계 9: 결과 반환
        job_manager.update_job(job_id, {
            'status': 'completed',
            'progress': 100,
            'currentStep': 'completed',
            'videoPath': video_path
        })
        
    except Exception as e:
        job_manager.update_job(job_id, {
            'status': 'failed',
            'error': str(e)
        })
        raise

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
