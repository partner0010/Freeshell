"""
요청 스키마 정의
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any


class GenerateTextRequest(BaseModel):
    """텍스트 생성 요청"""
    prompt: str = Field(..., min_length=1, max_length=10000, description="생성할 텍스트의 프롬프트")
    model: Optional[str] = Field(None, description="사용할 모델 (기본값: llama3.1:8b)")
    max_tokens: Optional[int] = Field(2000, ge=1, le=8000, description="최대 토큰 수")
    temperature: Optional[float] = Field(0.7, ge=0.0, le=2.0, description="생성 온도")
    top_p: Optional[float] = Field(0.9, ge=0.0, le=1.0, description="Top-p 샘플링")
    system_prompt: Optional[str] = Field(None, description="시스템 프롬프트")
    
    @validator('prompt')
    def validate_prompt(cls, v):
        if not v or not v.strip():
            raise ValueError('프롬프트는 비어있을 수 없습니다.')
        return v.strip()


class GenerateCodeRequest(BaseModel):
    """코드 생성 요청"""
    prompt: str = Field(..., min_length=1, max_length=10000, description="코드 생성 프롬프트")
    language: str = Field(..., description="프로그래밍 언어 (python, javascript, typescript, etc.)")
    model: Optional[str] = Field(None, description="사용할 모델 (기본값: deepseek-coder:6.7b)")
    max_tokens: Optional[int] = Field(4000, ge=1, le=16000, description="최대 토큰 수")
    temperature: Optional[float] = Field(0.2, ge=0.0, le=1.0, description="생성 온도 (코드는 낮게)")
    include_tests: Optional[bool] = Field(False, description="테스트 코드 포함 여부")
    include_comments: Optional[bool] = Field(True, description="주석 포함 여부")
    
    @validator('language')
    def validate_language(cls, v):
        valid_languages = [
            'python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'go',
            'rust', 'php', 'ruby', 'swift', 'kotlin', 'html', 'css', 'sql'
        ]
        if v.lower() not in valid_languages:
            raise ValueError(f'지원하지 않는 언어입니다. 지원 언어: {", ".join(valid_languages)}')
        return v.lower()


class GeneratePromptRequest(BaseModel):
    """프롬프트 최적화 요청"""
    original_prompt: str = Field(..., min_length=1, max_length=10000, description="원본 프롬프트")
    purpose: str = Field(..., description="목적 (text, code, analysis, etc.)")
    model: Optional[str] = Field(None, description="사용할 모델 (기본값: qwen2.5:7b)")
    max_tokens: Optional[int] = Field(2000, ge=1, le=8000, description="최대 토큰 수")
    temperature: Optional[float] = Field(0.5, ge=0.0, le=1.0, description="생성 온도")
    style: Optional[str] = Field("professional", description="스타일 (professional, casual, technical)")
    
    @validator('purpose')
    def validate_purpose(cls, v):
        valid_purposes = ['text', 'code', 'analysis', 'creative', 'technical']
        if v.lower() not in valid_purposes:
            raise ValueError(f'지원하지 않는 목적입니다. 지원 목적: {", ".join(valid_purposes)}')
        return v.lower()
