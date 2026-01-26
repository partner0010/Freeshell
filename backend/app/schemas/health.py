"""
헬스체크 스키마
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel


class HealthResponse(BaseModel):
    """기본 헬스체크 응답"""
    status: str


class HealthDetailResponse(BaseModel):
    """상세 헬스체크 응답"""
    status: str
    database: Dict[str, Any]
    external_apis: Dict[str, Dict[str, Any]]
