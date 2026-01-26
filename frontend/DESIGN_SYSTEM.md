# 디자인 시스템 (Tailwind)

## 컬러 팔레트

- Primary: `primary-400` #A78BFA, `primary-500` #8B5CF6, `primary-600` #7C3AED, `primary-700` #6D28D9
- Secondary: `secondary-400` #22D3EE, `secondary-500` #06B6D4, `secondary-600` #0891B2, `secondary-700` #0E7490
- Accent: `accent-400` #FBBF24, `accent-500` #F59E0B, `accent-600` #D97706
- Neutral: `neutral-50` ~ `neutral-900`
- Status: `success-400/500/600`, `error-400/500/600`, `warning-400/500/600`, `info-400/500/600`

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `primary-400` | `#A78BFA` | hover/soft 배경 |
| `primary-500` | `#8B5CF6` | 주요 버튼/강조 |
| `primary-600` | `#7C3AED` | active/강조 |
| `primary-700` | `#6D28D9` | 대비 강조 |
| `secondary-400` | `#22D3EE` | 보조 강조 |
| `secondary-500` | `#06B6D4` | 보조 액션/링크 |
| `secondary-600` | `#0891B2` | active/강조 |
| `secondary-700` | `#0E7490` | 대비 강조 |
| `accent-400` | `#FBBF24` | 포인트 강조 |
| `accent-500` | `#F59E0B` | 포인트/하이라이트 |
| `accent-600` | `#D97706` | 대비 강조 |
| `success-400` | `#4ADE80` | 성공 강조 |
| `success-500` | `#22C55E` | 성공 상태 |
| `success-600` | `#16A34A` | 성공 대비 |
| `warning-400` | `#FBBF24` | 경고 강조 |
| `warning-500` | `#F59E0B` | 경고 상태 |
| `warning-600` | `#D97706` | 경고 대비 |
| `error-400` | `#F87171` | 에러 강조 |
| `error-500` | `#EF4444` | 에러 상태 |
| `error-600` | `#DC2626` | 에러 대비 |
| `info-400` | `#60A5FA` | 정보 강조 |
| `info-500` | `#3B82F6` | 정보 상태 |
| `info-600` | `#2563EB` | 정보 대비 |

## Typography

- Heading: Pretendard (Bold)
- Body: Pretendard (Regular)
- Code: JetBrains Mono

| 역할 | 폰트 | 크기 | 굵기 |
| --- | --- | --- | --- |
| Heading | Pretendard | 24px | 700 |
| Subheading | Pretendard | 18px | 600 |
| Body | Pretendard | 14px | 400 |
| Caption | Pretendard | 12px | 400 |
| Code | JetBrains Mono | 12px | 400 |

### Tailwind 폰트 토큰

- `font-heading`: Pretendard Bold
- `font-body`: Pretendard Regular
- `font-code`: JetBrains Mono

### 기본 적용

- `body`: `font-body`
- `h1~h6`: `font-heading` + `font-bold`
- `code`, `pre`, `kbd`, `samp`: `font-code`

### Tailwind 크기 토큰

- `text-heading`: 24px / 32px
- `text-subheading`: 18px / 28px
- `text-body`: 14px / 24px
- `text-caption`: 12px / 16px
- `text-code`: 12px / 16px

## Spacing & Sizing

- 8px 기반 스케일
- 예: `1=8px`, `2=16px`, `3=24px`, `4=32px`, `6=48px`, `8=64px`

| 스케일 | 값 |
| --- | --- |
| `1` | 8px |
| `2` | 16px |
| `3` | 24px |
| `4` | 32px |
| `5` | 40px |
| `6` | 48px |
| `8` | 64px |

### Spacing 사용 가이드

- 카드 패딩: `p-4` (32px), 조밀한 카드 `p-3` (24px)
- 섹션 간격: `py-8` (64px), 좁은 섹션 `py-6` (48px)
- 폼 필드 간격: `gap-3` (24px)
- 버튼 그룹 간격: `gap-2` (16px)

