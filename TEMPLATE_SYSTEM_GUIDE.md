# AI 협업형 템플릿 시스템 가이드

## 📋 개요

웹/앱 공용, 블록 기반, AI 생성 가능한 템플릿 시스템입니다.

## 🏗️ 시스템 구조

### 1. 템플릿 JSON 스키마

```typescript
interface Template {
  metadata: {
    id: string;              // 고유 ID
    version: string;          // 버전
    createdAt: number;        // 생성 시간
    tags: string[];           // 태그
    description: string;      // 설명
  };
  type: 'web' | 'app' | 'hybrid';
  category: 'landing' | 'blog' | 'portfolio' | ...;
  blocks: BlockData[];       // 블록 배열
  editableFields: EditableField[];  // 편집 가능 필드
  previewInfo: PreviewInfo;   // 미리보기 정보
  styles?: {                  // 전역 스타일
    global?: {...};
    variables?: {...};
  };
}
```

### 2. 블록 구조

```typescript
interface BlockData {
  id: string;                 // 고유 ID
  type: BlockType;            // 블록 타입
  content: any;               // 블록 내용
  style: BlockStyle;          // 스타일
  children?: BlockData[];     // 자식 블록
}
```

### 3. 편집 가능 필드

```typescript
interface EditableField {
  id: string;
  blockId: string;
  path: string;               // "content.text" 또는 "style.backgroundColor"
  type: 'text' | 'color' | 'image' | ...;
  label: string;
  defaultValue?: any;
}
```

## 🎨 예시 템플릿 3개

### 1. 랜딩 페이지 (웹)
- **위치**: `lib/templates/template-examples.ts`
- **ID**: `template-web-landing-001`
- **블록**: navbar, hero, features, footer
- **특징**: 히어로 섹션, CTA 버튼, 카드 그리드

### 2. 블로그 (웹)
- **ID**: `template-web-blog-001`
- **블록**: header, main content, sidebar, article cards
- **특징**: 반응형 레이아웃, 사이드바 위젯

### 3. 모바일 앱 (앱)
- **ID**: `template-app-mobile-001`
- **블록**: app header, stats cards, list, bottom nav
- **특징**: 모바일 최적화, 고정 헤더/푸터

## 🖼️ 미리보기 생성 방식

### 렌더링 프로세스

```typescript
import { renderTemplateToHTML } from '@/lib/templates/template-renderer';

// 템플릿을 HTML로 변환
const html = renderTemplateToHTML(template);

// iframe에 표시
<iframe srcDoc={html} />
```

### 렌더링 규칙

1. **블록 순회**: 루트 블록부터 재귀적으로 렌더링
2. **타입별 변환**: 각 블록 타입에 맞는 HTML 태그 생성
3. **스타일 적용**: CSS 인라인 스타일로 변환
4. **반응형**: 미디어 쿼리 추가 (선택사항)

### 지원 블록 타입

- `text` → `<div>`
- `heading` → `<h1>` ~ `<h6>`
- `image` → `<img>`
- `button` → `<a>` 또는 `<button>`
- `container` → `<div>`
- `card` → `<div>` (카드 스타일)
- `hero` → `<section>`
- `navbar` → `<nav>`
- `footer` → `<footer>`
- `list` → `<ul>` / `<ol>`
- `sidebar` → `<aside>`

## 🔗 에디터 연동 방법

### 1. 템플릿 로드

```typescript
import { useEditorStore } from '@/store/editorStore';
import { templateStorage } from '@/lib/templates/template-storage';

// 템플릿 가져오기
const template = templateStorage.get('template-web-landing-001');

// 에디터에 로드
useEditorStore.getState().loadTemplate(template.metadata.id);
```

### 2. 템플릿을 블록으로 변환

```typescript
// store/editorStore.ts의 loadTemplate 함수에서
function templateToBlocks(template: Template): Block[] {
  return template.blocks.map(blockData => ({
    id: blockData.id,
    type: blockData.type,
    content: JSON.stringify(blockData.content),
    styles: blockData.style,
    position: { x: 0, y: 0 }, // 기본 위치
    size: { width: 100, height: 100 }, // 기본 크기
  }));
}
```

### 3. 편집 가능 필드 연동

```typescript
// 에디터에서 편집 가능 필드 표시
template.editableFields.forEach(field => {
  const block = blocks.find(b => b.id === field.blockId);
  if (block) {
    // 필드 편집 UI 표시
    showEditableField(block, field);
  }
});
```

