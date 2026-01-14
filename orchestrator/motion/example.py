"""
모션 시스템 사용 예시
"""

import asyncio
from orchestrator.motion import (
    MotionPipeline,
    AIMotionEngine,
    RuleMotionEngine,
    MotionToVideoConverter
)
from orchestrator.video import RendererFactory


async def main():
    """메인 함수"""
    # 1. 모션 파이프라인 생성
    pipeline = MotionPipeline()
    
    # Engine 등록
    pipeline.register_ai_engine(AIMotionEngine())
    pipeline.register_rule_engine(RuleMotionEngine())
    
    # 2. 모션 생성
    print("Generating motion...")
    motion_data = await pipeline.process(
        image_path="character.jpg",
        prompt="행복한 표정, 눈 깜빡임, 고개 끄덕임",
        duration=5.0,
        use_ai=True  # AI 우선, 실패 시 Rule
    )
    
    print(f"Motion generated: {len(motion_data.expressions)} expressions")
    
    # 3. Scene으로 변환
    converter = MotionToVideoConverter()
    scene = await converter.convert_to_scene(
        motion_data,
        voice_path="voice.mp3"  # 선택사항
    )
    
    print(f"Scene created: {scene.id}")
    
    # 4. 영상 렌더링
    renderer = RendererFactory.create_renderer(
        output_path="output/motion_video.mp4",
        width=1080,
        height=1920,
        fps=30
    )
    
    print("Rendering video...")
    video_path = await renderer.render([scene])
    print(f"Video saved to: {video_path}")
    
    # 정리
    renderer.cleanup()


if __name__ == "__main__":
    asyncio.run(main())
