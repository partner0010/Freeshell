"""
AI 오케스트레이터 모델
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class ContentType(str, Enum):
    """콘텐츠 타입"""
    VIDEO = "video"
    IMAGE = "image"
    AUDIO = "audio"
    TEXT = "text"
    MIXED = "mixed"


class PromptAnalysis(BaseModel):
    """프롬프트 분석 결과"""
    intent: str = Field(..., description="사용자 의도")
    content_type: ContentType = Field(..., description="콘텐츠 타입")
    key_points: List[str] = Field(default_factory=list, description="주요 포인트")
    tone: str = Field(..., description="톤 (formal, casual, friendly, etc.)")
    target_audience: str = Field(..., description="타겟 오디언스")
    duration_estimate: Optional[int] = Field(None, description="예상 길이 (초)")
    complexity: str = Field(..., description="복잡도 (simple, medium, complex)")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="추가 메타데이터")


class Scene(BaseModel):
    """씬 정보"""
    scene_number: int = Field(..., description="씬 번호")
    description: str = Field(..., description="씬 설명")
    visual_elements: List[str] = Field(default_factory=list, description="시각적 요소")
    audio_elements: Optional[str] = Field(None, description="오디오 요소")
    duration: int = Field(..., description="씬 길이 (초)")
    transitions: Optional[str] = Field(None, description="전환 효과")


class ContentPlan(BaseModel):
    """콘텐츠 계획"""
    title: str = Field(..., description="콘텐츠 제목")
    description: str = Field(..., description="콘텐츠 설명")
    total_duration: int = Field(..., description="총 길이 (초)")
    scenes: List[Scene] = Field(default_factory=list, description="씬 목록")
    style: str = Field(..., description="스타일")
    color_palette: Optional[List[str]] = Field(None, description="색상 팔레트")
    music_suggestion: Optional[str] = Field(None, description="음악 제안")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="추가 메타데이터")


class ScriptLine(BaseModel):
    """스크립트 라인"""
    line_number: int = Field(..., description="라인 번호")
    speaker: Optional[str] = Field(None, description="화자")
    text: str = Field(..., description="대사/내레이션")
    timing: int = Field(..., description="타이밍 (초)")
    scene_number: int = Field(..., description="연관된 씬 번호")
    emphasis: Optional[List[str]] = Field(None, description="강조할 단어/구")


class Script(BaseModel):
    """스크립트"""
    title: str = Field(..., description="스크립트 제목")
    total_duration: int = Field(..., description="총 길이 (초)")
    lines: List[ScriptLine] = Field(default_factory=list, description="스크립트 라인")
    narration_style: str = Field(..., description="내레이션 스타일")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="추가 메타데이터")
