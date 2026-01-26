# 캐릭터 수익화 시스템

**작성 일시**: 2026-01-25  
**목표**: 캐릭터 기반 수익화 (굿즈, 라이브 후원, 교육·스토리)

---

## 구현 완료

### 파일 구조
```
backend/character/
├── monetization.py    ✅ (새로 추가)
├── router.py          ✅ (수익화 엔드포인트 추가)
└── schemas.py         ✅ (수익화 스키마 추가)
```

---

## 수익화 기능

### 1. 캐릭터 굿즈
- **이미지 팩**: 캐릭터 이미지 세트
- **음성 팩**: 캐릭터 음성 세트
- **스티커**: 캐릭터 스티커
- **굿즈**: 캐릭터 관련 상품

### 2. 캐릭터 라이브 (후원)
- **일회성 후원**: 원타임 후원
- **월간 후원**: 정기 후원
- **슈퍼챗**: 실시간 후원 메시지

### 3. 캐릭터 기반 교육·스토리
- **교육 콘텐츠**: 캐릭터를 활용한 교육 자료
- **스토리**: 캐릭터 기반 스토리 콘텐츠

---

## API 엔드포인트

### 굿즈

#### `POST /api/v1/characters/{character_id}/goods`
**굿즈 생성**

**요청:**
```json
{
  "goods_type": "image_pack",  // image_pack, voice_pack, sticker, merchandise
  "title": "AI 하나 이미지 팩",
  "description": "다양한 표정의 AI 하나 이미지 세트",
  "price": 9.99,
  "file_paths": ["image1.png", "image2.png", "image3.png"],
  "preview_url": "preview.png"
}
```

**응답:**
```json
{
  "id": "goods_char_001_123456",
  "character_id": "char_001",
  "goods_type": "image_pack",
  "title": "AI 하나 이미지 팩",
  "description": "다양한 표정의 AI 하나 이미지 세트",
  "price": 9.99,
  "preview_url": "preview.png",
  "sales_count": 0,
  "rating": 0.0,
  "created_at": "2026-01-25T12:00:00"
}
```

#### `GET /api/v1/characters/{character_id}/goods`
**굿즈 목록 조회**

---

### 라이브 후원

#### `POST /api/v1/characters/{character_id}/live/donate`
**라이브 후원**

**요청:**
```json
{
  "donation_type": "super_chat",  // one_time, monthly, super_chat
  "amount": 5.00,
  "message": "응원합니다!"
}
```

**응답:**
```json
{
  "id": "donation_char_001_123456",
  "character_id": "char_001",
  "user_id": "user_123",
  "donation_type": "super_chat",
  "amount": 5.00,
  "message": "응원합니다!",
  "created_at": "2026-01-25T12:00:00"
}
```

---

### 교육·스토리

#### `POST /api/v1/characters/{character_id}/education`
**교육·스토리 생성**

**요청:**
```json
{
  "title": "AI 하나와 함께하는 코딩 배우기",
  "description": "캐릭터 AI 하나가 가르쳐주는 코딩 기초",
  "content_type": "education",  // education, story
  "price": 19.99,
  "content_path": "education/coding_basics.mp4",
  "duration": 60.0
}
```

**응답:**
```json
{
  "id": "edu_char_001_123456",
  "character_id": "char_001",
  "title": "AI 하나와 함께하는 코딩 배우기",
  "description": "캐릭터 AI 하나가 가르쳐주는 코딩 기초",
  "content_type": "education",
  "price": 19.99,
  "duration": 60.0,
  "sales_count": 0,
  "rating": 0.0,
  "created_at": "2026-01-25T12:00:00"
}
```

---

### 수익 통계

#### `GET /api/v1/characters/{character_id}/revenue`
**수익 통계 조회**

**응답:**
```json
{
  "character_id": "char_001",
  "goods_revenue": 150.50,
  "live_revenue": 320.00,
  "education_revenue": 89.99,
  "total_revenue": 560.49,
  "goods_sales_count": 15,
  "live_donations_count": 32,
  "education_sales_count": 4
}
```

---

## 사용 예시

### Python 코드
```python
from backend.character.monetization import (
    CharacterMonetization,
    GoodsType,
    LiveDonationType
)

# 수익화 서비스 생성
monetization = CharacterMonetization()

# 굿즈 생성
goods_result = await monetization.create_goods(
    character_id="char_001",
    goods_type=GoodsType.IMAGE_PACK,
    title="AI 하나 이미지 팩",
    description="다양한 표정의 이미지 세트",
    price=9.99,
    file_paths=["image1.png", "image2.png"]
)

# 라이브 후원
donation_result = await monetization.create_live_donation(
    character_id="char_001",
    user_id="user_123",
    donation_type=LiveDonationType.SUPER_CHAT,
    amount=5.00,
    message="응원합니다!"
)

# 수익 통계
stats = await monetization.get_revenue_stats("char_001")
print(f"Total revenue: ${stats['stats']['total_revenue']}")
```

---

## 다음 단계

### 즉시 개선 가능
1. **결제 통합**: Stripe/PayPal 등 결제 게이트웨이 통합
2. **DB 저장**: 실제 데이터베이스에 굿즈/후원/교육 정보 저장
3. **파일 관리**: S3 등 클라우드 스토리지 통합

### 추가 기능
1. **리뷰 시스템**: 굿즈/교육에 대한 리뷰 및 평점
2. **할인/프로모션**: 특정 기간 할인 이벤트
3. **구독 모델**: 월간 구독 기반 교육 콘텐츠

---

## 주의사항

1. **결제 보안**: 결제 정보는 안전하게 처리해야 함
2. **파일 보안**: 구매한 파일은 보안 토큰으로 보호
3. **수익 분배**: 플랫폼 수수료 및 세금 처리 필요