### 4. 실시간 미리보기

```typescript
// 블록 변경 시 템플릿으로 다시 변환하여 미리보기
const updatedTemplate = blocksToTemplate(blocks);
const previewHtml = renderTemplateToHTML(updatedTemplate);
setPreviewHtml(previewHtml);
```

## 🤖 AI 템플릿 생성

### AI 프롬프트 구조

```typescript
import { buildAIPrompt } from '@/lib/templates/template-ai-prompt';

const options: TemplateGenerationOptions = {
  type: 'web',
  category: 'landing',
  description: '모던한 랜딩 페이지',
  style: {
    colorScheme: ['#3b82f6', '#8b5cf6'],
    layout: 'centered',
  },
  features: ['hero', 'features', 'testimonials'],
};

const { systemPrompt, userPrompt } = buildAIPrompt(options);
```

### API 호출

```typescript
const response = await fetch('/api/templates/generate', {
  method: 'POST',
  body: JSON.stringify({
    type: 'web',
    category: 'landing',
    description: '모던한 랜딩 페이지를 만들어주세요',
    style: {
      colorScheme: ['#3b82f6', '#8b5cf6'],
    },
  }),
});

const { template, id } = await response.json();
```

### AI 출력 형식

AI는 반드시 다음 JSON 구조를 따라야 합니다:

```json
{
  "metadata": {
    "id": "template-web-landing-{unique-id}",
    "version": "1.0.0",
    "tags": ["landing", "modern"],
    "description": "..."
  },
  "type": "web",
  "category": "landing",
  "blocks": [...],
  "editableFields": [...],
  "previewInfo": {...}
}
```

## 📊 확장성 전략 (1,000개 이상)

### 1. 인덱싱 시스템

- **카테고리 인덱스**: 빠른 카테고리별 조회
- **타입 인덱스**: 웹/앱 분리
- **태그 인덱스**: 태그 기반 검색
- **검색 인덱스**: 키워드 검색

### 2. 페이지네이션

```typescript
const templates = templateStorage.search({
  category: 'landing',
  limit: 20,
  offset: 0,
});
```

### 3. localStorage 백업

- 인메모리 저장소 + localStorage 백업
- 서버 재시작 시에도 데이터 유지

### 4. 중복 방지

- **고유 ID 생성**: 타임스탬프 + 랜덤 문자열
- **ID 검증**: 추가 전 중복 확인
- **블록 ID 검증**: 템플릿 내 블록 ID 중복 방지

## 🔍 템플릿 검색/필터

```typescript
// 타입별
const webTemplates = templateStorage.search({ type: 'web' });

// 카테고리별
const landingTemplates = templateStorage.search({ category: 'landing' });

// 태그별
const modernTemplates = templateStorage.search({ tags: ['modern'] });

// 검색어
const searchResults = templateStorage.search({ search: 'landing' });

// 복합 필터
const results = templateStorage.search({
  type: 'web',
  category: 'landing',
  tags: ['modern', 'responsive'],
  search: 'hero',
  limit: 20,
  offset: 0,
});
```

## 🚀 사용 예시

### 1. 템플릿 생성 (AI)

```typescript
const response = await fetch('/api/templates/generate', {
  method: 'POST',
  body: JSON.stringify({
    type: 'web',
    category: 'blog',
    description: '미니멀한 블로그 템플릿',
  }),
});
```

### 2. 템플릿 조회

```typescript
// 전체 목록
const response = await fetch('/api/templates');
const { templates } = await response.json();

// 특정 템플릿
const response = await fetch('/api/templates?id=template-web-landing-001');
const { template } = await response.json();
```

### 3. 에디터에 로드

```typescript
import { useEditorStore } from '@/store/editorStore';

// 템플릿 ID로 로드
useEditorStore.getState().loadTemplate('template-web-landing-001');
```

### 4. 미리보기 생성

```typescript
import { renderTemplateToHTML } from '@/lib/templates/template-renderer';

const html = renderTemplateToHTML(template);
// iframe에 표시
```

## ✅ 검증 체크리스트

- [x] JSON 스키마 정의
- [x] 예시 템플릿 3개
- [x] 미리보기 렌더러
- [x] 에디터 연동
- [x] AI 프롬프트
- [x] 저장소 시스템
- [x] 중복 방지
- [x] 확장 가능한 구조

---

**이제 1,000개 이상의 템플릿을 관리할 수 있는 완전한 시스템이 준비되었습니다!** 🚀
