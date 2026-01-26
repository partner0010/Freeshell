"""
AI 오케스트레이터 서비스
"""

import os
import json
import time
from typing import Optional
from openai import OpenAI, OpenAIError
from openai.types.chat import ChatCompletion

from ..models.orchestrator import PromptAnalysis, ContentPlan, Script
from ..utils.logger import get_logger

logger = get_logger(__name__)


class AIOrchestrator:
    """AI 오케스트레이터 - 프롬프트 분석, 계획 생성, 스크립트 생성"""

    def __init__(self, api_key: Optional[str] = None):
        """
        AI 오케스트레이터 초기화
        
        Args:
            api_key: OpenAI API 키 (없으면 환경 변수에서 가져옴)
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY environment variable.")
        
        self.client = OpenAI(api_key=self.api_key)
        self.model = "gpt-4o"
        self.max_retries = 3
        self.retry_delay = 1.0  # 초

    def _call_openai(
        self,
        messages: list,
        response_format: Optional[dict] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> ChatCompletion:
        """
        OpenAI API 호출 (재시도 로직 포함)
        
        Args:
            messages: 메시지 리스트
            response_format: 응답 포맷 (JSON mode 등)
            temperature: 온도
            max_tokens: 최대 토큰 수
            
        Returns:
            ChatCompletion 객체
            
        Raises:
            Exception: 재시도 후에도 실패 시
        """
        last_error = None
        
        for attempt in range(self.max_retries):
            try:
                kwargs = {
                    "model": self.model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                }
                
                if response_format:
                    kwargs["response_format"] = response_format
                
                response = self.client.chat.completions.create(**kwargs)
                return response
                
            except OpenAIError as e:
                last_error = e
                logger.warning(f"OpenAI API call failed (attempt {attempt + 1}/{self.max_retries}): {e}")
                
                if attempt < self.max_retries - 1:
                    # 지수 백오프
                    delay = self.retry_delay * (2 ** attempt)
                    time.sleep(delay)
                else:
                    logger.error(f"OpenAI API call failed after {self.max_retries} attempts")
                    raise
                    
            except Exception as e:
                logger.error(f"Unexpected error in OpenAI API call: {e}")
                raise
        
        if last_error:
            raise last_error

    def analyze_prompt(self, text: str) -> PromptAnalysis:
        """
        프롬프트 분석
        
        Args:
            text: 분석할 프롬프트 텍스트
            
        Returns:
            PromptAnalysis 객체
        """
        system_prompt = """You are an expert content analyst. Analyze the given prompt and extract key information.

Analyze the prompt and return a JSON object with the following structure:
{
  "intent": "user's intent in one sentence",
  "content_type": "video|image|audio|text|mixed",
  "key_points": ["key point 1", "key point 2", ...],
  "tone": "formal|casual|friendly|professional|humorous|etc",
  "target_audience": "target audience description",
  "duration_estimate": 60 (in seconds, null if not applicable),
  "complexity": "simple|medium|complex",
  "metadata": {}
}

Be thorough and accurate in your analysis."""

        user_prompt = f"Analyze this prompt: {text}"

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        try:
            response = self._call_openai(
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=1000,
            )

            content = response.choices[0].message.content
            if not content:
                raise ValueError("Empty response from OpenAI")

            analysis_data = json.loads(content)
            return PromptAnalysis(**analysis_data)

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            raise ValueError(f"Invalid JSON response from AI: {e}")
        except Exception as e:
            logger.error(f"Error in analyze_prompt: {e}")
            raise

    def generate_plan(self, analysis: PromptAnalysis) -> ContentPlan:
        """
        콘텐츠 계획 생성
        
        Args:
            analysis: 프롬프트 분석 결과
            
        Returns:
            ContentPlan 객체
        """
        system_prompt = """You are an expert content planner. Create a detailed content plan based on the analysis.

