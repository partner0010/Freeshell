"""
Orchestrator 사용 예시
"""

import asyncio
from orchestrator import (
    Orchestrator,
    AIEngine,
    RuleEngine,
    TemplateEngine,
    ExpertEngine,
    setup_logging
)

# 로깅 설정
setup_logging()


async def main():
    """메인 함수"""
    # Orchestrator 생성
    orchestrator = Orchestrator()
    
    # Engine 등록
    orchestrator.register_engine(AIEngine(name="ai_engine", priority=0))
    orchestrator.register_engine(RuleEngine(name="rule_engine", priority=10))
    orchestrator.register_engine(TemplateEngine(name="template_engine", priority=20))
    orchestrator.register_engine(ExpertEngine(name="expert_engine", priority=30))
    
    # 예시 1: 텍스트 생성
    print("\n=== 예시 1: 텍스트 생성 ===")
    result1 = await orchestrator.process({
        'prompt': '블로그 포스트 소개글 작성해줘',
        'type': 'text',
        'topic': 'AI 기술',
        'points': '머신러닝, 딥러닝, 자연어처리'
    })
    print(f"Status: {result1.status.value}")
    print(f"Result: {result1.result}")
    print(f"Execution Time: {result1.execution_time:.2f}s")
    
    # 예시 2: 이미지 생성
    print("\n=== 예시 2: 이미지 생성 ===")
    result2 = await orchestrator.process({
        'prompt': '고양이가 요리를 하는 이미지',
        'type': 'image'
    })
    print(f"Status: {result2.status.value}")
    print(f"Result: {result2.result}")
    
    # 예시 3: Task 상태 조회
    print("\n=== 예시 3: Task 상태 조회 ===")
    if result1.task_id:
        status = orchestrator.get_task_status(result1.task_id)
        print(f"Task Status: {status}")


if __name__ == "__main__":
    asyncio.run(main())
