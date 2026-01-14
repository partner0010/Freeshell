"""
AI Orchestrator 사용 예시
"""

import asyncio
from orchestrator import (
    Orchestrator,
    AIEngine,
    RuleEngine,
    FallbackEngine
)


async def main():
    """메인 함수"""
    # 1. Orchestrator 초기화
    orchestrator = Orchestrator()
    
    # 2. 엔진 등록
    ai_engine = AIEngine()
    rule_engine = RuleEngine()
    fallback_engine = FallbackEngine()
    
    orchestrator.register_engine(ai_engine)
    orchestrator.register_engine(rule_engine)
    orchestrator.register_engine(fallback_engine)
    
    # 3. 요청 처리
    intent = "create_shortform"
    context = {
        'prompt': '행복한 일상 영상을 만들어주세요',
        'duration': 30,
        'style': 'animation',
        'user_id': 'user_001',
        'purpose': 'personal_archive'
    }
    
    print(f"Processing intent: {intent}")
    result = await orchestrator.process(intent, context)
    
    # 4. 결과 확인
    if result.success:
        print(f"✅ Success!")
        print(f"Data: {result.data}")
        print(f"Execution time: {result.execution_time:.2f}s")
        if result.fallback_used:
            print("⚠️ Fallback was used")
    else:
        print(f"❌ Failed: {result.error}")


if __name__ == "__main__":
    asyncio.run(main())
