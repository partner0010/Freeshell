# Pixabay API 통합 가이드

## ✅ 완료된 통합

### 1. 이미지 검색 API
- **함수**: `searchPixabayImages()`
- **위치**: `lib/free-apis.ts`
- **엔드포인트**: `/api/image-search`
- **상태**: ✅ 완료

### 2. 비디오 검색 API (신규)
- **함수**: `searchPixabayVideos()`
- **위치**: `lib/free-apis.ts`
- **엔드포인트**: `/api/video-search` (신규)
- **상태**: ✅ 완료

---

## 🔑 API 키 설정

### Netlify 환경 변수
1. Netlify 대시보드 → Site settings → Environment variables
2. **Key**: `PIXABAY_API_KEY` (정확히 이 이름)
3. **Value**: `54061391-2926562974110f7fde2b392a0`
4. **Scopes**: All scopes
5. **Values**: Same value for all deploy contexts
6. **Create variable** 클릭

### ⚠️ 중요: 환경 변수 이름
- ✅ 올바른 이름: `PIXABAY_API_KEY`
- ❌ 잘못된 이름: `Pixabay_API_KEY`, `pixabay_API_KEY`, `PIXABAY-API-KEY`

---

## 📝 API 사용법

### 이미지 검색

#### 기본 사용
```typescript
import { searchPixabayImages } from '@/lib/free-apis';

const results = await searchPixabayImages('노란 꽃', 20);
```

#### 고급 옵션
```typescript
const results = await searchPixabayImages('자연', 20, {
  imageType: 'photo', // 'all' | 'photo' | 'illustration' | 'vector'
  orientation: 'horizontal', // 'all' | 'horizontal' | 'vertical'
  category: 'nature', // 배경, 패션, 자연, 과학 등
  minWidth: 1920,
  minHeight: 1080,
  colors: 'yellow,green', // 그레이스케일, 투명, 빨강 등
  safesearch: true,
  order: 'popular', // 'popular' | 'latest'
});
```

### 비디오 검색

#### 기본 사용
```typescript
import { searchPixabayVideos } from '@/lib/free-apis';

const results = await searchPixabayVideos('노란 꽃', 15);
```

#### 고급 옵션
```typescript
const results = await searchPixabayVideos('자연', 15, {
  videoType: 'all', // 'all' | 'film' | 'animation'
  category: 'nature',
  minWidth: 1920,
  minHeight: 1080,
  safesearch: true,
  order: 'popular', // 'popular' | 'latest'
});
```

---

## 🌐 API 엔드포인트

### 이미지 검색
```bash
POST /api/image-search
Content-Type: application/json

{
  "query": "노란 꽃",
  "perPage": 20
}
```

**응답:**
```json
{
  "query": "노란 꽃",
  "results": {
    "pexels": [...],
    "unsplash": [...],
    "pixabay": [
      {
        "id": 195893,
        "pageURL": "https://pixabay.com/en/blossom-bloom-flower-195893/",
        "type": "photo",
        "tags": "blossom, bloom, flower",
        "previewURL": "https://cdn.pixabay.com/photo/2013/10/15/09/12/flower-195893_150.jpg",
        "webformatURL": "https://pixabay.com/get/35bbf209e13e39d2_640.jpg",
        "largeImageURL": "https://pixabay.com/get/ed6a99fd0a76647_1280.jpg",
        "user": "Josch13",
        "views": 7671,
        "downloads": 6439,
        "likes": 5
      }
    ]
  },
  "generatedAt": "2024-01-05T12:00:00.000Z"
}
```

### 비디오 검색 (신규)
```bash
POST /api/video-search
Content-Type: application/json

{
  "query": "노란 꽃",
  "perPage": 15
}
```

**응답:**
```json
{
  "query": "노란 꽃",
  "results": {
    "pexels": [...],
    "pixabay": [
      {
        "id": 125,
        "pageURL": "https://pixabay.com/videos/id-125/",
        "type": "film",
        "tags": "flowers, yellow, blossom",
        "duration": 12,
        "videos": {
          "large": {
            "url": "https://cdn.pixabay.com/video/2015/08/08/125-135736646_large.mp4",
            "width": 1920,
            "height": 1080,
            "size": 6615235,
            "thumbnail": "https://cdn.pixabay.com/video/2015/08/08/125-135736646_large.jpg"
          },
          "medium": { ... },
          "small": { ... },
          "tiny": { ... }
        },
        "views": 4462,
        "downloads": 1464,
        "likes": 18
      }
    ]
  },
  "generatedAt": "2024-01-05T12:00:00.000Z"
}
```

---

## ⚡ Rate Limit

Pixabay API는 **60초에 최대 100회 요청**을 허용합니다.

### Rate Limit 헤더
응답 헤더에서 다음 정보를 확인할 수 있습니다:
- `X-RateLimit-Limit`: 60초 동안 허용되는 최대 요청 수 (100)
- `X-RateLimit-Remaining`: 현재 남은 요청 수
- `X-RateLimit-Reset`: 요금 제한 창이 초기화되는 시간 (초)

### 권장 사항
1. **24시간 캐싱**: 검색 결과를 24시간 동안 캐시
2. **자동 쿼리 제한**: 대량 자동 쿼리 피하기
3. **에러 처리**: 429 에러 시 재시도 로직 구현

---

## 🎯 카테고리 목록

