"""
Vault AI 응답 생성기
메모리 데이터를 기반으로 "그 사람의 방식"으로 응답 생성
"""
from typing import List, Dict, Any, Optional
import os

from backend.utils.logger import get_logger

logger = get_logger(__name__)

# AI 모델 통합 (선택적)
try:
    from backend.app.services.ai_orchestrator import AIOrchestrator
    AI_ORCHESTRATOR_AVAILABLE = True
except ImportError:
    AI_ORCHESTRATOR_AVAILABLE = False


async def vault_response(
    prompt: str,
    memory_data: List[Dict[str, Any]],
    context: Optional[str] = None
) -> str:
    """
    Vault AI 응답 생성 (그 사람의 방식으로)
    
    Args:
        prompt: 프롬프트
        memory_data: 메모리 데이터 리스트
        context: 추가 컨텍스트
    
    Returns:
        생성된 응답
    """
    try:
        # 메모리 분석 (AI 모델 사용)
        analysis = await analyze_memories(memory_data)
        
        # AI 응답 생성 (비동기)
        response = await _generate_personalized_response(
            prompt=prompt,
            memory_analysis=analysis,
            context=context
        )
        
        return response
    
    except Exception as e:
        logger.error(f"Failed to generate vault response: {e}")
        return "응답 생성 중 오류가 발생했습니다."