## Radius & Shadow

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `rounded-xs` | 4px | 작은 칩/배지 |
| `rounded-sm` | 8px | 기본 버튼/입력 |
| `rounded-md` | 12px | 카드/패널 |
| `rounded-lg` | 16px | 큰 카드/모달 |
| `rounded-xl` | 20px | 히어로/특수 섹션 |
| `rounded-full` | 9999px | 원형/아바타 |

| 그림자 | 값 | 용도 |
| --- | --- | --- |
| `shadow-sm` | 0 1px 2px | 얕은 경계 |
| `shadow-md` | 0 4px 12px | 기본 카드 |
| `shadow-lg` | 0 12px 28px | 모달/떠있는 UI |

## Z-Index

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `z-dropdown` | 40 | 드롭다운/메뉴 |
| `z-overlay` | 50 | 오버레이 |
| `z-modal` | 60 | 모달 |
| `z-toast` | 70 | 토스트 |
| `z-tooltip` | 80 | 툴팁 |

## Motion

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `duration-fast` | 150ms | 입력/버튼 호버 |
| `duration-normal` | 200ms | 기본 전환 |
| `duration-slow` | 300ms | 패널/모달 |
| `ease-out` | cubic-bezier(0.2, 0, 0, 1) | 등장/확장 |
| `ease-in-out` | cubic-bezier(0.4, 0, 0.2, 1) | 전환/스위치 |

## Layout & Breakpoints

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `max-w-content` | 1200px | 기본 콘텐츠 폭 |
| `max-w-reading` | 720px | 긴 텍스트/문서 |
| `max-w-narrow` | 560px | 폼/사이드 패널 |

| 브레이크포인트 | 값 | 설명 |
| --- | --- | --- |
| `sm` | 640px | 모바일 가로 |
| `md` | 768px | 태블릿 |
| `lg` | 1024px | 데스크탑 |
| `xl` | 1280px | 와이드 |
| `2xl` | 1536px | 대형 화면 |

- 기본 컨테이너: `mx-auto max-w-content px-4 sm:px-6 lg:px-8`

## 컴포넌트 기본 토큰

- Button: `rounded-sm`, `text-body`, `shadow-sm`
- Card: `rounded-md`, `shadow-md`
- Modal: `rounded-lg`, `shadow-lg`, `z-modal`
- Dropdown: `rounded-sm`, `shadow-md`, `z-dropdown`

## 상태 토큰 매핑

| 컴포넌트 | 기본 | Hover | Active | Disabled |
| --- | --- | --- | --- | --- |
| Button (primary) | `bg-primary-500 text-white` | `bg-primary-600` | `bg-primary-700` | `bg-primary-400/60 text-white/80` |
| Button (secondary) | `bg-secondary-500 text-white` | `bg-secondary-600` | `bg-secondary-700` | `bg-secondary-400/60 text-white/80` |
| Button (ghost) | `border-neutral-200 text-neutral-700` | `bg-neutral-100` | `bg-neutral-200` | `text-neutral-400 border-neutral-200` |
| Input | `border-neutral-200 text-neutral-900` | `border-neutral-300` | `border-primary-500` | `bg-neutral-100 text-neutral-400` |
| Toast (success) | `bg-success-500 text-white` | `bg-success-600` | - | - |
| Toast (error) | `bg-error-500 text-white` | `bg-error-600` | - | - |

| 컴포넌트 | Focus | Selected | Loading |
| --- | --- | --- | --- |
| Button | `focus-visible:ring-2 focus-visible:ring-primary-500/60` | - | `opacity-80 cursor-wait` |
| Input | `focus-visible:ring-2 focus-visible:ring-primary-500/40` | - | - |
| Tabs | - | `bg-neutral-900 text-white` | - |
| Dropdown Item | `bg-neutral-100` | `bg-neutral-200` | - |

| 컴포넌트 | Focus | Selected | Loading |
| --- | --- | --- | --- |
| Checkbox | `focus-visible:ring-2 focus-visible:ring-primary-500/60` | `bg-primary-500 border-primary-500` | - |
| Radio | `focus-visible:ring-2 focus-visible:ring-primary-500/60` | `border-primary-500` | - |
| Card | `focus-visible:ring-2 focus-visible:ring-primary-500/40` | `border-primary-500` | - |

