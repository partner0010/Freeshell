# 전체 프로젝트 디렉토리 구조

```
freeshell-platform/
├── orchestrator/                    # AI Orchestrator 핵심
│   ├── __init__.py
│   ├── orchestrator.py              # 메인 컨트롤러
│   ├── intent.py                    # Intent 분석
│   ├── planner.py                   # Task Plan 생성
│   ├── executor.py                  # Step 실행
│   ├── state.py                     # State Machine
│   │
│   ├── engines/                     # 엔진 구현
│   │   ├── __init__.py
│   │   ├── ai_engine.py             # AI 엔진
│   │   ├── rule_engine.py           # Rule 엔진
│   │   ├── fallback_engine.py       # Fallback 엔진
│   │   └── template_engine.py       # Template 엔진
│   │
│   ├── ethics/                      # 윤리 시스템
│   │   ├── __init__.py
│   │   └── ethics_guard.py         # Ethics Guard
│   │
│   ├── video/                       # 영상 생성
│   │   ├── __init__.py
│   │   ├── scene_schema.py
│   │   ├── ffmpeg_renderer.py
│   │   └── gpu_renderer.py
│   │
│   ├── motion/                      # 모션 시스템
│   │   ├── __init__.py
│   │   ├── motion_schema.py
│   │   └── motion_pipeline.py
│   │
│   ├── expert/                      # 전문가 시스템
│   │   ├── __init__.py
│   │   ├── expert_matcher.py
│   │   └── user_flow.py
│   │
│   ├── revenue/                     # 수익 시스템
│   │   ├── __init__.py
│   │   ├── credit_system.py
│   │   └── pricing_strategy.py
│   │
│   └── utils/                       # 유틸리티
│       ├── __init__.py
│       ├── logger.py
│       └── config.py
│
├── app/                             # 프론트엔드 (Next.js)
│   ├── api/
│   ├── content/
│   └── expert/
│
├── requirements.txt                 # Python 의존성
├── README.md
└── PLATFORM_STRATEGY.md
```
