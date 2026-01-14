"""
모션 처리 파이프라인
"""

import os
from typing import Dict, Any, Optional, List
from pathlib import Path
import json

from .motion_schema import MotionData, ExpressionType, MotionType
from ..core.engine import Engine, EngineType, EngineResult
from ..utils.logger import get_logger

logger = get_logger(__name__)


class MotionPipeline:
    """모션 처리 파이프라인"""
    
    def __init__(self):
        self.ai_engines: List[Engine] = []
        self.rule_engines: List[Engine] = []
    
    def register_ai_engine(self, engine: Engine):
        """AI Engine 등록"""
        if engine.engine_type == EngineType.AI:
            self.ai_engines.append(engine)
            logger.info(f"AI motion engine registered: {engine.name}")
    
    def register_rule_engine(self, engine: Engine):
        """Rule Engine 등록"""
        if engine.engine_type == EngineType.RULE:
            self.rule_engines.append(engine)
            logger.info(f"Rule motion engine registered: {engine.name}")
    
    async def process(
        self,
        image_path: str,
        prompt: str,
        duration: float = 5.0,
        use_ai: bool = True
    ) -> MotionData:
        """
        이미지에 모션 적용
        
        Args:
            image_path: 이미지 파일 경로
            prompt: 모션 프롬프트 (예: "행복한 표정, 눈 깜빡임, 고개 끄덕임")
            duration: 영상 길이 (초)
            use_ai: AI 사용 여부
            
        Returns:
            MotionData: 모션 데이터
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        # 1. 프롬프트 분석
        motion_types = self._analyze_prompt(prompt)
        
        # 2. AI 또는 Rule 기반 모션 생성
        if use_ai and self.ai_engines:
            motion_data = await self._generate_ai_motion(
                image_path, prompt, duration, motion_types
            )
        else:
            motion_data = await self._generate_rule_motion(
                image_path, prompt, duration, motion_types
            )
        
        return motion_data
    
    def _analyze_prompt(self, prompt: str) -> List[MotionType]:
        """프롬프트에서 모션 타입 추출"""
        prompt_lower = prompt.lower()
        motion_types = []
        
        # 키워드 매칭
        if any(kw in prompt_lower for kw in ['표정', 'expression', '감정', 'emotion']):
            motion_types.append(MotionType.EXPRESSION)
        
        if any(kw in prompt_lower for kw in ['눈', 'eye', '깜빡', 'blink', '시선', 'gaze']):
            motion_types.append(MotionType.EYE)
        
        if any(kw in prompt_lower for kw in ['호흡', 'breath', '숨']):
            motion_types.append(MotionType.BREATH)
        
        if any(kw in prompt_lower for kw in ['고개', 'head', '끄덕', 'nod', '흔들', 'shake']):
            motion_types.append(MotionType.HEAD)
        
        if any(kw in prompt_lower for kw in ['몸', 'body', '움직임', 'move']):
            motion_types.append(MotionType.BODY)
        
        if any(kw in prompt_lower for kw in ['입술', 'lip', '말', 'speak', '대사']):
            motion_types.append(MotionType.LIP_SYNC)
        
        # 기본값: 표정 + 눈
        if not motion_types:
            motion_types = [MotionType.EXPRESSION, MotionType.EYE]
        
        return motion_types
    
    async def _generate_ai_motion(
        self,
        image_path: str,
        prompt: str,
        duration: float,
        motion_types: List[MotionType]
    ) -> MotionData:
        """AI 기반 모션 생성"""
        motion_data = MotionData(image_path=image_path, duration=duration)
        
        # AI Engine 시도
        for engine in self.ai_engines:
            try:
                result = await engine.execute({
                    'image_path': image_path,
                    'prompt': prompt,
                    'duration': duration,
                    'motion_types': [mt.value for mt in motion_types]
                })
                
                if result.success:
                    # AI 결과 파싱
                    ai_data = result.data
                    if isinstance(ai_data, dict):
                        motion_data = self._parse_ai_result(ai_data, motion_data)
                        logger.info(f"AI motion generated using {engine.name}")
                        return motion_data
            except Exception as e:
                logger.warning(f"AI engine {engine.name} failed: {e}")
                continue
        
        # AI 실패 시 Rule로 Fallback
        logger.info("AI motion generation failed, falling back to rule-based")
        return await self._generate_rule_motion(image_path, prompt, duration, motion_types)
    
    async def _generate_rule_motion(
        self,
        image_path: str,
        prompt: str,
        duration: float,
        motion_types: List[MotionType]
    ) -> MotionData:
        """Rule 기반 모션 생성"""
        motion_data = MotionData(image_path=image_path, duration=duration)
        
        # Rule Engine 시도
        for engine in self.rule_engines:
            try:
                result = await engine.execute({
                    'image_path': image_path,
                    'prompt': prompt,
                    'duration': duration,
                    'motion_types': [mt.value for mt in motion_types]
                })
                
                if result.success:
                    rule_data = result.data
                    if isinstance(rule_data, dict):
                        motion_data = self._parse_rule_result(rule_data, motion_data)
                        logger.info(f"Rule motion generated using {engine.name}")
                        return motion_data
            except Exception as e:
                logger.warning(f"Rule engine {engine.name} failed: {e}")
                continue
        
        # 기본 모션 생성
        return self._generate_default_motion(motion_data, motion_types)
    
    def _parse_ai_result(self, ai_data: Dict[str, Any], motion_data: MotionData) -> MotionData:
        """AI 결과 파싱"""
        # AI 결과 구조에 따라 파싱
        if 'expressions' in ai_data:
            for expr in ai_data['expressions']:
                motion_data.expressions.append(
                    ExpressionData(
                        type=ExpressionType(expr.get('type', 'neutral')),
                        intensity=expr.get('intensity', 1.0),
                        duration=expr.get('duration', 1.0),
                        start_time=expr.get('start_time', 0.0)
                    )
                )
        
        # Eye, Breath, Head, Body 등도 파싱
        # ... (구현 생략)
        
        return motion_data
    
    def _parse_rule_result(self, rule_data: Dict[str, Any], motion_data: MotionData) -> MotionData:
        """Rule 결과 파싱"""
        # Rule 결과 구조에 따라 파싱
        # AI와 유사하지만 더 구조화된 형태
        return self._parse_ai_result(rule_data, motion_data)
    
    def _generate_default_motion(
        self,
        motion_data: MotionData,
        motion_types: List[MotionType]
    ) -> MotionData:
        """기본 모션 생성 (Fallback)"""
        from .motion_schema import EyeMotion, BreathMotion
        
        # 기본 눈 깜빡임
        if MotionType.EYE in motion_types:
            motion_data.eye = EyeMotion(
                blink_interval=3.0,
                blink_duration=0.15
            )
        
        # 기본 호흡
        if MotionType.BREATH in motion_types:
            motion_data.breath = BreathMotion(
                cycle_duration=3.0,
                intensity=0.02
            )
        
        # 기본 표정
        if MotionType.EXPRESSION in motion_types:
            motion_data.expressions.append(
                ExpressionData(
                    type=ExpressionType.NEUTRAL,
                    intensity=1.0,
                    duration=motion_data.duration,
                    start_time=0.0
                )
            )
        
        logger.info("Default motion generated")
        return motion_data
