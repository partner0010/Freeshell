"""
설정 관리 모듈
"""
import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """애플리케이션 설정"""
    
    # Ollama 설정
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_TIMEOUT: int = int(os.getenv("OLLAMA_TIMEOUT", "120"))
    
    # 모델 설정
    DEFAULT_TEXT_MODEL: str = os.getenv("DEFAULT_TEXT_MODEL", "llama3.1:8b")
    DEFAULT_CODE_MODEL: str = os.getenv("DEFAULT_CODE_MODEL", "deepseek-coder:6.7b")
    DEFAULT_PROMPT_MODEL: str = os.getenv("DEFAULT_PROMPT_MODEL", "qwen2.5:7b")
    
    # 사용 가능한 모델 목록
    AVAILABLE_MODELS: List[str] = [
        "llama3.1:8b",
        "llama3.1:70b",
        "deepseek-coder:6.7b",
        "qwen2.5:7b",
        "qwen2.5:14b",
        "mistral:7b",
    ]
    
    # 서버 설정
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    API_WORKERS: int = int(os.getenv("API_WORKERS", "1"))
    
    # 캐시 설정
    CACHE_ENABLED: bool = os.getenv("CACHE_ENABLED", "true").lower() == "true"
    CACHE_TTL: int = int(os.getenv("CACHE_TTL", "3600"))  # 1시간
    
    # 요청 제한
    MAX_REQUEST_LENGTH: int = int(os.getenv("MAX_REQUEST_LENGTH", "10000"))
    MAX_RESPONSE_LENGTH: int = int(os.getenv("MAX_RESPONSE_LENGTH", "50000"))
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
