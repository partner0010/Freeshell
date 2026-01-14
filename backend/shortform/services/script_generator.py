"""
스크립트 생성 모듈 (LLM 호출)
"""

import json
import os
from typing import Dict, List, Any
from ..config import settings

# Ollama 또는 무료 AI 서비스 사용
async def generate_script(refined_prompt: str) -> Dict[str, Any]:
    """
    LLM을 사용하여 스크립트 생성
    """
    # Ollama 사용 (로컬)
    ollama_url = settings.OLLAMA_URL
    model = settings.OLLAMA_MODEL
    
    try:
        import httpx
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{ollama_url}/api/generate",
                json={
                    "model": model,
                    "prompt": refined_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 2000
                    }
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                text = data.get('response', '')
                
                # JSON 파싱 시도
                try:
                    # JSON 코드 블록 추출
                    if '```json' in text:
                        json_start = text.find('```json') + 7
                        json_end = text.find('```', json_start)
                        text = text[json_start:json_end].strip()
                    elif '```' in text:
                        json_start = text.find('```') + 3
                        json_end = text.find('```', json_start)
                        text = text[json_start:json_end].strip()
                    
                    script_data = json.loads(text)
                    return script_data
                except json.JSONDecodeError:
                    # JSON 파싱 실패 시 기본 구조 반환
                    return parse_script_fallback(text)
            else:
                raise Exception(f"Ollama API error: {response.status_code}")
                
    except Exception as e:
        # Fallback: 규칙 기반 스크립트 생성
        return generate_script_fallback(refined_prompt)

def parse_script_fallback(text: str) -> Dict[str, Any]:
    """
    JSON 파싱 실패 시 텍스트에서 스크립트 추출
    """
    scenes = []
    lines = text.split('\n')
    current_scene = None
    
    for line in lines:
        line = line.strip()
        if 'scene' in line.lower() or '장면' in line:
            if current_scene:
                scenes.append(current_scene)
            current_scene = {
                'description': line,
                'duration': 5,
                'dialogue': ''
            }
        elif 'dialogue' in line.lower() or '대화' in line or '"' in line:
            if current_scene:
                current_scene['dialogue'] = line.replace('"', '').strip()
    
    if current_scene:
        scenes.append(current_scene)
    
    if not scenes:
        scenes = [{
            'description': 'Default scene',
            'duration': 15,
            'dialogue': 'Hello, world!'
        }]
    
    return {
        'script': text[:200],
        'scenes': scenes
    }

def generate_script_fallback(prompt: str) -> Dict[str, Any]:
    """
    LLM 실패 시 규칙 기반 스크립트 생성
    """
    return {
        'script': f'A short-form video about: {prompt[:100]}',
        'scenes': [
            {
                'description': f'Opening scene: {prompt[:50]}',
                'duration': 5,
                'dialogue': 'Welcome!'
            },
            {
                'description': f'Main scene: {prompt[:50]}',
                'duration': 10,
                'dialogue': prompt[:100]
            },
            {
                'description': 'Closing scene',
                'duration': 5,
                'dialogue': 'Thank you!'
            }
        ]
    }
