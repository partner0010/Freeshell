# 추가 기능 구현 로드맵

**작성 일시**: 2026-01-25  
**목표**: 피드, 전문가, 라이브러리 기능 구현  
**전체 기간**: 4주

---

## 전체 계획 개요

### 구현할 기능
1. **콘텐츠 피드 페이지** (`/feed`): 커뮤니티 기능
2. **전문가 마켓플레이스** (`/experts`): 전문가 매칭
3. **라이브러리 페이지** (`/library`): 콘텐츠 관리

### 단계별 계획
- **Phase 1**: 공통 백엔드 구조 (1주)
- **Phase 2**: Content 모듈 구현 (3일)
- **Phase 3**: Feed 모듈 구현 (3일)
- **Phase 4**: Library 모듈 구현 (3일)
- **Phase 5**: Experts 모듈 구현 (3일)
- **Phase 6**: 프론트엔드 UI 구현 (1주)

---

## Phase 1: 공통 백엔드 구조 (1주)

### 목표
모듈화된 백엔드 구조 구축 및 공통 기능 통합

### 작업 내용

#### 1.1 Core 모듈 생성
```
backend/core/
├── __init__.py
├── db.py          # DB 연결 (기존 database/connection.py 통합)
├── auth.py        # 인증/인가
└── permissions.py # 권한 관리
```

#### 1.2 기존 코드 통합
- `backend/database/connection.py` → `backend/core/db.py`로 통합
- `backend/app/db/session.py` → `backend/core/db.py`로 통합
- 인증 로직 통합 → `backend/core/auth.py`

#### 1.3 디렉토리 구조 생성
```
backend/
├── core/          # ✅ Phase 1
├── content/       # Phase 2
├── feed/          # Phase 3
├── library/       # Phase 4
└── experts/       # Phase 5
```

### 체크리스트
- [ ] `core/__init__.py` 생성
- [ ] `core/db.py` 구현 (기존 코드 통합)
- [ ] `core/auth.py` 구현
- [ ] `core/permissions.py` 구현
- [ ] 기존 코드에서 새 구조로 import 변경
- [ ] 테스트 및 검증

---

## Phase 2: Content 모듈 (3일)

### 목표
콘텐츠 관리 기능 모듈화

### 작업 내용

#### 2.1 모델 정의
- 기존 `database/models.py`의 `Content`, `Project` 모델 활용
- 필요시 확장

#### 2.2 모듈 구조
```
backend/content/
├── __init__.py
├── models.py      # 기존 모델 import
├── schemas.py     # Pydantic 스키마
├── service.py     # 비즈니스 로직
└── router.py      # API 엔드포인트
```

#### 2.3 API 엔드포인트
- `GET /api/v1/content` - 콘텐츠 목록
- `GET /api/v1/content/{id}` - 콘텐츠 상세
- `POST /api/v1/content` - 콘텐츠 생성
- `PUT /api/v1/content/{id}` - 콘텐츠 수정
- `DELETE /api/v1/content/{id}` - 콘텐츠 삭제

### 체크리스트
- [ ] `content/__init__.py` 생성
- [ ] `content/models.py` (기존 모델 import)
- [ ] `content/schemas.py` 구현
- [ ] `content/service.py` 구현
- [ ] `content/router.py` 구현
- [ ] `main.py`에 라우터 등록
- [ ] 테스트

---

## Phase 3: Feed 모듈 (3일)

### 목표
커뮤니티 피드 기능 구현

### 작업 내용

#### 3.1 모델 정의
```python
# feed/models.py
- FeedItem (비디오, 프로젝트 등)
- FeedInteraction (좋아요, 댓글, 공유)
- FeedRecommendation (AI 추천)
```

#### 3.2 모듈 구조
```
backend/feed/
├── __init__.py
├── models.py
├── schemas.py
├── service.py     # 피드 생성, 추천 로직
└── router.py
```

#### 3.3 API 엔드포인트
- `GET /api/v1/feed` - 피드 조회 (개인화)
- `GET /api/v1/feed/trending` - 트렌딩 피드
- `POST /api/v1/feed/{id}/like` - 좋아요
- `POST /api/v1/feed/{id}/comment` - 댓글 작성
- `POST /api/v1/feed/{id}/share` - 공유

### 체크리스트
- [ ] `feed/__init__.py` 생성
- [ ] `feed/models.py` 구현
- [ ] `feed/schemas.py` 구현
- [ ] `feed/service.py` 구현 (기존 recommendation_service 통합)
- [ ] `feed/router.py` 구현
- [ ] `main.py`에 라우터 등록
- [ ] 테스트

