"""
Content 모듈 - Pydantic 스키마
"""
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime

# 모델은 타입 힌트용으로만 사용 (실제로는 database.models에서 import)


# ========== Content Schemas ==========

class ContentCreate(BaseModel):
    """콘텐츠 생성 요청"""
    project_id: str = Field(..., description="프로젝트 ID")
    type: str = Field(..., description="콘텐츠 타입 (video, image, audio, text)")
    url: Optional[str] = Field(None, description="콘텐츠 URL")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="메타데이터")


class ContentUpdate(BaseModel):
    """콘텐츠 수정 요청"""
    url: Optional[str] = Field(None, description="콘텐츠 URL")
    metadata: Optional[Dict[str, Any]] = Field(None, description="메타데이터")


class ContentResponse(BaseModel):
    """콘텐츠 응답"""
    id: str
    project_id: str
    type: str
    url: Optional[str]
    metadata: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


# ========== Project Schemas ==========

class ProjectCreate(BaseModel):
    """프로젝트 생성 요청"""
    title: str = Field(..., min_length=1, max_length=200, description="프로젝트 제목")
    description: Optional[str] = Field(None, max_length=1000, description="프로젝트 설명")
    type: Optional[str] = Field(None, description="프로젝트 타입")


class ProjectUpdate(BaseModel):
    """프로젝트 수정 요청"""
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="프로젝트 제목")
    description: Optional[str] = Field(None, max_length=1000, description="프로젝트 설명")
    status: Optional[str] = Field(None, description="프로젝트 상태 (active, archived, deleted)")


class ProjectResponse(BaseModel):
    """프로젝트 응답"""
    id: str
    user_id: str
    title: str
    description: Optional[str]
    status: str
    type: Optional[str]
    created_at: datetime
    contents: List[ContentResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    """프로젝트 목록 응답"""
    projects: List[ProjectResponse]
    total: int
    page: int
    page_size: int