## 색상 대비 가이드

- 본문 텍스트: `text-neutral-900` on `bg-white` 또는 `bg-neutral-50`
- 서브 텍스트: `text-neutral-600` on `bg-white`
- 비활성 텍스트: `text-neutral-400` on `bg-neutral-100`
- 강조 텍스트: `text-primary-600` on `bg-white`
- 배지/칩: `bg-primary-400/20 text-primary-700`
- 경고/에러: `bg-warning-400/20 text-warning-700`, `bg-error-400/20 text-error-700`

## 링크 & 아이콘 상태

| 요소 | 기본 | Hover | Focus | Disabled |
| --- | --- | --- | --- | --- |
| Link (default) | `text-primary-600` | `text-primary-700 underline` | `focus-visible:ring-2 focus-visible:ring-primary-500/60` | `text-neutral-400` |
| Link (muted) | `text-neutral-600` | `text-neutral-700 underline` | `focus-visible:ring-2 focus-visible:ring-neutral-300` | `text-neutral-400` |
| Icon button | `text-neutral-500` | `text-neutral-700 bg-neutral-100` | `focus-visible:ring-2 focus-visible:ring-primary-500/60` | `text-neutral-300` |

## 폼 상태 확장

- 성공 입력: `border-success-500 text-neutral-900`, 도움말 `text-success-600`
- 경고 입력: `border-warning-500 text-neutral-900`, 도움말 `text-warning-600`
- 에러 입력: `border-error-500 text-neutral-900`, 도움말 `text-error-600`

## 입력/셀렉트/텍스트에어리어 상태

| 요소 | 기본 | Hover | Focus | Disabled |
| --- | --- | --- | --- | --- |
| Input | `border-neutral-200 bg-white` | `border-neutral-300` | `border-primary-500 ring-2 ring-primary-500/40` | `bg-neutral-100 text-neutral-400` |
| Select | `border-neutral-200 bg-white` | `border-neutral-300` | `border-primary-500 ring-2 ring-primary-500/40` | `bg-neutral-100 text-neutral-400` |
| Textarea | `border-neutral-200 bg-white` | `border-neutral-300` | `border-primary-500 ring-2 ring-primary-500/40` | `bg-neutral-100 text-neutral-400` |

| 상태 | Input | Select | Textarea |
| --- | --- | --- | --- |
| Success | `border-success-500` | `border-success-500` | `border-success-500` |
| Warning | `border-warning-500` | `border-warning-500` | `border-warning-500` |
| Error | `border-error-500` | `border-error-500` | `border-error-500` |

## 도움말/에러 메시지 톤

| 상태 | 텍스트 | 아이콘 | 배경 |
| --- | --- | --- | --- |
| Default | `text-neutral-500` | `text-neutral-400` | `bg-transparent` |
| Success | `text-success-600` | `text-success-500` | `bg-success-400/10` |
| Warning | `text-warning-600` | `text-warning-500` | `bg-warning-400/10` |
| Error | `text-error-600` | `text-error-500` | `bg-error-400/10` |

## 토스트/배너 메시지 톤

| 요소 | 텍스트 | 아이콘 | 배경 | 테두리 |
| --- | --- | --- | --- | --- |
| Toast (default) | `text-neutral-700` | `text-neutral-500` | `bg-white` | `border-neutral-200` |
| Toast (success) | `text-white` | `text-white` | `bg-success-500` | `border-success-600` |
| Toast (error) | `text-white` | `text-white` | `bg-error-500` | `border-error-600` |
| Toast (warning) | `text-white` | `text-white` | `bg-warning-500` | `border-warning-600` |
| Toast (info) | `text-white` | `text-white` | `bg-info-500` | `border-info-600` |
| Banner (default) | `text-neutral-700` | `text-neutral-500` | `bg-neutral-50` | `border-neutral-200` |
| Banner (primary) | `text-primary-700` | `text-primary-500` | `bg-primary-400/10` | `border-primary-400/30` |

