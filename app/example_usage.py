"""
사용 예시
"""

from app.orchestrator.orchestrator import Orchestrator

# Orchestrator 초기화
orchestrator = Orchestrator()

# 숏폼 생성 요청
request = {
    'prompt': '행복한 일상 영상을 만들어주세요',
    'type': 'shortform',
    'duration': 30,
    'style': 'animation',
    'purpose': 'personal_archive'
}

# 처리
result = orchestrator.handle(request)

# 결과 확인
if result['success']:
    print(f"✅ Success!")
    print(f"Task ID: {result['task_id']}")
    print(f"Execution time: {result['execution_time']:.2f}s")
    if result.get('fallback_used'):
        print("⚠️ Fallback was used")
else:
    print(f"❌ Failed: {result.get('error')}")
