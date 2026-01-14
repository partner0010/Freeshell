"""
설정 관리
"""

import os
from typing import Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class Config:
    """설정 클래스"""
    # AI Providers
    ollama_url: str = os.getenv('OLLAMA_URL', 'http://localhost:11434')
    huggingface_api_key: Optional[str] = os.getenv('HUGGINGFACE_API_KEY')
    groq_api_key: Optional[str] = os.getenv('GROQ_API_KEY')
    together_api_key: Optional[str] = os.getenv('TOGETHER_API_KEY')
    
    # Timeouts
    ai_timeout: float = float(os.getenv('AI_TIMEOUT', '30.0'))
    
    # Template
    template_dir: str = os.getenv('TEMPLATE_DIR', 'templates')
    
    # Logging
    log_level: str = os.getenv('LOG_LEVEL', 'INFO')


_config_instance: Optional[Config] = None


def get_config() -> Config:
    """설정 인스턴스 반환"""
    global _config_instance
    if _config_instance is None:
        _config_instance = Config()
    return _config_instance
