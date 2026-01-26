# 다음 단계 가이드

**작성 일시**: 2026-01-25

---

## ✅ 완료된 작업

### Phase 1: 공통 백엔드 구조
- Core 모듈 (db, auth, permissions)

### Phase 2: Content 모듈
- Project CRUD
- Content CRUD

### Character IP 모듈 (사용자 정의 구조)
- 캐릭터 CRUD
- Personality 설정
- 사용 통계

---

## 🎯 다음 단계 우선순위

### 1. Editor 모듈 (타임라인, 협업) 🔴 High Priority
**목표**: AI Editor 기능 구현

#### 구현할 기능
- 타임라인 편집
- 협업 기능
- 숏폼/이미지/음성 생성 통합

#### 파일 구조
```
backend/editor/
├── __init__.py
├── models.py      # EditorProject, EditorSession
├── schemas.py
├── service.py
├── timeline.py    # 타임라인 관리
├── collaboration.py # 협업 기능
└── router.py
```

#### API 엔드포인트
- `POST /api/v1/editor/create` - 프로젝트 생성
- `GET /api/v1/editor/{id}` - 프로젝트 조회
- `POST /api/v1/editor/{id}/timeline` - 타임라인 편집
- `POST /api/v1/editor/{id}/collaborate` - 협업 초대
- `GET /api/v1/editor/{id}/sessions` - 세션 목록

---

### 2. Feed 모듈 (AI Feed 재조합) 🟡 Medium Priority
**목표**: 커뮤니티 피드 기능

#### 구현할 기능
- 피드 생성
- AI 기반 재조합
- 개인화 추천

#### 기존 코드 활용
- `backend/modules/sns/feed_engine.py`
- `backend/services/recommendation_service.py`

---

### 3. Library 모듈 🟡 Medium Priority
**목표**: 라이브러리 (내 콘텐츠 관리)

#### 구현할 기능
- 콘텐츠 그리드/리스트 뷰
- 컬렉션 관리
- 검색 및 필터
- 태그 관리

---

### 4. Experts 모듈 🟢 Low Priority
**목표**: 전문가 마켓플레이스

#### 구현할 기능
- 전문가 검색 및 매칭
- 프로필 및 포트폴리오
- 요청 및 결제 시스템

---

## 통합 작업

### Content ↔ Character 통합
- Content 생성 시 character_id 사용
- 자동 통계 업데이트

### Vault 모듈화
- 기존 `backend/vault/encryption.py` 활용
- 새 모듈 구조로 재구성

### Spatial 모듈화
- 기존 `backend/modules/spatial/space_manager.py` 활용
- 새 모듈 구조로 재구성

---

## 예상 일정

| 모듈 | 우선순위 | 예상 기간 |
|------|----------|-----------|
| Editor | 🔴 High | 3일 |
| Feed | 🟡 Medium | 3일 |
| Library | 🟡 Medium | 3일 |
| Experts | 🟢 Low | 3일 |

---

## 권장 진행 순서

1. **Editor 모듈** (타임라인, 협업) - 사용자 정의 구조의 핵심
2. **Feed 모듈** (AI Feed 재조합) - 커뮤니티 기능
3. **Library 모듈** - 콘텐츠 관리
4. **Experts 모듈** - 전문가 마켓플레이스

---

## 현재 상태

- ✅ Phase 1: Core 모듈
- ✅ Phase 2: Content 모듈
- ✅ Character IP 모듈
- ⏳ Editor 모듈 (다음 단계)
- ⏳ Feed 모듈
- ⏳ Library 모듈
- ⏳ Experts 모듈
