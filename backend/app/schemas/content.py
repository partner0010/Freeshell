"""
콘텐츠 생성 스키마
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class Resolution(str, Enum):
    """해상도"""
    P720 = "720p"
    P1080 = "1080p"


class JobStatus(str, Enum):
    """작업 상태"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ContentGenerationOptions(BaseModel):
    """콘텐츠 생성 옵션"""
    resolution: Resolution = Field(default=Resolution.P1080, description="해상도")
    with_audio: bool = Field(default=True, description="오디오 포함 여부")
    with_subtitles: bool = Field(default=False, description="자막 포함 여부")


class ContentGenerationRequest(BaseModel):
    """콘텐츠 생성 요청"""
    project_id: str = Field(..., description="프로젝트 ID")
    prompt_analysis_id: str = Field(..., description="프롬프트 분석 ID")
    options: ContentGenerationOptions = Field(
        default_factory=ContentGenerationOptions,
        description="생성 옵션"
    )


class ContentGenerationResponse(BaseModel):
    """콘텐츠 생성 응답"""
    job_id: str = Field(..., description="작업 ID")
    status: JobStatus = Field(..., description="작업 상태")
    estimated_time: int = Field(..., description="예상 소요 시간 (초)")


class ContentResult(BaseModel):
    """콘텐츠 결과"""
    video_url: str = Field(..., description="비디오 URL")
    thumbnail_url: Optional[str] = Field(None, description="썸네일 URL")
    duration: float = Field(..., description="길이 (초)")


class ContentStatusResponse(BaseModel):
    """콘텐츠 상태 응답"""
    status: JobStatus = Field(..., description="작업 상태")
    progress: int = Field(..., description="진행률 (0-100)")
    result: Optional[ContentResult] = Field(None, description="결과 (완료 시)")
    error: Optional[str] = Field(None, description="에러 메시지 (실패 시)")