## 테이블 & 리스트 상태

| 요소 | 기본 | Hover | Selected | Disabled |
| --- | --- | --- | --- | --- |
| Table row | `bg-white` | `bg-neutral-50` | `bg-primary-400/10` | `bg-neutral-100 text-neutral-400` |
| Table header | `bg-neutral-50 text-neutral-600` | `bg-neutral-100` | - | - |
| List item | `bg-white` | `bg-neutral-50` | `bg-neutral-100` | `text-neutral-400` |

## 배지 상태 매핑

| 배지 | 기본 | Soft | Outline |
| --- | --- | --- | --- |
| Neutral | `bg-neutral-100 text-neutral-700` | `bg-neutral-100/70 text-neutral-600` | `border border-neutral-200 text-neutral-600` |
| Success | `bg-success-500 text-white` | `bg-success-400/20 text-success-700` | `border border-success-400 text-success-700` |
| Warning | `bg-warning-500 text-white` | `bg-warning-400/20 text-warning-700` | `border border-warning-400 text-warning-700` |
| Error | `bg-error-500 text-white` | `bg-error-400/20 text-error-700` | `border border-error-400 text-error-700` |
| Info | `bg-info-500 text-white` | `bg-info-400/20 text-info-700` | `border border-info-400 text-info-700` |

## 카드/모달/드로어 상태

| 컴포넌트 | 기본 | Hover | Active | Overlay |
| --- | --- | --- | --- | --- |
| Card | `bg-white border border-neutral-200` | `shadow-md` | `border-neutral-300` | - |
| Modal | `bg-white shadow-lg rounded-lg` | - | - | `bg-neutral-900/50` |
| Drawer | `bg-white shadow-lg rounded-lg` | - | - | `bg-neutral-900/40` |

## 알림/배너 상태

| 요소 | 기본 | Emphasis | Soft |
| --- | --- | --- | --- |
| Alert (info) | `bg-info-500 text-white` | `bg-info-600 text-white` | `bg-info-400/20 text-info-700` |
| Alert (success) | `bg-success-500 text-white` | `bg-success-600 text-white` | `bg-success-400/20 text-success-700` |
| Alert (warning) | `bg-warning-500 text-white` | `bg-warning-600 text-white` | `bg-warning-400/20 text-warning-700` |
| Alert (error) | `bg-error-500 text-white` | `bg-error-600 text-white` | `bg-error-400/20 text-error-700` |
| Banner | `bg-neutral-50 text-neutral-700` | `bg-neutral-100 text-neutral-900` | `bg-primary-400/10 text-primary-700` |

## 토글/스위치 상태

| 요소 | Off | Hover | On | Disabled |
| --- | --- | --- | --- | --- |
| Toggle | `bg-neutral-200` | `bg-neutral-300` | `bg-primary-500` | `bg-neutral-100` |
| Toggle thumb | `bg-white` | `bg-white` | `bg-white` | `bg-neutral-200` |

## 프로그레스/스피너/스켈레톤 상태

### ProgressBar (프로그레스바)

| 요소 | 기본 | 진행 | 완료 | 비활성 |
| --- | --- | --- | --- | --- |
| 배경 | `bg-neutral-200` | - | - | `bg-neutral-100` |
| 진행 바 (primary) | - | `bg-primary-500` | `bg-success-500` | `bg-neutral-300` |
| 진행 바 (success) | - | `bg-success-500` | `bg-success-600` | `bg-neutral-300` |
| 진행 바 (error) | - | `bg-error-500` | `bg-error-600` | `bg-neutral-300` |
| 진행 바 (warning) | - | `bg-warning-500` | `bg-warning-600` | `bg-neutral-300` |
| 진행 바 (info) | - | `bg-info-500` | `bg-info-600` | `bg-neutral-300` |
| 텍스트 | `text-neutral-600` | `text-neutral-700` | `text-success-700` | `text-neutral-400` |
| 높이 (sm) | `h-1` | - | - | - |
| 높이 (md) | `h-2` | - | - | - |
| 높이 (lg) | `h-3` | - | - | - |
| 반경 | `rounded-full` | - | - | - |

