"""
FFmpeg 영상 렌더링 모듈
"""

from typing import List, Dict, Any
import subprocess
import os
import json
from ..config import settings

async def render_video(
    scenes: List[Dict[str, Any]],
    characters: Dict[str, Dict[str, Any]],
    voice_files: Dict[str, str],
    subtitles: List[Dict[str, Any]],
    job_id: str,
    style: str = 'realistic'  # 스타일 파라미터 추가
) -> str:
    """
    FFmpeg를 사용하여 최종 영상 렌더링
    """
    output_path = os.path.join(settings.VIDEO_STORAGE_PATH, f"{job_id}.mp4")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # FFmpeg 명령 생성
    ffmpeg_command = build_ffmpeg_command(scenes, characters, voice_files, subtitles, output_path, style)
    
    # FFmpeg 실행
    try:
        result = subprocess.run(
            ffmpeg_command,
            capture_output=True,
            text=True,
            timeout=300  # 5분 타임아웃
        )
        
        if result.returncode != 0:
            raise Exception(f"FFmpeg error: {result.stderr}")
        
        if not os.path.exists(output_path):
            raise Exception("Video file not created")
        
        return output_path
        
    except subprocess.TimeoutExpired:
        raise Exception("FFmpeg rendering timeout")
    except Exception as e:
        raise Exception(f"FFmpeg rendering failed: {str(e)}")

def build_ffmpeg_command(
    scenes: List[Dict[str, Any]],
    characters: Dict[str, Dict[str, Any]],
    voice_files: Dict[str, str],
    subtitles: List[Dict[str, Any]],
    output_path: str,
    style: str = 'realistic'
) -> List[str]:
    """
    FFmpeg 명령 생성
    """
    command = ['ffmpeg', '-y']  # -y: 덮어쓰기
    
    # 배경 이미지 입력
    from ..services.asset_manager import get_default_background
    
    for scene in scenes:
        bg_path = scene.get('background', {}).get('source', '')
        if not bg_path or not os.path.exists(bg_path):
            bg_path = get_default_background(style)
        
        command.extend(['-loop', '1', '-t', str(scene['duration']), '-i', bg_path])
    
    # 캐릭터 이미지 입력 (선택사항)
    # TODO: 캐릭터 이미지 오버레이 기능 추가
    # for char_id, char_data in characters.items():
    #     char_image = char_data.get('image', '')
    #     if char_image and os.path.exists(char_image):
    #         command.extend(['-loop', '1', '-t', '1', '-i', char_image])
    
    # 음성 파일 입력
    audio_inputs = []
    for voice_key, voice_path in voice_files.items():
        if os.path.exists(voice_path):
            command.extend(['-i', voice_path])
            audio_inputs.append(voice_path)
    
    # 필터 복합 명령
    filter_complex = build_filter_complex(scenes, subtitles, len(audio_inputs))
    if filter_complex:
        command.extend(['-filter_complex', filter_complex])
    
    # 오디오 믹싱
    if len(audio_inputs) > 0:
        amix = f"amix=inputs={len(audio_inputs)}:duration=longest"
        command.extend(['-filter:a', amix])
    
    # 출력 설정
    command.extend([
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-pix_fmt', 'yuv420p',
        '-shortest',
        output_path
    ])
    
    return command

def build_filter_complex(
    scenes: List[Dict[str, Any]],
    subtitles: List[Dict[str, Any]],
    audio_count: int
) -> str:
    """
    FFmpeg 필터 복합 명령 생성
    """
    filters = []
    
    # 자막 필터
    if subtitles:
        subtitle_filters = []
        for sub in subtitles:
            start = sub['timing']['start']
            end = start + sub['timing']['duration']
            text = sub['text'].replace("'", "\\'").replace(":", "\\:")
            style = sub['style']
            
            subtitle_filters.append(
                f"drawtext=text='{text}':"
                f"fontsize={style['fontSize']}:"
                f"fontcolor={style['color']}:"
                f"x=(w-text_w)/2:"
                f"y=h-th-{style.get('padding', 10)}:"
                f"enable='between(t,{start},{end})'"
            )
        
        if subtitle_filters:
            filters.append(";".join(subtitle_filters))
    
    return ";".join(filters) if filters else ""