---

## Phase 4: Library 모듈 (3일)

### 목표
라이브러리 (내 콘텐츠 관리) 기능 구현

### 작업 내용

#### 4.1 모델 정의
```python
# library/models.py
- LibraryItem (콘텐츠 참조)
- Collection (컬렉션/폴더)
- LibraryTag (태그)
```

#### 4.2 모듈 구조
```
backend/library/
├── __init__.py
├── models.py
├── schemas.py
├── service.py     # 라이브러리 관리 로직
└── router.py
```

#### 4.3 API 엔드포인트
- `GET /api/v1/library` - 라이브러리 목록
- `GET /api/v1/library/collections` - 컬렉션 목록
- `POST /api/v1/library/collections` - 컬렉션 생성
- `POST /api/v1/library/{id}/add` - 콘텐츠 추가
- `DELETE /api/v1/library/{id}` - 콘텐츠 삭제
- `GET /api/v1/library/search` - 검색

### 체크리스트
- [ ] `library/__init__.py` 생성
- [ ] `library/models.py` 구현
- [ ] `library/schemas.py` 구현
- [ ] `library/service.py` 구현
- [ ] `library/router.py` 구현
- [ ] `main.py`에 라우터 등록
- [ ] 테스트

---

## Phase 5: Experts 모듈 (3일)

### 목표
전문가 마켓플레이스 기능 구현

### 작업 내용

#### 5.1 모델 정의
```python
# experts/models.py
- Expert (전문가 프로필)
- ExpertRequest (요청)
- ExpertReview (리뷰)
- ExpertSkill (기술 스택)
```

#### 5.2 모듈 구조
```
backend/experts/
├── __init__.py
├── models.py
├── schemas.py
├── service.py     # 전문가 매칭 로직
└── router.py
```

#### 5.3 API 엔드포인트
- `GET /api/v1/experts` - 전문가 목록
- `GET /api/v1/experts/{id}` - 전문가 상세
- `POST /api/v1/experts/{id}/request` - 요청 생성
- `GET /api/v1/experts/requests` - 내 요청 목록
- `POST /api/v1/experts/{id}/review` - 리뷰 작성

### 체크리스트
- [ ] `experts/__init__.py` 생성
- [ ] `experts/models.py` 구현
- [ ] `experts/schemas.py` 구현
- [ ] `experts/service.py` 구현
- [ ] `experts/router.py` 구현
- [ ] `main.py`에 라우터 등록
- [ ] 테스트

---

## Phase 6: 프론트엔드 UI (1주)

### 목표
각 기능의 프론트엔드 페이지 구현

### 작업 내용

#### 6.1 Feed 페이지 (`/feed`)
- 피드 목록 UI
- 좋아요, 댓글, 공유 기능
- 무한 스크롤
- 필터 및 정렬

#### 6.2 Library 페이지 (`/library`)
- 콘텐츠 그리드/리스트 뷰
- 컬렉션 관리
- 검색 및 필터
- 태그 관리

#### 6.3 Experts 페이지 (`/experts`)
- 전문가 목록
- 전문가 프로필
- 요청 생성 폼
- 리뷰 시스템

### 체크리스트
- [ ] `/feed` 페이지 구현
- [ ] `/library` 페이지 구현
- [ ] `/experts` 페이지 구현
- [ ] API 연동
- [ ] 반응형 디자인
- [ ] 테스트

---

## 통합 및 테스트

### 통합 작업
- [ ] 모든 모듈을 `main.py`에 통합
- [ ] 기존 API와의 호환성 확인
- [ ] 인증/권한 통합 확인

### 테스트
- [ ] 단위 테스트 (각 모듈)
- [ ] 통합 테스트 (API 엔드포인트)
- [ ] E2E 테스트 (프론트엔드)

---

## 예상 일정

| Phase | 작업 | 기간 |
|-------|------|------|
| Phase 1 | 공통 백엔드 구조 | 1주 |
| Phase 2 | Content 모듈 | 3일 |
| Phase 3 | Feed 모듈 | 3일 |
| Phase 4 | Library 모듈 | 3일 |
| Phase 5 | Experts 모듈 | 3일 |
| Phase 6 | 프론트엔드 UI | 1주 |
| **총계** | | **4주** |

---

## 다음 단계

**지금 시작**: Phase 1 - 공통 백엔드 구조 구현