### Spinner (스피너)

| 요소 | 기본 | Success | Error | Warning | Info | 비활성 |
| --- | --- | --- | --- | --- | --- | --- |
| 색상 (primary) | `text-primary-500` | - | - | - | - | `text-neutral-300` |
| 색상 (success) | - | `text-success-500` | - | - | - | `text-neutral-300` |
| 색상 (error) | - | - | `text-error-500` | - | - | `text-neutral-300` |
| 색상 (warning) | - | - | - | `text-warning-500` | - | `text-neutral-300` |
| 색상 (info) | - | - | - | - | `text-info-500` | `text-neutral-300` |
| 크기 (sm) | `w-4 h-4` | - | - | - | - | - |
| 크기 (md) | `w-6 h-6` | - | - | - | - | - |
| 크기 (lg) | `w-8 h-8` | - | - | - | - | - |
| 애니메이션 | `animate-spin` | - | - | - | - | - |
| 라벨 | `text-neutral-600` | `text-success-600` | `text-error-600` | `text-warning-600` | `text-info-600` | `text-neutral-400` |

### Skeleton (스켈레톤)

| 요소 | 기본 | 연한 | 진한 | 텍스트 | 원형 |
| --- | --- | --- | --- | --- | --- |
| 배경 | `bg-neutral-200` | `bg-neutral-100` | `bg-neutral-300` | `bg-neutral-200` | `bg-neutral-200` |
| 애니메이션 | `animate-pulse` | `animate-pulse` | `animate-pulse` | `animate-pulse` | `animate-pulse` |
| 반경 (텍스트) | - | - | - | `rounded-sm` | - |
| 반경 (원형) | - | - | - | - | `rounded-full` |
| 높이 (텍스트) | - | - | - | `h-4` | - |
| 높이 (제목) | - | - | - | `h-6` | - |
| 높이 (본문) | - | - | - | `h-4` | - |
| 너비 (텍스트) | `w-full` | `w-full` | `w-full` | `w-full` | - |
| 너비 (원형) | - | - | - | - | `w-10 h-10` |
| 간격 (여러 줄) | - | - | - | `space-y-2` | - |

## 컴포넌트

- Shadcn UI: `src/components/ui`에 기본 컴포넌트 세트
- `Button`: primary / secondary / ghost
- `Button` 상태: `isLoading`, `disabled`
- `Button` 옵션: `icon`, `iconPosition`, `fullWidth`
- `Badge`: neutral / success / warning / error / info (+ size)
- `Badge` 스타일: `solid`, `soft`, `outline`
- `Banner`
- `BannerAction`
- `DismissibleBanner`
- `Breadcrumbs`
- `Card` (actions / footer 슬롯)
- `InputField`, `TextareaField`, `SelectField`
- `Toggle`
- `FormField`
- `Alert` (size, icon)
- `Icon`
- `Text` (tone, weight)
- `Modal`
- `Toast`
- `Tabs`
- `Drawer`
- `Overlay`
- `DataTable`
- `EmptyState`
- `List`
- `CardList`
- `Pagination`
- `Stepper`
- `FileUpload`
- `Dropdown`
- `DatePicker`
- `Avatar`
- `ProfileCard`
- `SearchInput`
- `FilterChips`
- `TagInput`
- `CheckboxGroup`
- `RadioGroup`
- `RangeSlider`
- `ProgressBar`
- `Topbar`
- `Sidebar`
- `ValidationMessage`
- `SegmentedControl`
- `ThemeToggle`
- `TwoColumnLayout`
- `ThreeColumnLayout`
- `CardGrid`
- `MetricCard`
- `BarChart`
- `LineChart`
- `NotificationList`
- `Timeline`
- `AvatarGroup`
- `Spinner`
- `Skeleton`
- `Accordion`
- `Tooltip`
- `DropdownMenu`
- Layouts: `AuthLayout`, `DashboardLayout`, `LandingLayout`

## Shadcn UI 기본 컴포넌트

