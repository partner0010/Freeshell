"""
프롬프트 정제 모듈
"""

def refine_prompt(user_prompt: str, style: str, duration: int) -> str:
    """
    사용자 프롬프트를 LLM 입력용으로 정제
    """
    style_descriptions = {
        'realistic': 'photorealistic, modern, high quality',
        'anime': 'anime style, vibrant colors, detailed',
        'cartoon': 'cartoon style, colorful, playful'
    }
    
    refined = f"""
Create a {duration}-second short-form video script.

Style: {style_descriptions.get(style, style)}
User request: {user_prompt}

Requirements:
- Clear beginning, middle, and end
- Engaging dialogue
- Visual descriptions for each scene
- Suitable for {duration} seconds total duration
- Each scene should be 3-10 seconds
- Include character emotions and expressions

Output format (JSON):
{{
  "script": "Overall script description",
  "scenes": [
    {{
      "description": "Visual scene description",
      "duration": 5,
      "dialogue": "Character dialogue text"
    }}
  ]
}}
""".strip()
    
    return refined
