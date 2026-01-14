"""
기본 에셋 설정 스크립트
기본 배경 이미지 및 캐릭터 이미지 생성
"""

import os
import subprocess
import sys
from pathlib import Path

def create_assets_directory():
    """에셋 디렉토리 생성"""
    base_path = Path(__file__).parent.parent
    assets_path = base_path / 'assets'
    assets_path.mkdir(parents=True, exist_ok=True)
    return assets_path

def generate_solid_background(assets_path: Path, style: str, color: str):
    """단색 배경 이미지 생성"""
    output_path = assets_path / f'default-bg-{style}.png'
    
    try:
        subprocess.run([
            'ffmpeg', '-y',
            '-f', 'lavfi',
            '-i', f'color=c={color}:size=1080x1920:duration=1',
            '-frames:v', '1',
            str(output_path)
        ], check=True, capture_output=True)
        print(f"✅ Created {output_path}")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to create {output_path}: {e}")
    except FileNotFoundError:
        print("❌ FFmpeg not found. Please install FFmpeg first.")

def generate_default_character(assets_path: Path, style: str):
    """기본 캐릭터 이미지 생성"""
    output_path = assets_path / f'default-character-{style}.png'
    
    try:
        # 간단한 원형 캐릭터 생성
        subprocess.run([
            'ffmpeg', '-y',
            '-f', 'lavfi',
            '-i', 'color=c=0xFFFFFF:size=512x512:duration=1',
            '-vf', 'drawbox=x=0:y=0:w=512:h=512:color=0x000000:t=fill',
            '-frames:v', '1',
            str(output_path)
        ], check=True, capture_output=True)
        print(f"✅ Created {output_path}")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to create {output_path}: {e}")
    except FileNotFoundError:
        print("❌ FFmpeg not found. Please install FFmpeg first.")

def main():
    """메인 함수"""
    print("Setting up default assets...")
    
    assets_path = create_assets_directory()
    
    # 배경 이미지 생성
    backgrounds = {
        'realistic': '0x333333',
        'anime': '0xFF6B9D',
        'cartoon': '0x4ECDC4'
    }
    
    for style, color in backgrounds.items():
        generate_solid_background(assets_path, style, color)
    
    # 캐릭터 이미지 생성
    for style in ['realistic', 'anime', 'cartoon']:
        generate_default_character(assets_path, style)
    
    print("\n✅ Asset setup complete!")
    print(f"Assets directory: {assets_path}")

if __name__ == '__main__':
    main()
