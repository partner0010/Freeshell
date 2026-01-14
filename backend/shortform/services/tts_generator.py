"""
TTS 음성 생성 모듈
"""

from typing import List, Dict, Any
import os
from ..config import settings

async def generate_voices(
    scenes: List[Dict[str, Any]],
    characters: Dict[str, Dict[str, Any]]
) -> Dict[str, str]:
    """
    Scene의 대화를 음성 파일로 변환
    """
    voice_files = {}
    
    for scene in scenes:
        for dialogue in scene.get('dialogues', []):
            character = characters.get(dialogue.get('speakerId', 'character-1'), {})
            
            # 음성 파일 생성
            voice_key = f"{scene['id']}-{dialogue['speakerId']}"
            voice_path = await generate_tts(
                dialogue['text'],
                character.get('voice', {}),
                dialogue.get('emotion', 'neutral')
            )
            
            voice_files[voice_key] = voice_path
    
    return voice_files

async def generate_tts(
    text: str,
    voice_config: Dict[str, Any],
    emotion: str
) -> str:
    """
    TTS로 음성 파일 생성
    """
    # Edge TTS 또는 Coqui TTS 사용 (무료)
    tts_engine = settings.TTS_ENGINE
    
    if tts_engine == 'edge':
        return await generate_edge_tts(text, voice_config, emotion)
    elif tts_engine == 'coqui':
        return await generate_coqui_tts(text, voice_config, emotion)
    else:
        # Fallback: 기본 TTS
        return await generate_fallback_tts(text)

async def generate_edge_tts(text: str, voice_config: Dict[str, Any], emotion: str) -> str:
    """
    Edge TTS 사용 (Microsoft Edge TTS, 무료)
    """
    try:
        import edge_tts
        import asyncio
        
        # 음성 선택
        voice = voice_config.get('voiceId', 'ko-KR-InJoonNeural')
        if voice_config.get('gender') == 'female':
            voice = 'ko-KR-SunHiNeural'
        
    # 음성 생성
    voices_dir = os.path.join(settings.STORAGE_PATH, 'voices')
    os.makedirs(voices_dir, exist_ok=True)
    output_path = os.path.join(voices_dir, f"{hash(text)}.mp3")
        
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(output_path)
        
        return output_path
        
    except Exception as e:
        # Fallback
        return await generate_fallback_tts(text)

async def generate_coqui_tts(text: str, voice_config: Dict[str, Any], emotion: str) -> str:
    """
    Coqui TTS 사용 (로컬)
    """
    coqui_url = os.getenv('COQUI_TTS_URL', 'http://localhost:5002')  # 설정에 없으면 기본값
    
    try:
        import httpx
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{coqui_url}/api/tts",
                json={
                    "text": text,
                    "speaker_id": voice_config.get('voiceId', 'default'),
                    "language": "ko"
                }
            )
            
            if response.status_code == 200:
                voices_dir = os.path.join(settings.STORAGE_PATH, 'voices')
                os.makedirs(voices_dir, exist_ok=True)
                output_path = os.path.join(voices_dir, f"{hash(text)}.wav")
                
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                
                return output_path
            else:
                return await generate_fallback_tts(text)
                
    except Exception as e:
        return await generate_fallback_tts(text)

async def generate_fallback_tts(text: str) -> str:
    """
    Fallback TTS (기본 음성)
    """
    # 간단한 TTS 또는 무음 파일 반환
    voices_dir = os.path.join(settings.STORAGE_PATH, 'voices')
    os.makedirs(voices_dir, exist_ok=True)
    output_path = os.path.join(voices_dir, f"{hash(text)}.mp3")
    
    # 무음 파일 생성 (실제로는 TTS 라이브러리 사용)
    # 여기서는 경로만 반환
    return output_path
