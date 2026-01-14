"""
기본 에셋 관리 모듈
기본 배경 이미지 및 캐릭터 이미지 제공
"""

import os
from typing import Optional
from ..config import settings

def generate_solid_background(style: str) -> str:
    """
    단색 배경 이미지 생성 (FFmpeg 사용)
    """
    output_path = os.path.join(settings.STORAGE_PATH, 'assets', f'default-bg-{style}.png')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # 스타일별 색상
    colors = {
        'realistic': '0x333333',
        'anime': '0xFF6B9D',
        'cartoon': '0x4ECDC4'
    }
    color = colors.get(style, '0x333333')
    
    # FFmpeg로 단색 이미지 생성
    import subprocess
    try:
        subprocess.run([
            'ffmpeg', '-y',
            '-f', 'lavfi',
            '-i', f'color=c={color}:size=1080x1920:duration=1',
            '-frames:v', '1',
            output_path
        ], check=True, capture_output=True)
        return output_path
    except Exception:
        # FFmpeg 실패 시 기본 경로 반환
        return os.path.join(settings.STORAGE_PATH, 'assets', 'default-bg.png')

def generate_default_character(style: str) -> str:
    """
    기본 캐릭터 이미지 생성
    """
    output_path = os.path.join(settings.STORAGE_PATH, 'assets', f'default-character-{style}.png')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # 간단한 원형 캐릭터 생성 (FFmpeg 사용)
    import subprocess
    try:
        subprocess.run([
            'ffmpeg', '-y',
            '-f', 'lavfi',
            '-i', 'color=c=0xFFFFFF:size=512x512:duration=1',
            '-vf', 'drawbox=x=0:y=0:w=512:h=512:color=0x000000:t=fill',
            '-frames:v', '1',
            output_path
        ], check=True, capture_output=True)
        return output_path
    except Exception:
        return os.path.join(settings.STORAGE_PATH, 'assets', 'default-character.png')

def get_default_background(style: str) -> str:
    """
    기본 배경 이미지 경로 반환
    """
    # 기본 배경 이미지 경로
    default_bg_path = os.path.join(settings.STORAGE_PATH, 'assets', 'default-bg.png')
    
    # 스타일별 배경 (선택사항)
    style_bg_path = os.path.join(settings.STORAGE_PATH, 'assets', f'default-bg-{style}.png')
    
    if os.path.exists(style_bg_path):
        return style_bg_path
    elif os.path.exists(default_bg_path):
        return default_bg_path
    else:
        # 에셋이 없으면 단색 배경 생성 (FFmpeg로)
        return generate_solid_background(style)

def get_default_character_image(style: str) -> str:
    """
    기본 캐릭터 이미지 경로 반환
    """
    default_char_path = os.path.join(settings.STORAGE_PATH, 'assets', 'default-character.png')
    style_char_path = os.path.join(settings.STORAGE_PATH, 'assets', f'default-character-{style}.png')
    
    if os.path.exists(style_char_path):
        return style_char_path
    elif os.path.exists(default_char_path):
        return default_char_path
    else:
        # 기본 캐릭터 이미지 생성
        return generate_default_character(style)

