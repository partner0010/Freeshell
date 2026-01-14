"""
사진 → 모션 처리 파이프라인 (실서비스 버전)
"""

from typing import Dict, Any, Optional, List, Tuple
from enum import Enum
from dataclasses import dataclass
import os
import json

from .motion_schema import MotionData, ExpressionType, MotionType, ExpressionData
from .motion_templates import MotionTemplates
from ..orchestrator import Orchestrator
from ..utils.logger import get_logger

logger = get_logger(__name__)


class MotionLevel(Enum):
    """모션 레벨"""
    BASIC = "basic"          # 사전 정의 모션
    ENHANCED = "enhanced"    # 프롬프트 기반 선택
    ADVANCED = "advanced"    # AI 모션 생성
    FALLBACK = "fallback"    # 규칙 기반 자동 적용


@dataclass
class MotionPipelineResult:
    """모션 파이프라인 결과"""
    success: bool
    motion_data: Optional[MotionData] = None
    level: MotionLevel = MotionLevel.BASIC
    method: str = ""
    error: Optional[str] = None


class MotionPipelineV2:
    """사진 → 모션 처리 파이프라인 (실서비스 버전)"""
    
    def __init__(self, orchestrator: Optional[Orchestrator] = None):
        self.orchestrator = orchestrator
        self.templates = MotionTemplates()
    
    async def process(
        self,
        image_path: str,
        prompt: str,
        duration: float = 5.0,
        use_ai: bool = True
    ) -> MotionPipelineResult:
        """
        이미지에 모션 적용
        
        Args:
            image_path: 이미지 파일 경로
            prompt: 모션 프롬프트
            duration: 영상 길이 (초)
            use_ai: AI 사용 여부
            
        Returns:
            MotionPipelineResult: 처리 결과
        """
        if not os.path.exists(image_path):
            return MotionPipelineResult(
                success=False,
                error=f"Image not found: {image_path}"
            )
        
        # 1. 기본: 사전 정의 모션 (항상 사용 가능)
        basic_motion = self.templates.get_default_motion(duration)
        
        # 2. 향상: 프롬프트 기반 모션 선택
        enhanced_motion = self._select_motion_from_prompt(prompt, basic_motion)
        
        # 3. 고급: AI 모션 생성 (선택적)
        if use_ai and self.orchestrator:
            ai_result = await self._generate_ai_motion(
                image_path, prompt, duration, enhanced_motion
            )
            if ai_result.success:
                return MotionPipelineResult(
                    success=True,
                    motion_data=ai_result.motion_data,
                    level=MotionLevel.ADVANCED,
                    method="ai_generation"
                )
        
        # 4. 실패: 규칙 기반 자동 적용
        return MotionPipelineResult(
            success=True,
            motion_data=enhanced_motion,
            level=MotionLevel.ENHANCED if enhanced_motion != basic_motion else MotionLevel.BASIC,
            method="prompt_selection" if enhanced_motion != basic_motion else "default_template"
        )
    
    def _select_motion_from_prompt(
        self,
        prompt: str,
        base_motion: MotionData
    ) -> MotionData:
        """프롬프트 기반 모션 선택"""
        prompt_lower = prompt.lower()
        
        # 표정 키워드 매칭
        expression_keywords = {
            ExpressionType.HAPPY: ['행복', '기쁨', '웃음', 'happy', 'smile', 'joy'],
            ExpressionType.SAD: ['슬픔', '우울', 'sad', 'depressed'],
            ExpressionType.EXCITED: ['흥분', '신남', 'excited', 'thrilled'],
            ExpressionType.CALM: ['차분', '평온', 'calm', 'peaceful'],
            ExpressionType.SURPRISED: ['놀람', 'surprised', 'shocked']
        }
        
        for expr_type, keywords in expression_keywords.items():
            if any(kw in prompt_lower for kw in keywords):
                base_motion.expressions = [
                    ExpressionData(
                        type=expr_type,
                        intensity=0.8,
                        duration=base_motion.duration,
                        start_time=0.0
                    )
                ]
                break
        
        # 모션 타입 키워드 매칭
        if any(kw in prompt_lower for kw in ['고개', 'head', '끄덕', 'nod']):
            from .motion_schema import HeadMotion
            base_motion.head = HeadMotion(
                nod_enabled=True,
                duration=1.0,
                rotation_speed=0.5
            )
        
        if any(kw in prompt_lower for kw in ['호흡', 'breath', '숨']):
            from .motion_schema import BreathMotion
            base_motion.breath = BreathMotion(
                cycle_duration=3.0,
                intensity=0.02
            )
        
        if any(kw in prompt_lower for kw in ['눈', 'eye', '깜빡', 'blink']):
            from .motion_schema import EyeMotion
            base_motion.eye = EyeMotion(
                blink_interval=3.0,
                blink_duration=0.15
            )
        
        return base_motion
    
    async def _generate_ai_motion(
        self,
        image_path: str,
        prompt: str,
        duration: float,
        base_motion: MotionData
    ) -> MotionPipelineResult:
        """AI 모션 생성"""
        if not self.orchestrator:
            return MotionPipelineResult(success=False, error="Orchestrator not available")
        
        try:
            context = {
                'image_path': image_path,
                'prompt': prompt,
                'duration': duration,
                'base_motion': base_motion.to_dict()
            }
            
            result = await self.orchestrator.process(
                intent="generate_motion",
                context=context
            )
            
            if result.success:
                # AI 결과 파싱
                ai_data = result.data
                if isinstance(ai_data, dict):
                    # MotionData.from_dict가 없으면 직접 생성
                    try:
                        motion_data = MotionData.from_dict(ai_data)
                    except:
                        # 직접 생성
                        motion_data = MotionData(
                            image_path=image_path,
                            duration=duration
                        )
                        # AI 데이터에서 필드 복사
                        if 'expressions' in ai_data:
                            for expr in ai_data['expressions']:
                                motion_data.expressions.append(
                                    ExpressionData(
                                        type=ExpressionType(expr.get('type', 'neutral')),
                                        intensity=expr.get('intensity', 1.0),
                                        duration=expr.get('duration', duration),
                                        start_time=expr.get('start_time', 0.0)
                                    )
                                )
                    
                    return MotionPipelineResult(
                        success=True,
                        motion_data=motion_data,
                        level=MotionLevel.ADVANCED,
                        method="ai_generation"
                    )
            
            return MotionPipelineResult(success=False, error="AI generation failed")
            
        except Exception as e:
            logger.warning(f"AI motion generation failed: {e}")
            return MotionPipelineResult(success=False, error=str(e))
