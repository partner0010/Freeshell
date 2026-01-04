# 디자인 시스템 가이드

## 반응형 브레이크포인트

- `sm`: 640px 이상 (작은 태블릿)
- `md`: 768px 이상 (태블릿)
- `lg`: 1024px 이상 (데스크톱)
- `xl`: 1280px 이상 (큰 데스크톱)

## 텍스트 크기 체계

### 작은 텍스트 (라벨, 힌트)
- 기본: `text-xs` (12px)
- 태블릿: `sm:text-sm` (14px)

### 본문 텍스트
- 기본: `text-sm` (14px)
- 태블릿: `sm:text-base` (16px)
- 데스크톱: `md:text-lg` (18px)

### 제목
- 작은 제목: `text-lg sm:text-xl md:text-2xl`
- 중간 제목: `text-xl sm:text-2xl md:text-3xl`
- 큰 제목: `text-2xl sm:text-3xl md:text-4xl`

## 간격 체계

### 패딩 (컨테이너)
- 모바일: `p-4` (16px)
- 태블릿: `sm:p-6` (24px)
- 데스크톱: `md:p-8` (32px)

### 마진 (섹션 간)
- 모바일: `mb-6` (24px)
- 태블릿: `sm:mb-8` (32px)
- 데스크톱: `md:mb-12` (48px)

### 갭 (요소 간)
- 작은 갭: `gap-2 sm:gap-3`
- 중간 갭: `gap-3 sm:gap-4`
- 큰 갭: `gap-4 sm:gap-6`

## 버튼 크기

### 작은 버튼
- 패딩: `px-3 py-2 sm:px-4 sm:py-2.5`
- 텍스트: `text-sm sm:text-base`

### 기본 버튼
- 패딩: `px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3`
- 텍스트: `text-sm sm:text-base md:text-lg`

### 큰 버튼
- 패딩: `px-6 py-3 md:px-8 md:py-4`
- 텍스트: `text-base sm:text-lg md:text-xl`

## 입력 필드

- 패딩: `px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3.5`
- 텍스트: `text-sm sm:text-base md:text-lg`
- 높이: 자동 (패딩에 의해 결정)

## 아이콘 크기

- 작은 아이콘: `w-4 h-4 sm:w-5 sm:h-5`
- 기본 아이콘: `w-5 h-5 sm:w-6 sm:h-6`
- 큰 아이콘: `w-6 h-6 sm:w-8 sm:h-8`

## 둥근 모서리

- 작은: `rounded-lg` (8px)
- 기본: `rounded-xl` (12px)
- 큰: `rounded-2xl` (16px)

## 그림자

- 작은: `shadow-md`
- 기본: `shadow-lg`
- 큰: `shadow-xl`

## 색상

- Primary: `bg-primary`, `text-primary`
- 배경: `bg-white dark:bg-gray-800`
- 텍스트: `text-gray-900 dark:text-white`
- 보조 텍스트: `text-gray-600 dark:text-gray-400`