- `ui/button`: primary / secondary / ghost / danger
- `ui/input`: 텍스트 입력, `ui/textarea`, `ui/input`의 `FileInput`
- `ui/card`: 기본 카드 + `hoverable`
- `ui/dialog`: `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`
- `ui/toast`: `toast` 훅(`use-toast`) + `Toaster`
- `ui/spinner`: 사이즈/라벨 지원
- `ui/progress`: `value` 기반 진행바
- `ui/tabs`: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `ui/dropdown-menu`: `DropdownMenu` 구성요소
- `ui/avatar`: `Avatar`, `AvatarImage`, `AvatarFallback`

## Button 가이드

| 사이즈 | 패딩 | 폰트 |
| --- | --- | --- |
| `sm` | 12x4 | 14px |
| `md` | 16x8 | 14px |
| `lg` | 20x12 | 16px |

| 상태 | 설명 |
| --- | --- |
| `hover` | 컬러 농도 증가 |
| `active` | 살짝 눌림(활성 강조) |
| `disabled` | opacity 낮춤, 클릭 불가 |

| Variant | 기본 | Hover | Active |
| --- | --- | --- | --- |
| `primary` | Primary 500 | Primary 700 | Primary 700 |
| `secondary` | Secondary 500 | Secondary 700 | Secondary 700 |
| `ghost` | Border Neutral | Neutral 100 | Neutral 200 |

- 로딩 스피너: `primary/secondary`는 white, `ghost`는 neutral 계열
- 포커스 링: `focus-visible:ring-2` + `primary` 컬러

## DataTable 가이드

- `sortable`: 컬럼 헤더 클릭 정렬
- `emptyMessage`: 빈 상태 텍스트
- `selectable`: 행 체크박스 선택
- `onSelectionChange`: 선택 목록 변경 콜백
- `renderRowActions`: 행 액션 슬롯
- `stickyHeader`: 스크롤 시 헤더 고정
- `maxHeightClass`: 스크롤 높이 클래스
- `onRowClick`: 행 클릭 처리
- 다중 선택 바: 선택 개수 표시 + 일괄 액션
- 검색/필터 툴바: `SearchInput` + `FilterChips` 조합
- 컬럼 너비: `widthClass`로 Tailwind 폭 지정
- 컬럼 정렬: `align` (`left`, `center`, `right`)
- 컬럼 숨김: `hiddenColumns`로 key 제어
- 컬럼 순서: `columnOrder`로 key 배열 지정
- 정렬 비활성: `sortable: false` 시 비활성 표시
- 행 액션 hover: `showActionsOnHover`로 표시 제어
- 빈 상태 슬롯: `emptySlot`으로 커스텀 내용 제공
- 행 밀도: `rowDensity` (`comfortable`, `compact`)
- 컬럼 고정: `pin` (`left`, `right`)
- 정렬 접근성: `aria-sort` 제공 + 전체 클릭 영역
- 컬럼 리사이즈: `resizable`, `widthPx`, `minWidthPx`, `maxWidthPx`
- 리사이즈 힌트: 핸들 hover 시 툴팁 표시
- 리사이즈 저장: `persistKey`로 로컬스토리지 유지
- 리사이즈 초기화: `resetKey` 변경 시 폭 리셋
- 리사이즈 키보드: 핸들에 포커스 후 ←/→ 조절
- 자동 맞춤: `autoFitOnDoubleClick`로 더블클릭 자동 폭
- 자동 맞춤 리셋: `autoFitResetOnDoubleClick` 활성화 시 더블클릭으로 초기 너비 복원/자동맞춤 토글
- 자동 맞춤 안내: `autoFitAnnounce`
- 리사이즈 단축키 안내: 핸들 툴팁/스크린리더 안내
- 리사이즈 핸들 포커스: `focus-visible` 링 적용
- 리사이즈 경계 표시: 최소/최대 폭 시각 강조

## Toast 가이드