Return a JSON object with the following structure:
{
  "title": "content title",
  "description": "content description",
  "total_duration": 120 (in seconds),
  "scenes": [
    {
      "scene_number": 1,
      "description": "scene description",
      "visual_elements": ["element1", "element2"],
      "audio_elements": "audio description or null",
      "duration": 30 (in seconds),
      "transitions": "transition type or null"
    }
  ],
  "style": "visual style description",
  "color_palette": ["#color1", "#color2"] or null,
  "music_suggestion": "music suggestion or null",
  "metadata": {}
}

Create a detailed, actionable plan with multiple scenes."""

        user_prompt = f"""Create a content plan based on this analysis:
Intent: {analysis.intent}
Content Type: {analysis.content_type}
Key Points: {', '.join(analysis.key_points)}
Tone: {analysis.tone}
Target Audience: {analysis.target_audience}
Complexity: {analysis.complexity}
"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        try:
            response = self._call_openai(
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.5,
                max_tokens=2000,
            )

            content = response.choices[0].message.content
            if not content:
                raise ValueError("Empty response from OpenAI")

            plan_data = json.loads(content)
            return ContentPlan(**plan_data)

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            raise ValueError(f"Invalid JSON response from AI: {e}")
        except Exception as e:
            logger.error(f"Error in generate_plan: {e}")
            raise

    def generate_script(self, plan: ContentPlan) -> Script:
        """
        스크립트 생성
        
        Args:
            plan: 콘텐츠 계획
            
        Returns:
            Script 객체
        """
        system_prompt = """You are an expert scriptwriter. Create a detailed script based on the content plan.

Return a JSON object with the following structure:
{
  "title": "script title",
  "total_duration": 120 (in seconds),
  "lines": [
    {
      "line_number": 1,
      "speaker": "narrator|character name or null",
      "text": "dialogue or narration text",
      "timing": 5 (in seconds, cumulative or relative),
      "scene_number": 1,
      "emphasis": ["word1", "word2"] or null
    }
  ],
  "narration_style": "narration style description",
  "metadata": {}
}

Create natural, engaging dialogue and narration that matches the plan."""

        scenes_text = "\n".join([
            f"Scene {s.scene_number}: {s.description} (Duration: {s.duration}s)"
            for s in plan.scenes
        ])

        user_prompt = f"""Create a script based on this plan:
Title: {plan.title}
Description: {plan.description}
Style: {plan.style}

Scenes:
{scenes_text}

Total Duration: {plan.total_duration} seconds
"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        try:
            response = self._call_openai(
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.7,
                max_tokens=3000,
            )

            content = response.choices[0].message.content
            if not content:
                raise ValueError("Empty response from OpenAI")

            script_data = json.loads(content)
            return Script(**script_data)

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            raise ValueError(f"Invalid JSON response from AI: {e}")
        except Exception as e:
            logger.error(f"Error in generate_script: {e}")
            raise

    def process_prompt(self, text: str) -> dict:
        """
        전체 프로세스 실행 (분석 -> 계획 -> 스크립트)
        
        Args:
            text: 프롬프트 텍스트
            
        Returns:
            분석, 계획, 스크립트를 포함한 딕셔너리
        """
        try:
            logger.info(f"Processing prompt: {text[:100]}...")
            
            # 1. 프롬프트 분석
            analysis = self.analyze_prompt(text)
            logger.info(f"Analysis completed: {analysis.intent}")
            
            # 2. 계획 생성
            plan = self.generate_plan(analysis)
            logger.info(f"Plan generated: {plan.title} ({len(plan.scenes)} scenes)")
            
            # 3. 스크립트 생성
            script = self.generate_script(plan)
            logger.info(f"Script generated: {script.title} ({len(script.lines)} lines)")
            
            return {
                "analysis": analysis.model_dump(),
                "plan": plan.model_dump(),
                "script": script.model_dump(),
            }
            
        except Exception as e:
            logger.error(f"Error in process_prompt: {e}")
            raise
