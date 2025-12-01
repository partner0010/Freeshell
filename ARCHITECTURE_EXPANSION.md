# 시스템 확장 아키텍처

## 🏗️ 현재 구조

```
올인원 콘텐츠 AI
├── 프론트엔드 (React)
├── 백엔드 (Express)
├── AI 콘텐츠 생성
└── YouTube 업로드
```

## 🚀 확장 구조

```
올인원 콘텐츠 AI (수익화 자동화 플랫폼)
├── 프론트엔드
│   ├── 콘텐츠 생성
│   ├── 수익 대시보드
│   ├── 판매 관리
│   └── 통계 분석
├── 백엔드
│   ├── 콘텐츠 생성 API
│   ├── 변환 엔진
│   ├── 판매 API
│   └── 수익 추적 API
├── 자동화 엔진
│   ├── YouTube 자동화 ✅
│   ├── E-book 생성 🆕
│   ├── 블로그 자동화 🆕
│   ├── 템플릿 생성 🆕
│   └── 다채널 게시 🆕
└── 판매 플랫폼 연동
    ├── Gumroad 🆕
    ├── Etsy 🆕
    ├── Amazon KDP 🆕
    └── 자체 판매 🆕
```

---

## 📦 새로운 모듈 구조

### 1. E-book 생성 모듈
```
backend/src/services/ebook/
├── generator.ts      # E-book 콘텐츠 생성
├── formatter.ts      # PDF/EPUB 포맷팅
├── cover.ts          # 표지 생성
└── metadata.ts       # 메타데이터 생성
```

### 2. 블로그 자동화 모듈
```
backend/src/services/blog/
├── generator.ts      # 블로그 포스트 생성
├── translator.ts     # 다국어 번역
├── seo.ts            # SEO 최적화
└── publisher.ts      # 자동 게시
```

### 3. 템플릿 생성 모듈
```
backend/src/services/template/
├── generator.ts      # 템플릿 생성
├── codegen.ts        # 코드 생성
└── packager.ts       # 패키징
```

### 4. 판매 플랫폼 모듈
```
backend/src/services/sales/
├── gumroad.ts        # Gumroad API
├── etsy.ts           # Etsy API
├── amazon.ts         # Amazon KDP API
└── payment.ts        # 결제 처리
```

### 5. 수익 추적 모듈
```
backend/src/services/revenue/
├── tracker.ts        # 수익 추적
├── analytics.ts      # 분석
└── reporting.ts      # 리포트 생성
```

---

## 🔄 데이터 흐름

```
[입력] → [AI 생성] → [변환] → [최적화] → [게시/판매] → [수익 추적]
```

각 단계별로:
1. **입력**: 사용자 또는 스케줄러
2. **AI 생성**: OpenAI/Claude
3. **변환**: YouTube, E-book, 블로그 등
4. **최적화**: SEO, 번역, 포맷팅
5. **게시/판매**: 각 플랫폼 API
6. **수익 추적**: 실시간 통계

---

## 💾 데이터베이스 확장

### 새로운 테이블
- `ebooks`: E-book 정보
- `templates`: 템플릿 정보
- `blog_posts`: 블로그 포스트
- `sales`: 판매 기록
- `revenue`: 수익 기록
- `platforms`: 플랫폼 연동 정보

---

## 🔌 API 확장

### 새로운 엔드포인트
- `POST /api/ebook/generate`: E-book 생성
- `POST /api/ebook/publish`: E-book 판매
- `POST /api/blog/generate`: 블로그 포스트 생성
- `POST /api/blog/publish`: 블로그 게시
- `POST /api/template/generate`: 템플릿 생성
- `POST /api/template/publish`: 템플릿 판매
- `GET /api/revenue`: 수익 조회
- `GET /api/analytics`: 통계 분석

---

## 🎯 구현 우선순위

1. **E-book 생성** (가장 수익성 높음)
2. **Gumroad 연동** (가장 쉬움)
3. **수익 추적** (모니터링 필수)
4. **블로그 자동화** (SEO 효과)
5. **템플릿 생성** (고수익)

