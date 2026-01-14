"""
Response 모델
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel


class ContentResponse(BaseModel):
    """콘텐츠 생성 응답"""
    success: bool
    data: Optional[Dict[str, Any]] = None
    task_id: Optional[str] = None
    execution_time: Optional[float] = None
    fallback_used: bool = False
    error: Optional[str] = None
    message: Optional[str] = None
