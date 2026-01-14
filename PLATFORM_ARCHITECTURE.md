# 차세대 종합 콘텐츠 플랫폼 아키텍처

## 핵심 철학

✅ **AI는 기능이 아니라 Orchestrator**
✅ **AI 실패 시 반드시 대체 루트 존재**
✅ **모든 기능은 플러그인화**
✅ **무거운 기술 금지 (웹 기준)**
✅ **윤리·프라이버시·법적 리스크 사전 차단**
✅ **MVP → 확장 가능 구조**

## 플랫폼 구성

### 1. AI Orchestrator (중앙 제어)
- Intent 분석
- 실행 플랜 생성
- 엔진 선택 (AI → Rule → Fallback)
- 결과 통합
- Memory 관리

### 2. 콘텐츠 생성 모듈
- 숏폼 생성
- 이미지 → 모션
- 음성 생성
- 캐릭터 생성

### 3. AI Orchestrated SNS
- 감정 기반 피드 재구성
- 소비 패턴 분석
- 창작 기록 기반 추천
- 사용자 제어 알고리즘

### 4. 기억 기반 콘텐츠 (Archive)
- 추모 콘텐츠
- 힐링 콘텐츠
- 기록 보관
- 윤리 가드 통합

### 5. 캐릭터 IP 시스템
- 캐릭터 생성
- IP 관리
- 확장 가능 구조

### 6. Spatial (공간형 SNS)
- Three.js 기반
- 2.5D 공간
- 아바타 시스템
- 실시간 채팅

### 7. AI Vault
- 로컬 암호화
- 선택적 공유
- 완전 삭제

## 디렉토리 구조

```
backend/
├── orchestrator/          # AI Orchestrator
│   ├── orchestrator.py
│   ├── intent.py
│   ├── planner.py
│   ├── executor.py
│   └── memory.py
│
├── engines/              # 엔진
│   ├── ai_engine.py
│   ├── rule_engine.py
│   └── fallback_engine.py
│
├── modules/              # 기능 모듈
│   ├── shortform/
│   ├── sns/
│   ├── archive/
│   ├── character/
│   └── spatial/
│
├── ethics/                # 윤리 시스템
│   ├── consent.py
│   └── guard.py
│
├── vault/                 # 프라이버시
│   └── encryption.py
│
├── api/                   # API 엔드포인트
└── main.py
```
