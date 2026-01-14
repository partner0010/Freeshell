"""
캐릭터 메타 생성 모듈
"""

from typing import List, Dict, Any
import os
from ..config import settings
from ..services.asset_manager import get_default_character_image

async def generate_characters(
    scenes: List[Dict[str, Any]],
    style: str
) -> Dict[str, Dict[str, Any]]:
    """
    Scene에서 필요한 캐릭터 추출 및 메타데이터 생성
    """
    characters = {}
    
    # Scene에서 필요한 캐릭터 ID 추출
    character_ids = set()
    for scene in scenes:
        for dialogue in scene.get('dialogues', []):
            character_ids.add(dialogue.get('speakerId', 'character-1'))
    
    # 각 캐릭터 메타데이터 생성
    for char_id in character_ids:
        character = {
            'id': char_id,
            'type': '2d',
            'gender': 'neutral',
            'ageRange': 'adult',
            'style': style,
            'voice': {
                'voiceId': 'default',
                'gender': 'neutral',
                'tone': 'normal'
            },
            'expressions': {
                'default': 'neutral',
                'happy': 'smile',
                'sad': 'frown',
                'angry': 'angry'
            },
            'gestures': [],
            'emotionState': 'neutral'
        }
        
        # 이미지 생성 (Stable Diffusion 또는 기본 이미지)
        character['image'] = await generate_character_image(char_id, style)
        
        characters[char_id] = character
    
    return characters

async def generate_character_image(character_id: str, style: str) -> str:
    """
    캐릭터 이미지 생성 또는 기본 이미지 반환
    """
    # Stable Diffusion 사용 (로컬)
    if not settings.STABLE_DIFFUSION_ENABLED:
        return get_default_character_image(style)
    
    stable_diffusion_url = settings.STABLE_DIFFUSION_URL
    
    prompt = f"{style} style character, full body, high quality, detailed"
    
    try:
        import httpx
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{stable_diffusion_url}/sdapi/v1/txt2img",
                json={
                    "prompt": prompt,
                    "negative_prompt": "blurry, low quality",
                    "steps": 20,
                    "width": 512,
                    "height": 512
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                # 이미지 저장 및 경로 반환
                characters_dir = os.path.join(settings.STORAGE_PATH, 'characters')
                os.makedirs(characters_dir, exist_ok=True)
                image_path = os.path.join(characters_dir, f"{character_id}.png")
                
                import base64
                image_data = base64.b64decode(data['images'][0])
                with open(image_path, 'wb') as f:
                    f.write(image_data)
                
                return image_path
            else:
                # Fallback: 기본 이미지
                return get_default_character_image(style)
                
    except Exception as e:
        # Fallback: 기본 이미지
        return get_default_character_image(style)
