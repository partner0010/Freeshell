# AI 캐릭터 고정 IP 시스템

**작성 일시**: 2026-01-25  
**목표**: 플랫폼의 "얼굴"이 되는 캐릭터 IP 시스템 구현

---

## 개념

### 고정 IP (Fixed IP)
- 사용자가 만든 캐릭터 = 고정 IP
- 영상, 음성, 라이브, 굿즈까지 확장
- TikTok·VTuber·IP 비즈니스의 결합형

### 데이터 구조

```json
{
  "character_id": "char_001",
  "name": "AI 하나",
  "base_image": "face.png",
  "voice_model": "voice_ref.wav",
  "personality": {
    "tone": "따뜻함",
    "speed": "보통"
  },
  "owner": "user_123"
}
```

---

## 구현된 기능

### ✅ Character 모듈 생성
- `backend/character/__init__.py`
- `backend/character/models.py` (기존 Character 모델 활용)
- `backend/character/schemas.py` (Personality 포함)
- `backend/character/service.py` (비즈니스 로직)
- `backend/character/router.py` (API 엔드포인트)

### ✅ API 엔드포인트

#### 기본 CRUD
- `POST /api/v1/characters` - 캐릭터 생성 (고정 IP 생성)
- `GET /api/v1/characters` - 캐릭터 목록 (내 IP 목록)
- `GET /api/v1/characters/{id}` - 캐릭터 조회 (IP 정보)
- `PUT /api/v1/characters/{id}` - 캐릭터 수정 (IP 업데이트)
- `DELETE /api/v1/characters/{id}` - 캐릭터 삭제

#### 통계
- `GET /api/v1/characters/{id}/stats` - 사용 통계 (IP 비즈니스 지표)
  - 생성된 영상 수
  - 생성된 오디오 수
  - 라이브 방송 수
  - 굿즈 판매 수
  - 총 수익

---

## 데이터 매핑

### 기존 Character 모델 → 새 스키마

| 새 스키마 | 기존 모델 | 저장 위치 |
|-----------|-----------|-----------|
| `character_id` | `id` | Column |
| `name` | `name` | Column |
| `base_image` | `image_path` | Column |
| `voice_model` | - | `metadata.voice_model` |
| `personality` | - | `metadata.personality` |
| `owner` | `user_id` | Column |
| `description` | `description` | Column |
| `tags` | - | `metadata.tags` |
| `usage_count` | - | `metadata.usage_count` |

---

## 사용 시나리오

### 1. 캐릭터 생성 (고정 IP 생성)
```python
POST /api/v1/characters
{
  "name": "AI 하나",
  "base_image": "face.png",
  "voice_model": "voice_ref.wav",
  "personality": {
    "tone": "따뜻함",
    "speed": "보통"
  }
}
```

### 2. 콘텐츠 생성 시 캐릭터 사용
```python
POST /api/v1/content/projects/{id}/contents
{
  "type": "video",
  "metadata": {
    "character_id": "char_001"  # 캐릭터 IP 사용
  }
}
```

### 3. 통계 조회 (IP 비즈니스 지표)
```python
GET /api/v1/characters/{id}/stats
Response: {
  "character_id": "char_001",
  "total_videos": 12,
  "total_audio": 8,
  "total_live": 3,
  "total_goods": 5,
  "total_revenue": 1200.0
}
```

---

## 확장 계획

### Phase 1: 기본 기능 ✅
- 캐릭터 CRUD
- 통계 조회

### Phase 2: 콘텐츠 통합
- 영상 생성 시 캐릭터 사용
- 오디오 생성 시 캐릭터 음성 사용
- 자동 사용 횟수 증가

### Phase 3: 라이브 기능
- 라이브 방송 시 캐릭터 사용
- 실시간 캐릭터 애니메이션

### Phase 4: 굿즈 연동
- 캐릭터 기반 굿즈 생성
- 수익 추적

---

## 다음 단계

1. **콘텐츠 생성 통합**: Content 생성 시 character_id 사용
2. **자동 통계 업데이트**: 콘텐츠 생성 시 자동으로 usage_count 증가
3. **라이브 기능**: 라이브 방송 시 캐릭터 사용
4. **굿즈 연동**: 캐릭터 기반 굿즈 생성 및 판매