다음 카테고리로 필터링 가능:
- 배경 (backgrounds)
- 패션 (fashion)
- 자연 (nature)
- 과학 (science)
- 교육 (education)
- 감정 (feelings)
- 건강 (health)
- 사람 (people)
- 종교 (religion)
- 장소 (places)
- 동물 (animals)
- 산업 (industry)
- 컴퓨터 (computer)
- 음식 (food)
- 스포츠 (sports)
- 교통 (transportation)
- 여행 (travel)
- 건물 (buildings)
- 비즈니스 (business)
- 음악 (music)

---

## 🎨 색상 필터

다음 색상으로 필터링 가능 (쉼표로 구분하여 여러 개 선택 가능):
- 그레이스케일 (grayscale)
- 투명 (transparent)
- 빨강 (red)
- 주황 (orange)
- 노랑 (yellow)
- 초록 (green)
- 청록색 (turquoise)
- 파랑 (blue)
- 라일락 (lilac)
- 핑크 (pink)
- 흰색 (white)
- 회색 (gray)
- 검정 (black)
- 갈색 (brown)

---

## 📊 응답 데이터 구조

### 이미지 응답
```typescript
{
  id: number;                    // 고유 식별자
  pageURL: string;               // Pixabay 원본 페이지
  type: string;                  // 'photo' | 'illustration' | 'vector'
  tags: string;                  // 태그 (쉼표로 구분)
  previewURL: string;           // 150px 미리보기
  previewWidth: number;
  previewHeight: number;
  webformatURL: string;           // 640px 웹용
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL: string;         // 1280px 큰 이미지
  fullHDURL?: string;            // 1920px 풀HD (전체 API 접근 시)
  imageURL?: string;             // 원본 이미지 (전체 API 접근 시)
  imageWidth: number;
  imageHeight: number;
  imageSize: number;             // 파일 크기 (바이트)
  views: number;                 // 조회수
  downloads: number;             // 다운로드 수
  likes: number;                 // 좋아요 수
  comments: number;              // 댓글 수
  user_id: number;               // 사용자 ID
  user: string;                  // 사용자 이름
  userImageURL: string;          // 프로필 사진
}
```

### 비디오 응답
```typescript
{
  id: number;                    // 고유 식별자
  pageURL: string;               // Pixabay 원본 페이지
  type: string;                  // 'film' | 'animation'
  tags: string;                  // 태그
  duration: number;              // 재생 시간 (초)
  videos: {
    large: {                     // 보통 3840x2160
      url: string;
      width: number;
      height: number;
      size: number;
      thumbnail: string;
    };
    medium: {                    // 보통 1920x1080
      url: string;
      width: number;
      height: number;
      size: number;
      thumbnail: string;
    };
    small: {                     // 보통 1280x720
      url: string;
      width: number;
      height: number;
      size: number;
      thumbnail: string;
    };
    tiny: {                      // 보통 960x540
      url: string;
      width: number;
      height: number;
      size: number;
      thumbnail: string;
    };
  };
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
}
```

---

## 🔧 문제 해결

### API 키가 작동하지 않는 경우

1. **환경 변수 이름 확인**
   - Netlify에서 `PIXABAY_API_KEY` (모두 대문자)인지 확인
   - `Pixabay_API_KEY` 또는 `pixabay_API_KEY`는 작동하지 않음

2. **재배포 확인**
   - 환경 변수 추가/수정 후 반드시 재배포 필요
   - Deploys 탭 → "Trigger deploy"

3. **API 키 값 확인**
   - 현재 값: `54061391-2926562974110f7fde2b392a0`
   - 공백이나 특수문자 포함 여부 확인

### Rate Limit 오류 (429)

- **원인**: 60초에 100회 이상 요청
- **해결**: 요청 간격 조정, 캐싱 활용

### 응답이 비어있는 경우

- **원인**: 검색어가 너무 구체적이거나 결과가 없음
- **해결**: 더 일반적인 검색어 사용

---

## 💡 사용 팁

1. **검색어 최적화**
   - 영어 검색어가 더 많은 결과 제공
   - 한국어도 지원하지만 결과가 적을 수 있음

2. **이미지 크기 선택**
   - 미리보기: `previewURL` (150px)
   - 웹용: `webformatURL` (640px)
   - 큰 이미지: `largeImageURL` (1280px)
   - 원본: `imageURL` (전체 API 접근 시)

3. **비디오 크기 선택**
   - 모바일: `tiny` (960x540)
   - 웹: `small` (1280x720)
   - HD: `medium` (1920x1080)
   - 4K: `large` (3840x2160)

4. **저작권 표시**
   - 무료 API 사용 시 이미지/비디오 출처 표시 필요
   - `user` 필드에 기여자 이름 포함

---

## ✅ 통합 완료 체크리스트

- [x] 이미지 검색 API 통합
- [x] 비디오 검색 API 통합
- [x] Rate limit 처리
- [x] 에러 처리
- [x] 타입 정의
- [x] 문서화

---

## 🚀 다음 단계

1. **비디오 검색 UI 추가**
   - `/content-guide` 페이지에 비디오 검색 탭 추가
   - 비디오 플레이어 컴포넌트 생성

2. **캐싱 구현**
   - 검색 결과 24시간 캐싱
   - Redis 또는 메모리 캐시 사용

3. **다운로드 기능**
   - 이미지/비디오 다운로드 버튼
   - 서버에 임시 저장 후 다운로드

