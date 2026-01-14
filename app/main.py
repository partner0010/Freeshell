"""
FastAPI 메인 서버
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from orchestrator.orchestrator import Orchestrator
from models.request import ContentRequest
from models.response import ContentResponse
from utils.logger import get_logger

logger = get_logger(__name__)

app = FastAPI(title="AI Content Platform API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Orchestrator 초기화
orchestrator = Orchestrator()


@app.post("/generate/shortform", response_model=ContentResponse)
def generate_shortform(request: ContentRequest):
    """
    숏폼 생성
    
    Args:
        request: 생성 요청
        
    Returns:
        생성 결과
    """
    try:
        result = orchestrator.handle({
            'prompt': request.prompt,
            'type': 'shortform',
            'duration': request.duration,
            'style': request.style,
            'purpose': request.purpose,
            'subject_name': request.subject_name,
            'subject_status': request.subject_status,
            'consent': request.consent,
            'options': request.options or {}
        })
        
        return ContentResponse(**result)
        
    except Exception as e:
        logger.error(f"Shortform generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate/image", response_model=ContentResponse)
def generate_image(request: ContentRequest):
    """이미지 생성"""
    try:
        result = orchestrator.handle({
            'prompt': request.prompt,
            'type': 'image',
            'style': request.style,
            'purpose': request.purpose,
            'options': request.options or {}
        })
        
        return ContentResponse(**result)
        
    except Exception as e:
        logger.error(f"Image generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate/motion", response_model=ContentResponse)
def generate_motion(request: ContentRequest):
    """모션 생성"""
    try:
        result = orchestrator.handle({
            'prompt': request.prompt,
            'type': 'motion',
            'image_path': request.options.get('image_path') if request.options else None,
            'purpose': request.purpose,
            'options': request.options or {}
        })
        
        return ContentResponse(**result)
        
    except Exception as e:
        logger.error(f"Motion generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/task/{task_id}")
def get_task_status(task_id: str):
    """작업 상태 조회"""
    status = orchestrator.get_task_status(task_id)
    if not status:
        raise HTTPException(status_code=404, detail="Task not found")
    return status


@app.get("/health")
def health_check():
    """헬스 체크"""
    return {"status": "ok", "service": "AI Content Platform"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
