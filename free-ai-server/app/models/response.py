"""
응답 스키마 정의
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class GenerateResponse(BaseModel):
    """생성 응답"""
    success: bool = Field(..., description="성공 여부")
    content: str = Field(..., description="생성된 내용")
    model: str = Field(..., description="사용된 모델")
    tokens_used: Optional[int] = Field(None, description="사용된 토큰 수")
    response_time: Optional[float] = Field(None, description="응답 시간 (초)")
    cached: bool = Field(False, description="캐시 사용 여부")
    timestamp: datetime = Field(default_factory=datetime.now, description="생성 시간")


class ErrorResponse(BaseModel):
    """에러 응답"""
    success: bool = Field(False, description="성공 여부")
    error: str = Field(..., description="에러 메시지")
    error_code: Optional[str] = Field(None, description="에러 코드")
    timestamp: datetime = Field(default_factory=datetime.now, description="에러 발생 시간")


class HealthResponse(BaseModel):
    """헬스체크 응답"""
    status: str = Field(..., description="서버 상태")
    ollama_connected: bool = Field(..., description="Ollama 연결 상태")
    available_models: list = Field(..., description="사용 가능한 모델 목록")
    server_uptime: Optional[float] = Field(None, description="서버 가동 시간 (초)")
