"""
Request 모델
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class ContentRequest(BaseModel):
    """콘텐츠 생성 요청"""
    prompt: str = Field(..., description="생성 프롬프트")
    type: str = Field("shortform", description="콘텐츠 타입 (shortform, image, motion, voice)")
    duration: Optional[int] = Field(30, ge=15, le=60, description="영상 길이 (초)")
    style: Optional[str] = Field("animation", description="스타일")
    purpose: Optional[str] = Field("personal_archive", description="사용 목적")
    subject_name: Optional[str] = Field(None, description="대상 인물 이름")
    subject_status: Optional[str] = Field(None, description="대상 상태 (deceased, living, historical)")
    consent: Optional[Dict[str, Any]] = Field(None, description="동의 정보")
    options: Optional[Dict[str, Any]] = Field(None, description="추가 옵션")
    
    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "행복한 일상 영상을 만들어주세요",
                "type": "shortform",
                "duration": 30,
                "style": "animation"
            }
        }
