"""
Scene JSON 생성 모듈
"""

from typing import List, Dict, Any
import json

async def generate_scene_json(
    script: Dict[str, Any],
    style: str,
    duration: int
) -> List[Dict[str, Any]]:
    """
    스크립트를 Scene JSON 배열로 변환
    """
    scenes = []
    
    for i, scene_data in enumerate(script.get('scenes', [])):
        scene = {
            'id': f'scene-{i + 1}',
            'duration': scene_data.get('duration', 5),
            'style': style,  # 스타일 정보 추가
            'background': {
                'type': 'image',
                'source': '',  # 이미지 생성 후 채움
                'description': scene_data.get('description', '')
            },
            'camera': {
                'position': {'x': 0, 'y': 0, 'z': 0},
                'rotation': {'x': 0, 'y': 0, 'z': 0},
                'zoom': 1.0
            },
            'characters': [],  # 캐릭터 생성 후 채움
            'dialogues': []
        }
        
        # 대화 추가
        if scene_data.get('dialogue'):
            dialogue = {
                'speakerId': 'character-1',
                'text': scene_data['dialogue'],
                'emotion': 'neutral',
                'expression': 'default',
                'voiceTone': 'normal',
                'timing': {
                    'start': 0,
                    'duration': scene['duration']
                }
            }
            scene['dialogues'].append(dialogue)
        
        # 음악 설정
        scene['music'] = {
            'type': 'background',
            'volume': 0.3
        }
        
        # 효과
        scene['effects'] = []
        
        scenes.append(scene)
    
    # 총 시간 조정
    total_duration = sum(s['duration'] for s in scenes)
    if total_duration > duration:
        # 각 Scene 시간 비율로 조정
        ratio = duration / total_duration
        for scene in scenes:
            scene['duration'] = int(scene['duration'] * ratio)
    elif total_duration < duration:
        # 마지막 Scene 시간 연장
        if scenes:
            scenes[-1]['duration'] += (duration - total_duration)
    
    return scenes
