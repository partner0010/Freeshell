"""
캐릭터 음성 생성 모듈
TTS + Voice Cloning Hook
"""
import os
from typing import Optional, Dict, Any
from pathlib import Path

from backend.utils.logger import get_logger

logger = get_logger(__name__)

# 기존 AudioGenerator 활용
try:
    from backend.app.services.audio_generator import AudioGenerator, AudioGenerationRequest, VoiceGender, EmotionTone
    AUDIO_GENERATOR_AVAILABLE = True
except ImportError:
    AUDIO_GENERATOR_AVAILABLE = False
    logger.warning("AudioGenerator not available")

# ElevenLabs Voice Cloning (선택적)
try:
    from elevenlabs import clone, set_api_key
    from elevenlabs.client import ElevenLabs
    ELEVENLABS_CLONE_AVAILABLE = True
except ImportError:
    ELEVENLABS_CLONE_AVAILABLE = False


def generate_character_voice(
    text: str,
    voice_ref: Optional[str] = None,
    character_id: Optional[str] = None,
    personality: Optional[Dict[str, Any]] = None,
    output_dir: str = "storage/character_voices"
) -> tuple[str, Optional[str]]:
    """
    캐릭터 음성 생성 (MVP: TTS + Voice Cloning Hook)
    
    Args:
        text: 생성할 텍스트
        voice_ref: 음성 참조 파일 경로 (voice_ref.wav) 또는 voice_id
        character_id: 캐릭터 ID (선택적)
        personality: 캐릭터 성격 설정 (선택적)
        output_dir: 출력 디렉토리
    
    Returns:
        (voice_path, voice_id) 튜플
        - voice_path: 생성된 음성 파일 경로
        - voice_id: ElevenLabs voice_id (생성된 경우, 없으면 None)
    """
    try:
        # 출력 디렉토리 생성
        os.makedirs(output_dir, exist_ok=True)
        
        # 출력 파일 경로
        if character_id:
            output_filename = f"voice_{character_id}_{hash(text) % 1000000}.wav"
        else:
            output_filename = f"voice_{hash(text) % 1000000}.wav"
        
        output_path = os.path.join(output_dir, output_filename)
        
        # 1. Voice Cloning이 가능한 경우 (voice_ref가 제공되고 ElevenLabs 사용 가능)
        # voice_ref가 파일 경로이거나 voice_id 형식인 경우
        if voice_ref and ELEVENLABS_CLONE_AVAILABLE:
            # voice_id 형식이거나 파일이 존재하는 경우
            if (voice_ref.startswith("voice_") or len(voice_ref) == 20) or (os.path.exists(voice_ref) if voice_ref else False):
                logger.info(f"Using voice cloning with reference: {voice_ref}")
                return _generate_with_voice_cloning(text, voice_ref, output_path, personality, character_id)
        
        # 2. 기존 AudioGenerator 사용 (ElevenLabs TTS)
        if AUDIO_GENERATOR_AVAILABLE:
            logger.info("Using AudioGenerator (ElevenLabs TTS)")
            return _generate_with_audio_generator(text, output_path, personality)
        
        # 3. Fallback: 기본 TTS 또는 무음 파일
        logger.warning("No TTS service available, using fallback")
        return _generate_fallback_voice(text, output_path)
    
    except Exception as e:
        logger.error(f"Failed to generate character voice: {e}")
        # 최종 Fallback
        return _generate_fallback_voice(text, output_path)


