"""
자막 생성 모듈
"""

from typing import List, Dict, Any

def generate_subtitles(scenes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Scene의 대화를 자막 형식으로 변환
    """
    subtitles = []
    current_time = 0
    
    for scene in scenes:
        for dialogue in scene.get('dialogues', []):
            subtitle = {
                'sceneId': scene['id'],
                'text': dialogue['text'],
                'timing': {
                    'start': current_time + dialogue.get('timing', {}).get('start', 0),
                    'duration': dialogue.get('timing', {}).get('duration', scene['duration'])
                },
                'style': {
                    'fontSize': 24,
                    'color': '#ffffff',
                    'position': 'bottom',
                    'backgroundColor': 'rgba(0,0,0,0.5)',
                    'padding': 10
                }
            }
            subtitles.append(subtitle)
        
        current_time += scene['duration']
    
    return subtitles
