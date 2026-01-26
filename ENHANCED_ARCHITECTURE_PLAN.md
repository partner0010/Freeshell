# 향상된 아키텍처 계획

**작성 일시**: 2026-01-25  
**목표**: 사용자 정의 구조 + Phase 2-6 구현

---

## 전체 구조 요약

```
[User]
  ↓
[AI Editor]
  ├─ 숏폼 / 이미지 / 음성 생성
  ├─ 타임라인 / 협업
  ↓
[AI Orchestrator]
  ↓
────────────────────────
│ ① AI 캐릭터 IP        │
│ ② 개인 AI Vault       │
│ ③ Web 메타공간        │
────────────────────────
  ↓
[AI Feed 재조합]
  ↓
[수익화 / 전문가 / 굿즈]
```

---

## 모듈별 구현 계획

### 1. AI Editor 모듈 (`backend/editor/`)

#### 기능
- 숏폼 생성
- 이미지 생성
- 음성 생성
- 타임라인 편집
- 협업 기능

#### 구조
```
backend/editor/
├── __init__.py
├── models.py          # EditorProject, EditorSession
├── schemas.py
├── service.py         # 편집 로직
├── timeline.py        # 타임라인 관리
├── collaboration.py   # 협업 기능
└── router.py
```

#### API 엔드포인트
- `POST /api/v1/editor/create` - 프로젝트 생성
- `GET /api/v1/editor/{id}` - 프로젝트 조회
- `POST /api/v1/editor/{id}/timeline` - 타임라인 편집
- `POST /api/v1/editor/{id}/collaborate` - 협업 초대
- `GET /api/v1/editor/{id}/sessions` - 세션 목록

---

### 2. AI 캐릭터 IP (`backend/character/`)

#### 기능
- 캐릭터 생성/관리
- IP 관리
- 캐릭터 사용 기록

#### 구조
```
backend/character/
├── __init__.py
├── models.py          # Character (기존 모델 활용)
├── schemas.py
├── service.py         # 캐릭터 관리 로직
└── router.py
```

#### 기존 코드
- `backend/database/models.py`: `Character` 모델 존재
- `backend/modules/character/character_manager.py` 존재

#### 통합 전략
- 기존 모델과 서비스 활용
- 새 모듈 구조로 재구성

---

### 3. 개인 AI Vault (`backend/vault/`)

#### 기능
- 로컬 암호화 저장
- 선택적 AI 학습 공유
- 완전 삭제

#### 구조
```
backend/vault/
├── __init__.py
├── models.py          # VaultItem
├── schemas.py
├── service.py         # 암호화/복호화 로직
├── encryption.py      # 기존 코드 활용
└── router.py
```

#### 기존 코드
- `backend/vault/encryption.py` 존재

#### 통합 전략
- 기존 encryption.py 활용
- 새 모듈 구조로 재구성

---

### 4. Web 메타공간 (`backend/spatial/`)

#### 기능
- 공간 생성/관리
- 입장/퇴장 시스템
- 실시간 채팅

#### 구조
```
backend/spatial/
├── __init__.py
├── models.py          # Space (기존 모델 활용)
├── schemas.py
├── service.py         # 공간 관리 로직
└── router.py
```

#### 기존 코드
- `backend/database/models.py`: `Space` 모델 존재
- `backend/modules/spatial/space_manager.py` 존재
- `backend/api/spatial_routes.py` 존재

#### 통합 전략
- 기존 모델과 서비스 활용
- 새 모듈 구조로 재구성

---

### 5. AI Feed 재조합 (`backend/feed/`)

#### 기능
- 피드 생성
- AI 기반 재조합
- 개인화 추천

#### 구조
```
backend/feed/
├── __init__.py
├── models.py          # FeedItem, FeedRecommendation
├── schemas.py
├── service.py         # 피드 생성, 재조합 로직
├── recommendation.py  # AI 추천
└── router.py
```

#### 기존 코드
- `backend/modules/sns/feed_engine.py` 존재
- `backend/api/recommendation_routes.py` 존재
- `backend/services/recommendation_service.py` 존재

#### 통합 전략
- 기존 feed_engine과 recommendation_service 활용
- 새 모듈 구조로 재구성

---

### 6. 수익화 / 전문가 / 굿즈

#### 6.1 수익화 (`backend/monetization/`)
- 기존 `backend/api/monetization_routes.py` 활용
- 새 모듈 구조로 재구성

#### 6.2 전문가 (`backend/experts/`)
- Phase 5에서 구현 예정

#### 6.3 굿즈 (`backend/goods/`)
- 새로 추가할 모듈

---

## 통합 구현 순서

### Phase 2: Content 모듈 (현재)
- Content, Project 관리
- 기존 모델 활용

### Phase 2.5: Editor 모듈 (추가)
- AI Editor 기능
- 타임라인, 협업

### Phase 3: Feed 모듈
- AI Feed 재조합
- 기존 feed_engine 활용

### Phase 4: Library 모듈
- 라이브러리 관리

### Phase 5: Experts 모듈
- 전문가 마켓플레이스

### Phase 6: 통합 모듈
- Character IP 모듈화
- Vault 모듈화
- Spatial 모듈화
- Goods 모듈 추가

---

## 모듈 간 관계

```
Content ──→ Editor ──→ Orchestrator
  │            │
  ↓            ↓
Library    Character IP
  │            │
  ↓            ↓
Feed ──→ Vault ──→ Spatial
  │            │
  ↓            ↓
Experts ──→ Monetization ──→ Goods
```

---

## 다음 단계

**지금**: Phase 2 (Content 모듈) + Editor 모듈 시작
