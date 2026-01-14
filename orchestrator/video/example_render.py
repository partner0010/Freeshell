"""
FFmpeg 렌더링 예시
"""

import asyncio
import json
import os
from pathlib import Path
from .scene_schema import Scene
from .renderer_factory import RendererFactory


async def main():
    """메인 함수"""
    # Scene JSON 로드
    scene_file = Path(__file__).parent / "scene_example.json"
    with open(scene_file, 'r', encoding='utf-8') as f:
        scene_data = json.load(f)
    
    # Scene 객체 생성
    scenes = [Scene.from_dict(s) for s in scene_data['scenes']]
    
    # Renderer 생성 (GPU/CPU 자동 선택)
    output_path = "output/shortform.mp4"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    renderer = RendererFactory.create_renderer(
        output_path=output_path,
        width=scene_data['metadata']['resolution']['width'],
        height=scene_data['metadata']['resolution']['height'],
        fps=scene_data['metadata']['fps'],
        audio_sample_rate=scene_data['metadata']['audio_sample_rate']
    )
    
    # 렌더링
    print(f"Rendering {len(scenes)} scenes...")
    result_path = await renderer.render(scenes)
    print(f"Video saved to: {result_path}")
    
    # 정리
    renderer.cleanup()


if __name__ == "__main__":
    import os
    asyncio.run(main())
