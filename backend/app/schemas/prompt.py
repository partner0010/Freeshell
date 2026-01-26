"""
프롬프트 분석 스키마
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class PromptAnalyzeRequest(BaseModel):
    """프롬프트 분석 요청"""
    text: str = Field(..., description="분석할 프롬프트 텍스트", min_length=1, max_length=5000)
    type: str = Field(..., description="콘텐츠 타입 (short 또는 long)")


class PromptAnalysisResponse(BaseModel):
    """프롬프트 분석 응답"""
    topic: str = Field(..., description="주제")
    tone: str = Field(..., description="톤")
    keywords: List[str] = Field(default_factory=list, description="키워드")
    suggested_duration: int = Field(..., description="제안된 길이 (초)")
    content_type: str = Field(..., description="콘텐츠 타입")
    intent: Optional[str] = Field(None, description="의도")
    target_audience: Optional[str] = Field(None, description="타겟 오디언스")
    complexity: Optional[str] = Field(None, description="복잡도")


class SceneResponse(BaseModel):
    """씬 응답"""
    scene_number: int
    description: str
    visual_elements: List[str] = Field(default_factory=list)
    audio_elements: Optional[str] = None
    duration: int
    transitions: Optional[str] = None


class PlanResponse(BaseModel):
    """계획 응답"""
    scenes: List[SceneResponse] = Field(default_factory=list)
    script_outline: str
    visual_style: str
    title: Optional[str] = None
    description: Optional[str] = None
    total_duration: Optional[int] = None
    color_palette: Optional[List[str]] = None
    music_suggestion: Optional[str] = None


class PromptAnalyzeResponse(BaseModel):
    """프롬프트 분석 전체 응답"""
    analysis: PromptAnalysisResponse
    plan: PlanResponse