- 스택 관리: 배열 상태로 쌓고 `onClose`로 제거
- `autoDismissMs`: 자동 종료 타이머
- `ToastStack`: 위치 옵션 `top-left`, `top-right`, `bottom-left`, `bottom-right`
- `toast-enter`: 등장 애니메이션 클래스
- 최대 스택 개수: `maxToastCount`로 제한
- 아이콘 표시: `showIcon`, `icon`으로 커스텀
- 닫기 버튼: `aria-label` 제공 권장
- 진행 표시: `showProgress` + `autoDismissMs`
- 진행 색상: variant 색상과 연동
- 일시정지: `pauseOnHover`로 hover 시 타이머 정지
- 애니메이션 방향: `animationFrom` (`top`, `bottom`)
- `closeOnEsc`: ESC 키로 닫기 (onClose 필요)
- 액션 슬롯: `actionSlot`으로 보조 버튼 배치
- 액션 버튼: `actionLabel` + `onAction` (variant 테마 연동)
- 포커스/안내: `focusOnMount`, `announcement`
- 액션 정렬: `actionAlign` (`left`, `right`)
- 일시정지 타임스탬프: `showPausedAt`
- 타임스탬프 포맷: `pausedAtFormat` (`time`, `datetime`)
- 타임스탬프 포맷터: `pausedAtFormatter`
- 강제 일시정지: `forcePause`
- 남은 시간 배지: `showRemainingBadge`, `remainingBadgeFormat`

## 접근성 가이드

- 버튼: 아이콘만 있는 경우 `aria-label` 제공
- 입력: `label` 또는 `aria-label` 필수
- 에러 상태: `aria-invalid="true"` 사용 권장
- 도움말/에러: `aria-describedby`로 메시지 연결
- 키보드: `Tab` 이동, `Enter/Space` 활성화, `Esc` 닫기 권장
- 토스트: `role`/`aria-live`로 상태 전달
- 입력: `name` 속성으로 폼 데이터 매핑 권장
- 입력: `autoComplete`로 브라우저 자동완성 지원
- 필수 표시: `requiredBadge`로 배지 표시
- 서브 라벨: `subLabel`로 보조 설명 제공
- 도움말 슬롯: `helperSlot`로 액션/링크 배치
- 도움말 아이콘: `helperIconSlot`
- 도움말 아이콘 크기: `helperIconSize`
- 도움말 아이콘 클릭: `helperIconClickable`, `onHelperIconClick`, `helperIconAriaLabel`
- 도움말 아이콘 색상: `helperIconColor`
- 도움말 아이콘 툴팁: `helperIconTooltip`
- 도움말 아이콘 포커스: 키보드 `focus-visible` 링 적용
- 상태 아이콘: `statusIcon`으로 커스텀 표시
- 프리픽스/서픽스: `prefixSlot`, `suffixSlot`로 텍스트/아이콘 추가
- 액션 슬롯: `actionSlot`로 입력 우측 버튼 배치
- 입력 포맷팅: `value`/`onChange`로 제어 입력 지원
- 글자 수: `maxLength` + `showCount`로 카운트 표시
- 자동 클리어: `clearable` + `onClear`
- 유효성 애니메이션: `validation-enter-success/warning/error`
- 도움말 슬롯 정렬: `helperSlotAlign` (`left`, `right`)
- 도움말 줄바꿈: `helperWrap` (`wrap`, `nowrap`)
- 접두/접미 클릭: `prefixClickable`, `suffixClickable`, `onPrefixClick`, `onSuffixClick`
- 접두/접미 비활성: `prefixDisabled`, `suffixDisabled`
- 접두/접미 hover: `prefixHoverable`, `suffixHoverable`

## 유틸리티 가이드

- 배경: `bg-neutral-50` 기본, 카드 `bg-white`
- 텍스트: 제목 `text-neutral-900`, 본문 `text-neutral-600`
- 테두리: `border-neutral-200`

## 폼 상태

- 헬퍼 텍스트: `text-neutral-500`
- 에러 상태: `text-error-500`, `border-error-500`
- 비활성 상태: `bg-neutral-100`, `text-neutral-400`, `cursor-not-allowed`
- 필수 입력 표시: `*` + `text-error-500`
- 다크 비활성: `dark:bg-neutral-800`, `dark:text-neutral-500`, `dark:border-neutral-700`
