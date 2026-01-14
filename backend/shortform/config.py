"""
설정 관리
개발(노트북) / 운영(서버) 환경 분리
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 환경
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # 서버 설정
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # API 설정
    API_BASE_URL: str = os.getenv("API_BASE_URL", "http://localhost:8000")
    
    # CORS 설정
    ALLOWED_ORIGINS: List[str] = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,https://your-netlify-domain.netlify.app"
    ).split(",")
    
    # 작업 큐 설정
    MAX_CONCURRENT_JOBS: int = int(os.getenv("MAX_CONCURRENT_JOBS", "1"))
    
    # GPU 설정
    GPU_ENABLED: bool = os.getenv("GPU_ENABLED", "true").lower() == "true"
    GPU_TYPE: str = os.getenv("GPU_TYPE", "laptop")  # 'laptop' | 'server'
    
    # Ollama 설정
    OLLAMA_URL: str = os.getenv("OLLAMA_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.1:8b-q4")
    
    # Stable Diffusion 설정
    STABLE_DIFFUSION_URL: str = os.getenv("STABLE_DIFFUSION_URL", "http://localhost:7860")
    STABLE_DIFFUSION_ENABLED: bool = os.getenv("STABLE_DIFFUSION_ENABLED", "false").lower() == "true"
    
    # TTS 설정
    TTS_ENGINE: str = os.getenv("TTS_ENGINE", "edge")  # 'edge' | 'coqui'
    
    # 파일 저장 설정
    STORAGE_PATH: str = os.getenv("STORAGE_PATH", "/tmp/shortform")
    VIDEO_STORAGE_PATH: str = os.getenv("VIDEO_STORAGE_PATH", "/tmp/shortform/videos")
    JOB_STORAGE_PATH: str = os.getenv("JOB_STORAGE_PATH", "/tmp/shortform/jobs")
    
    # 보안 설정
    API_KEY: Optional[str] = os.getenv("API_KEY", None)
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()

# 디렉토리 생성
os.makedirs(settings.VIDEO_STORAGE_PATH, exist_ok=True)
os.makedirs(settings.JOB_STORAGE_PATH, exist_ok=True)