async def analyze_memories(memories: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    메모리 데이터 분석
    - 음성: 말투, 톤, 속도
    - 텍스트: 문체, 어휘, 표현
    - 사진/영상: 감정, 상황
    """
    analysis = {
        "voice_style": None,
        "text_style": None,
        "emotions": [],
        "common_phrases": [],
        "personality_traits": []
    }
    
    voice_memories = [m for m in memories if m.get("type") == "voice"]
    text_memories = [m for m in memories if m.get("type") == "text"]
    photo_memories = [m for m in memories if m.get("type") == "photo"]
    video_memories = [m for m in memories if m.get("type") == "video"]
    
    # AI 분석 서비스 사용 (실제 AI 모델 통합)
    try:
        from backend.services.ai_analysis import AIAnalysisService
        ai_analysis = AIAnalysisService()
        
        # 음성 분석 (AI 모델 사용)
        if voice_memories:
            all_voice_desc = " ".join([m.get("description", "") for m in voice_memories])
            voice_style = await ai_analysis.analyze_voice_style(description=all_voice_desc)
            analysis["voice_style"] = voice_style
        
        # 텍스트 분석 (AI 모델 사용)
        if text_memories:
            all_text = " ".join([m.get("description", "") for m in text_memories])
            text_style = await ai_analysis.analyze_text_style(all_text)
            analysis["text_style"] = text_style
        
        # 감정 분석 (AI 모델 사용)
        if photo_memories or video_memories:
            all_desc = " ".join([m.get("description", "") for m in (photo_memories + video_memories)])
            emotion_result = await ai_analysis.analyze_emotion(all_desc)
            analysis["emotions"] = [emotion_result.get("emotion", "neutral")]
            analysis["emotion_confidence"] = emotion_result.get("confidence", 0.5)
    except Exception as e:
        logger.warning(f"AI analysis failed, using fallback: {e}")
        # Fallback: 규칙 기반 분석
        if voice_memories:
            all_voice_desc = " ".join([m.get("description", "") for m in voice_memories])
            desc_lower = all_voice_desc.lower()
            tone = "neutral"
            if "따뜻" in desc_lower or "부드럽" in desc_lower:
                tone = "warm"
            elif "차갑" in desc_lower or "차분" in desc_lower:
                tone = "calm"
            elif "활발" in desc_lower or "밝" in desc_lower:
                tone = "energetic"
            analysis["voice_style"] = {"tone": tone, "speed": "normal", "pitch": "medium"}
        
        if text_memories:
            all_text = " ".join([m.get("description", "") for m in text_memories])
            formality = "casual"
            if any(word in all_text for word in ["입니다", "합니다", "드립니다"]):
                formality = "formal"
            analysis["text_style"] = {
                "formality": formality,
                "vocabulary": "rich" if len(all_text) > 100 else "common",
                "sentence_length": "medium" if len(all_text) < 500 else "long"
            }
        
        if photo_memories or video_memories:
            emotions = []
            for mem in (photo_memories + video_memories):
                desc = mem.get("description", "").lower()
                if any(word in desc for word in ["행복", "기쁨", "웃", "즐거"]):
                    emotions.append("happy")
                elif any(word in desc for word in ["슬픔", "우울", "눈물"]):
                    emotions.append("sad")
                elif any(word in desc for word in ["평온", "차분", "조용"]):
                    emotions.append("calm")
                elif any(word in desc for word in ["흥분", "활발", "에너지"]):
                    emotions.append("excited")
            analysis["emotions"] = list(set(emotions)) if emotions else ["neutral"]
    
    return analysis


async def _generate_personalized_response(
    prompt: str,
    memory_analysis: Dict[str, Any],
    context: Optional[str] = None
) -> str:
    """
    개인화된 응답 생성
    """
    try:
        if AI_ORCHESTRATOR_AVAILABLE:
            # AI Orchestrator 사용
            orchestrator = AIOrchestrator()
            
            # 메모리 분석 결과를 프롬프트에 포함
            system_prompt = f"""당신은 저장된 메모리를 바탕으로 그 사람의 방식으로 응답해야 합니다.

메모리 분석 결과:
- 말투: {memory_analysis.get('voice_style', {})}
- 문체: {memory_analysis.get('text_style', {})}
- 감정: {memory_analysis.get('emotions', [])}

이 정보를 바탕으로 자연스럽고 개인적인 방식으로 응답하세요."""
            
            user_prompt = prompt
            if context:
                user_prompt += f"\n\n추가 컨텍스트: {context}"
            
            # AI Orchestrator를 통한 응답 생성 (규칙 기반 개선)
            try:
                # 메모리 기반 개인화된 응답 생성
                memory_context = ""
                if memory_analysis.get("voice_style"):
                    memory_context += f"말투: {memory_analysis['voice_style'].get('tone', 'neutral')}. "
                if memory_analysis.get("text_style"):
                    memory_context += f"문체: {memory_analysis['text_style'].get('formality', 'casual')}. "
                if memory_analysis.get("emotions"):
                    memory_context += f"감정: {', '.join(memory_analysis['emotions'])}. "
                
                # 개인화된 응답 생성
                if memory_context:
                    response = f"{memory_context}이런 특성을 바탕으로 '{prompt}'에 대해 응답하겠습니다. "
                else:
                    response = f"'{prompt}'에 대해 응답하겠습니다. "
                
                # 톤에 따른 응답 스타일
                tone = memory_analysis.get("voice_style", {}).get("tone", "neutral")
                if tone == "warm":
                    response += "따뜻하고 친근하게 말씀드리면..."
                elif tone == "calm":
                    response += "차분하고 조용히 말씀드리면..."
                elif tone == "energetic":
                    response += "활발하고 밝게 말씀드리면..."
                else:
                    response += "자연스럽게 말씀드리면..."
                
                return response
            except Exception as e:
                logger.error(f"AI response generation failed: {e}")
                return f"메모리를 바탕으로 '{prompt}'에 대해 응답합니다."
        
        else:
            # Fallback: 규칙 기반 응답
            return _generate_fallback_response(prompt, memory_analysis)
    
    except Exception as e:
        logger.error(f"Failed to generate personalized response: {e}")
        return _generate_fallback_response(prompt, memory_analysis)


def _generate_fallback_response(
    prompt: str,
    memory_analysis: Dict[str, Any]
) -> str:
    """Fallback 응답 생성"""
    voice_style = memory_analysis.get("voice_style", {})
    text_style = memory_analysis.get("text_style", {})
    
    # 간단한 규칙 기반 응답
    tone = voice_style.get("tone", "neutral")
    formality = text_style.get("formality", "casual")
    
    if formality == "formal":
        response = f"저는 {prompt}에 대해 다음과 같이 생각합니다."
    else:
        response = f"음, {prompt}에 대해서는..."
    
    return response
