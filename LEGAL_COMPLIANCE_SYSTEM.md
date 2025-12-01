# 법적 준수 시스템 완료

## ✅ 구현 완료

### 1. 저작권 검사 시스템
- ✅ 텍스트 저작권 검사
- ✅ 내부 데이터베이스와 비교 (중복 검사)
- ✅ 외부 소스 검사 (표절 검사)
- ✅ 이미지 저작권 검사 (역 이미지 검색 준비)
- ✅ 비디오 저작권 검사 (YouTube Content ID 준비)

**파일**: `backend/src/services/legal/copyrightChecker.ts`

### 2. 콘텐츠 필터링 시스템
- ✅ 금지 단어 검사
- ✅ 민감한 주제 검사
- ✅ 플랫폼별 정책 검사 (YouTube, TikTok, Instagram)
- ✅ 콘텐츠 길이 검사

**파일**: `backend/src/services/legal/contentFilter.ts`

### 3. 종합 법적 준수 검사
- ✅ 저작권 검사
- ✅ 콘텐츠 필터링
- ✅ 플랫폼 정책 검사
- ✅ 위험도 계산
- ✅ 게시 가능 여부 결정
- ✅ 개선 제안 제공

**파일**: `backend/src/services/legal/legalCompliance.ts`

### 4. 자동 통합
- ✅ 콘텐츠 생성 시 자동 법적 검사
- ✅ 위험도가 높으면 자동 플래그
- ✅ 검사 결과 로깅

**통합 위치**: `backend/src/services/contentGenerator.ts`

---

## 🔍 검사 항목

### 저작권 검사
1. **내부 데이터베이스 검사**
   - 기존 생성된 콘텐츠와 비교
   - 70% 이상 유사도 발견 시 경고

2. **외부 소스 검사**
   - 온라인 표절 검사 (API 연동 준비)
   - 문장 단위 검사

3. **미디어 검사**
   - 이미지: 역 이미지 검색 (준비됨)
   - 비디오: YouTube Content ID (준비됨)

### 콘텐츠 필터링
1. **금지 단어**
   - 욕설, 비속어
   - 혐오 표현
   - 불법 관련
   - 성인 콘텐츠
   - 폭력 관련

2. **민감한 주제**
   - 정치적 논란
   - 종교적 논란
   - 인종/성 차별

3. **플랫폼 정책**
   - YouTube: 제목 100자, 설명 5000자 제한
   - TikTok: 설명 2200자 제한
   - Instagram: 설명 2200자 제한

---

## 📊 위험도 레벨

### Low (낮음)
- 저작권 문제 없음
- 금지 단어 없음
- 플랫폼 정책 준수
- **게시 가능** ✅

### Medium (중간)
- 일부 유사도 발견 (70-90%)
- 민감한 주제 포함
- 플랫폼 정책 일부 위반
- **검토 후 게시** ⚠️

### High (높음)
- 높은 유사도 발견 (90% 이상)
- 금지 단어 포함
- 플랫폼 정책 위반
- **게시 불가** ❌

---

## 🚀 사용 방법

### 1. 자동 검사 (콘텐츠 생성 시)
콘텐츠 생성 시 자동으로 법적 검사가 수행됩니다.

```typescript
// contentGenerator.ts에서 자동 실행
const legalCheck = await legalCompliance.performComprehensiveCheck({
  title: content.title,
  description: content.description,
  text: content.reasoning,
  platforms: ['youtube']
})
```

### 2. 수동 검사 (API 호출)

#### 종합 법적 검사
```bash
POST /api/legal/check
{
  "title": "콘텐츠 제목",
  "description": "설명",
  "text": "본문",
  "tags": ["태그1", "태그2"],
  "platforms": ["youtube", "tiktok"]
}
```

#### 저작권 검사만
```bash
POST /api/legal/copyright
{
  "text": "검사할 텍스트",
  "imagePath": "이미지 경로 (선택)",
  "videoPath": "비디오 경로 (선택)"
}
```

#### 콘텐츠 필터링만
```bash
POST /api/legal/filter
{
  "title": "제목",
  "description": "설명",
  "text": "본문",
  "tags": ["태그"]
}
```

#### 플랫폼 정책 검사
```bash
POST /api/legal/platform-policy
{
  "content": { "title": "...", "description": "..." },
  "platform": "youtube"
}
```

---

## 📝 응답 예시

### 종합 검사 응답
```json
{
  "success": true,
  "result": {
    "passed": true,
    "checks": {
      "copyright": {
        "passed": true,
        "riskLevel": "low",
        "details": {
          "isOriginal": true,
          "similarity": 0.1,
          "matches": []
        }
      },
      "contentFilter": {
        "passed": true,
        "riskLevel": "low",
        "violations": []
      },
      "platformPolicy": {
        "passed": true,
        "violations": [],
        "suggestions": []
      }
    },
    "overallRisk": "low",
    "canPublish": true,
    "recommendations": []
  }
}
```

### 위험도 높은 경우
```json
{
  "success": true,
  "result": {
    "passed": false,
    "checks": {
      "copyright": {
        "passed": false,
        "riskLevel": "high",
        "details": {
          "isOriginal": false,
          "similarity": 0.95,
          "matches": [
            {
              "source": "내부 콘텐츠: 유사한 주제",
              "similarity": 0.95
            }
          ]
        }
      }
    },
    "overallRisk": "high",
    "canPublish": false,
    "recommendations": [
      "저작권 문제가 발견되었습니다. 콘텐츠를 수정하거나 원본 출처를 명시하세요"
    ]
  }
}
```

---

## ⚠️ 주의사항

1. **외부 API 연동 필요**
   - 표절 검사 API (Copyscape, Grammarly 등)
   - 역 이미지 검색 API (Google Images, TinEye 등)
   - YouTube Content ID API

2. **성능 고려**
   - 법적 검사는 시간이 걸릴 수 있음
   - 비동기 처리 권장
   - 캐싱 활용 가능

3. **정확도**
   - 현재는 기본 구현
   - 실제 서비스에서는 전문 API 사용 권장

---

## 🔄 향후 개선 사항

1. **외부 API 연동**
   - 표절 검사 API
   - 역 이미지 검색 API
   - YouTube Content ID

2. **머신러닝 기반 검사**
   - AI 기반 저작권 검사
   - 패턴 인식

3. **실시간 모니터링**
   - 게시 후 지속적 모니터링
   - 저작권 침해 신고 처리

---

## ✅ 완료!

이제 **콘텐츠 생성 시 자동으로 법적 검사**가 수행되며, **이중 확인**이 가능합니다!

**데이터베이스 마이그레이션**은 로컬에서도 가능합니다:
```bash
cd backend
npx prisma migrate dev --name legal_compliance
```