def _generate_with_voice_cloning(
    text: str,
    voice_ref: str,
    output_path: str,
    personality: Optional[Dict[str, Any]] = None,
    character_id: Optional[str] = None
) -> tuple[str, Optional[str]]:
    """
    Voice Cloning을 사용한 음성 생성 (ElevenLabs)
    """
    try:
        elevenlabs_key = os.getenv("ELEVENLABS_API_KEY")
        if not elevenlabs_key:
            logger.warning("ElevenLabs API key not found, falling back to TTS")
            return _generate_with_audio_generator(text, output_path, personality)
        
        set_api_key(elevenlabs_key)
        client = ElevenLabs(api_key=elevenlabs_key)
        
        # Voice Cloning (voice_ref 파일 업로드 및 클론 생성)
        # 참고: ElevenLabs는 voice_id를 사용하므로, 먼저 voice를 생성해야 함
        # MVP에서는 기존 voice_id를 사용하거나, voice_ref를 업로드하여 새 voice 생성
        
        # 방법 1: voice_ref가 이미 ElevenLabs voice_id인 경우
        if voice_ref.startswith("voice_") or len(voice_ref) == 20:  # ElevenLabs voice_id 형식
            voice_id = voice_ref
        else:
            # 방법 2: voice_ref 파일을 업로드하여 새 voice 생성
            # 주의: 이는 API 호출이 필요하므로 비용이 발생할 수 있음
            logger.info(f"Uploading voice reference file: {voice_ref}")
            
            # 파일 읽기
            with open(voice_ref, "rb") as f:
                voice_data = f.read()
            
            # Voice 생성 (한 번만 실행, 이후 voice_id 저장)
            # voice_id를 캐릭터 metadata에 저장하여 재사용
            if character_id:
                try:
                    from backend.character.service import CharacterService
                    from sqlalchemy.ext.asyncio import AsyncSession
                    # 주의: 이 함수는 동기 함수이므로 DB 세션을 직접 받을 수 없음
                    # 실제로는 service 레벨에서 처리해야 함
                    # 여기서는 voice_id를 반환하여 상위에서 처리하도록 함
                except Exception as e:
                    logger.warning(f"Failed to cache voice_id: {e}")
            voice = client.clone(
                name=f"character_voice_{hash(voice_ref) % 1000000}",
                files=[voice_data]
            )
            voice_id = voice.voice_id
            logger.info(f"Created cloned voice: {voice_id}")
        
        # 음성 생성 (클론된 voice 사용)
        audio_bytes = client.generate(
            text=text,
            voice=voice_id,
            model="eleven_multilingual_v2"
        )
        
        # 파일 저장
        with open(output_path, "wb") as f:
            f.write(audio_bytes)
        
        logger.info(f"Voice generated with cloning: {output_path}")
        return (output_path, voice_id)  # voice_id 반환
    
    except Exception as e:
        logger.error(f"Voice cloning failed: {e}, falling back to TTS")
        result = _generate_with_audio_generator(text, output_path, personality)
        # AudioGenerator는 voice_id 없음
        if isinstance(result, tuple):
            return result
        return (result, None)


def _generate_with_audio_generator(
    text: str,
    output_path: str,
    personality: Optional[Dict[str, Any]] = None
) -> tuple[str, Optional[str]]:
    """
    AudioGenerator를 사용한 음성 생성 (ElevenLabs TTS)
    """
    try:
        # Personality 설정에서 파라미터 추출
        tone = personality.get("tone", "neutral") if personality else "neutral"
        speed_str = personality.get("speed", "보통") if personality else "보통"
        
        # 속도 변환 (느림: 0.8, 보통: 1.0, 빠름: 1.2)
        speed_map = {"느림": 0.8, "보통": 1.0, "빠름": 1.2}
        speed = speed_map.get(speed_str, 1.0)
        
        # 톤을 EmotionTone으로 변환
        tone_map = {
            "따뜻함": EmotionTone.FRIENDLY,
            "차갑함": EmotionTone.PROFESSIONAL,
            "친근함": EmotionTone.FRIENDLY,
            "neutral": EmotionTone.NEUTRAL,
        }
        emotion = tone_map.get(tone, EmotionTone.NEUTRAL)
        
        # AudioGenerator 초기화
        audio_generator = AudioGenerator()
        
        # 요청 생성
        request = AudioGenerationRequest(
            text=text,
            emotion=emotion,
            speed=speed,
            stability=0.5,
            similarity_boost=0.75
        )
        
        # TTS 생성
        result = audio_generator.generate_tts(request)
        
        # 파일 저장
        if result.audio_bytes:
            with open(output_path, "wb") as f:
                f.write(result.audio_bytes)
            logger.info(f"Voice generated with AudioGenerator: {output_path}")
            return (output_path, None)  # AudioGenerator는 voice_id 없음
        else:
            logger.warning("AudioGenerator returned no audio bytes")
            result = _generate_fallback_voice(text, output_path)
            return (result, None)
    
    except Exception as e:
        logger.error(f"AudioGenerator failed: {e}")
        result = _generate_fallback_voice(text, output_path)
        return (result, None)


def _generate_fallback_voice(text: str, output_path: str) -> tuple[str, Optional[str]]:
    """
    Fallback 음성 생성 (무음 파일 또는 기본 TTS)
    """
    try:
        # 간단한 무음 파일 생성 (실제로는 TTS 라이브러리 사용 권장)
        # WAV 파일 헤더 (1초 무음, 44.1kHz, 16bit, 모노)
        sample_rate = 44100
        duration = max(len(text) * 0.1, 1.0)  # 텍스트 길이에 비례한 시간
        num_samples = int(sample_rate * duration)
        
        # WAV 파일 생성
        import wave
        import struct
        
        with wave.open(output_path, 'wb') as wav_file:
            wav_file.setnchannels(1)  # 모노
            wav_file.setsampwidth(2)  # 16bit
            wav_file.setframerate(sample_rate)
            
            # 무음 데이터 (0 값)
            silence = struct.pack('<h', 0) * num_samples
            wav_file.writeframes(silence)
        
        logger.warning(f"Fallback voice generated (silence): {output_path}")
        return (output_path, None)
    
    except Exception as e:
        logger.error(f"Fallback voice generation failed: {e}")
        # 최종 Fallback: 빈 파일이라도 반환
        Path(output_path).touch()
        return (output_path, None)
