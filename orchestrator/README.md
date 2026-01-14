# AI Orchestrator

## 개요

차세대 종합 콘텐츠 플랫폼의 중앙 AI Orchestrator

## 핵심 원칙

- ✅ AI 실패해도 결과 생성 (Fallback)
- ✅ 모든 기능은 플러그인 구조
- ✅ 상태 기반 실행 (State Machine)
- ✅ 무료 AI API 우선
- ✅ 윤리/법적 Guard 포함

## 구조

```
orchestrator/
├── orchestrator.py      # 메인 컨트롤러
├── intent.py            # Intent 분석
├── planner.py           # Task Plan 생성
├── executor.py          # Step 실행
├── state.py             # State Machine
├── engines/             # 엔진 구현
│   ├── ai_engine.py
│   ├── rule_engine.py
│   └── fallback_engine.py
└── ethics/              # 윤리 시스템
    └── ethics_guard.py
```

## 사용 예시

```python
from orchestrator import Orchestrator, AIEngine, RuleEngine

# 초기화
orchestrator = Orchestrator()
orchestrator.register_engine(AIEngine())
orchestrator.register_engine(RuleEngine())

# 요청 처리
result = await orchestrator.process(
    intent="create_shortform",
    context={
        'prompt': '행복한 일상',
        'duration': 30
    }
)

# 결과 확인
if result.success:
    print(result.data)
```

## 실행

```bash
python orchestrator/example_usage.py
```
