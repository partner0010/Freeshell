"""
Spatial 채팅 핸들러
채팅 + 캐릭터 반응
"""
from typing import Dict, Any, Optional
from datetime import datetime

from backend.utils.logger import get_logger

logger = get_logger(__name__)


async def space_chat(
    user_id: str,
    message: str,
    character_id: Optional[str] = None,
    space_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    공간 채팅 처리 + 캐릭터 반응
    
    Args:
        user_id: 사용자 ID
        message: 메시지
        character_id: 캐릭터 ID (선택적)
        space_id: 공간 ID (선택적)
    
    Returns:
        채팅 응답 (캐릭터 반응 포함)
    """
    try:
        character_reply = None
        emotion = None
        
        if character_id:
            # 캐릭터 반응 생성
            character_reply = await _generate_character_reply(
                character_id=character_id,
                message=message,
                space_id=space_id
            )
            emotion = await _detect_emotion(message)  # 메시지에서 감정 추출 (AI 모델 사용)
        
        return {
            "character_reply": character_reply,
            "emotion": emotion,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Failed to process space chat: {e}")
        return {
            "character_reply": None,
            "emotion": None,
            "timestamp": datetime.utcnow().isoformat()
        }


async def _generate_character_reply(
    character_id: str,
    message: str,
    space_id: Optional[str] = None
) -> Optional[str]:
    """
    캐릭터 반응 생성 (AI 모델 사용)
    
    캐릭터 personality를 기반으로 응답 생성
    """
    try:
        # 캐릭터 정보 조회
        from backend.character.service import CharacterService
        from backend.core import get_async_db
        
        character_service = CharacterService()
        async for db in get_async_db():
            character = await character_service.get_character(db, character_id)
            if not character:
                return None
            
            metadata = character.metadata or {}
            personality = metadata.get("personality", {})
            
            # AI 분석 서비스를 사용하여 더 정교한 응답 생성
            try:
                from backend.services.ai_analysis import AIAnalysisService
                ai_analysis = AIAnalysisService()
                
                # 텍스트 스타일 분석을 활용하여 응답 생성
                text_style = await ai_analysis.analyze_text_style(message)
                
                # Personality 기반 응답 생성
                tone = personality.get("tone", "neutral")
                speed = personality.get("speed", "보통")
                
                # 톤에 따른 응답 스타일
                if tone == "따뜻함":
                    if "안녕" in message or "hello" in message.lower():
                        reply = "안녕하세요! 반갑습니다. 오늘 하루는 어떠셨나요?"
                    elif "?" in message or "질문" in message:
                        reply = "질문이 있으시군요. 무엇을 도와드릴까요? 편하게 말씀해주세요."
                    else:
                        reply = f"{message}에 대해 이야기하고 싶으시군요. 흥미롭네요! 더 자세히 들려주세요."
                elif tone == "차갑함":
                    if "안녕" in message or "hello" in message.lower():
                        reply = "안녕하세요."
                    elif "?" in message or "질문" in message:
                        reply = "무엇을 도와드릴까요?"
                    else:
                        reply = f"{message}에 대해 말씀하시는군요."
                else:  # 활발함 또는 기본
                    if "안녕" in message or "hello" in message.lower():
                        reply = "안녕하세요! 반갑습니다! 오늘도 즐거운 하루 되세요!"
                    elif "?" in message or "질문" in message:
                        reply = "질문이 있으시군요! 무엇을 도와드릴까요?"
                    else:
                        reply = f"{message}에 대해 이야기하고 싶으시군요! 흥미롭네요!"
                
                # 속도에 따른 문장 길이 조절
                if speed == "느림":
                    # 더 긴 문장
                    pass
                elif speed == "빠름":
                    # 짧은 문장
                    if len(reply) > 30:
                        reply = reply[:30] + "..."
                
                return reply
            except Exception as e:
                logger.warning(f"AI analysis failed, using fallback: {e}")
                # Fallback: 기본 규칙 기반 응답
                if len(message) < 10:
                    return "짧은 메시지네요. 더 자세히 말씀해주세요!"
                elif "안녕" in message or "hello" in message.lower():
                    return "안녕하세요! 반갑습니다."
                elif "?" in message or "질문" in message:
                    return "질문이 있으시군요. 무엇을 도와드릴까요?"
                else:
                    return f"{message}에 대해 이야기하고 싶으시군요. 흥미롭네요!"
            break
        
        return None
    
    except Exception as e:
        logger.error(f"Failed to generate character reply: {e}")
        return None


async def _detect_emotion(message: str) -> str:
    """
    메시지에서 감정 추출 (AI 모델 사용)
    """
    try:
        # AI 분석 서비스 사용
        from backend.services.ai_analysis import AIAnalysisService
        ai_analysis = AIAnalysisService()
        emotion_result = await ai_analysis.analyze_emotion(message)
        return emotion_result.get("emotion", "neutral")
    except Exception as e:
        logger.warning(f"AI emotion detection failed, using fallback: {e}")
        # Fallback: 간단한 키워드 기반 감정 분석
        positive_keywords = ["좋아", "행복", "기쁘", "사랑", "감사"]
        negative_keywords = ["슬프", "화나", "짜증", "불행"]
        
        message_lower = message.lower()
        
        if any(keyword in message_lower for keyword in positive_keywords):
            return "smile"
        elif any(keyword in message_lower for keyword in negative_keywords):
            return "sad"
        else:
            return "neutral"
    
    except Exception as e:
        logger.error(f"Failed to detect emotion: {e}")
        return "neutral"
