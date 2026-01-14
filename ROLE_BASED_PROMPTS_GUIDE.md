# 역할 분리형 프롬프트 마스터 세트 가이드

## 📋 개요

5가지 전문 AI 역할이 각자의 영역에서만 작동하도록 설계된 프롬프트 시스템입니다.

## 🎭 역할별 상세 설명

### 1. 서비스 기획자 AI (`service-planner`)

**역할**: 요구사항 분석, 기능 명세, 사용자 스토리 작성

**출력 형식**: JSON

**사용 예시**:
```typescript
const response = await fetch('/api/ai/role-based', {
  method: 'POST',
  body: JSON.stringify({
    role: 'service-planner',
    userPrompt: '온라인 쇼핑몰을 만들고 싶어요. 상품 등록, 장바구니, 결제 기능이 필요해요.'
  })
});
```

**출력 예시**:
```json
{
  "projectName": "온라인 쇼핑몰",
  "coreFeatures": [
    {
      "id": "product-management",
      "name": "상품 관리",
      "priority": "high",
      "userStories": [...]
    }
  ],
  "userFlows": [...]
}
```

**금지 사항**:
- ❌ 코드 작성
- ❌ 디자인 제안
- ❌ 기술 스택 선택

---

### 2. 웹 개발자 AI (`web-developer`)

**역할**: HTML/CSS/JavaScript 코드 생성

**출력 형식**: Markdown (코드 블록)

**사용 예시**:
```typescript
const response = await fetch('/api/ai/role-based', {
  method: 'POST',
  body: JSON.stringify({
    role: 'web-developer',
    userPrompt: '상품 목록 페이지를 만들어주세요. 3열 그리드 레이아웃, 필터링 기능',
    context: JSON.stringify({
      design: { colors: { primary: "#3b82f6" } }
    })
  })
});
```

**출력 예시**:
```markdown
\`\`\`html
<!-- HTML 코드 -->
\`\`\`

\`\`\`css
/* CSS 코드 */
\`\`\`

\`\`\`javascript
// JavaScript 코드
\`\`\`
```

**금지 사항**:
- ❌ 기획 제안
- ❌ 디자인 제안
- ❌ 앱 코드 작성

---

### 3. 앱 개발자 AI (`app-developer`)

**역할**: React Native / Flutter 코드 생성

**출력 형식**: Markdown (코드 블록)

**사용 예시**:
```typescript
const response = await fetch('/api/ai/role-based', {
  method: 'POST',
  body: JSON.stringify({
    role: 'app-developer',
    userPrompt: '상품 목록 화면을 만들어주세요. 무한 스크롤, 필터링',
    context: JSON.stringify({
      platform: 'React Native'
    })
  })
});
```

**출력 예시**:
```markdown
\`\`\`javascript
// React Native 코드
import React from 'react';
// ...
\`\`\`
```

**금지 사항**:
- ❌ 웹 코드 작성
- ❌ 서버 코드 작성
- ❌ 기획/디자인 제안

---

### 4. UI/UX 디자이너 AI (`uiux-designer`)

**역할**: 디자인 시스템, 레이아웃, 색상, 타이포그래피 정의

**출력 형식**: JSON

**사용 예시**:
```typescript
const response = await fetch('/api/ai/role-based', {
  method: 'POST',
  body: JSON.stringify({
    role: 'uiux-designer',
    userPrompt: '모던하고 깔끔한 쇼핑몰 디자인. 파란색과 보라색을 메인 컬러로'
  })
});
```

**출력 예시**:
```json
{
  "designSystem": {
    "colors": {
      "primary": "#3b82f6",
      "secondary": "#8b5cf6"
    },
    "typography": {...},
    "spacing": {...}
  },
  "components": [...],
  "responsive": {...}
}
```

**금지 사항**:
- ❌ 코드 작성
- ❌ 기획 제안
- ❌ 기능 명세 작성

---

### 5. 에디터 도우미 AI (`editor-assistant`)

**역할**: 코드 분석, 버그 찾기, 개선 제안 (Diff 형식)

**출력 형식**: JSON

**사용 예시**:
```typescript
const response = await fetch('/api/ai/role-based', {
  method: 'POST',
  body: JSON.stringify({
    role: 'editor-assistant',
    userPrompt: '다음 코드를 분석해주세요:',
    context: '```javascript\nfunction calculateTotal(items) {...}\n```'
  })
});
```

**출력 예시**:
```json
{
  "analysis": {
    "overall": "전체 평가",
    "score": 85,
    "grade": "A"
  },
  "issues": [
    {
      "type": "bug",
      "severity": "high",
      "line": 10,
      "message": "문제 설명",
      "diff": "```diff\n- 기존 코드\n+ 수정된 코드\n```"
    }
  ],
  "suggestions": [...],
  "explanation": "코드 전체 설명"
}
```

**금지 사항**:
- ❌ 전체 코드 재작성
- ❌ Diff 없이 제안
- ❌ 기획/디자인 제안

---

## 🔄 워크플로우 예시

### 시나리오: 쇼핑몰 만들기

1. **서비스 기획자** → 요구사항 분석
   ```json
   {
     "coreFeatures": ["상품 관리", "장바구니", "결제"]
   }
   ```

2. **UI/UX 디자이너** → 디자인 시스템 설계
   ```json
   {
     "designSystem": { "colors": {...}, "components": [...] }
   }
   ```

3. **웹 개발자** → 웹 코드 생성
   ```html
   <!-- HTML/CSS/JS 코드 -->
   ```

4. **에디터 도우미** → 코드 리뷰 및 개선
   ```json
   {
     "issues": [...],
     "suggestions": [...]
   }
   ```

---

## 🚀 API 사용법

### 기본 사용

```typescript
const response = await fetch('/api/ai/role-based', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    role: 'web-developer',  // 또는 'service-planner', 'app-developer', etc.
    userPrompt: '사용자 요청 내용',
    context: '추가 컨텍스트 (선택사항)'
  })
});

const data = await response.json();
console.log(data.content);  // AI 응답
```

### 사용 가능한 역할 조회

```typescript
const response = await fetch('/api/ai/role-based');
const data = await response.json();
console.log(data.roles);  // ['service-planner', 'web-developer', ...]
```

---

## ✅ 검증 체크리스트

각 역할이 올바르게 작동하는지 확인:

- [ ] 서비스 기획자는 JSON만 출력하고 코드를 작성하지 않음
- [ ] 웹 개발자는 HTML/CSS/JS만 작성하고 기획을 하지 않음
- [ ] 앱 개발자는 React Native/Flutter만 작성하고 웹 코드를 작성하지 않음
- [ ] UI/UX 디자이너는 JSON 디자인 명세만 작성하고 코드를 작성하지 않음
- [ ] 에디터 도우미는 Diff 형식으로만 제안하고 전체 재작성을 하지 않음

---

## 📝 프롬프트 커스터마이징

`lib/prompts/role-based-prompts.ts` 파일에서 각 역할의 System Prompt를 수정할 수 있습니다.

**주의**: System Prompt를 수정할 때는 역할의 핵심 규칙을 유지해야 합니다.

---

## 🎯 실제 사용 예시

### 예시 1: 전체 워크플로우

```typescript
// 1. 기획
const plan = await callRoleBasedAI('service-planner', '쇼핑몰 만들기');

// 2. 디자인
const design = await callRoleBasedAI('uiux-designer', '모던한 디자인', plan);

// 3. 개발
const code = await callRoleBasedAI('web-developer', '상품 목록 페이지', { plan, design });

// 4. 리뷰
const review = await callRoleBasedAI('editor-assistant', '코드 분석', code);
```

### 예시 2: 에디터에서 사용

```typescript
// 사용자가 코드를 작성하면 자동으로 분석
const suggestions = await callRoleBasedAI(
  'editor-assistant',
  '이 코드를 분석해주세요',
  currentCode
);

// Diff 형식 제안을 UI에 표시
displaySuggestions(suggestions.issues);
```

---

## 🔒 역할 분리 보장

각 역할은 다음을 보장합니다:

1. **명확한 경계**: 다른 역할의 영역을 침범하지 않음
2. **고정된 출력**: 항상 동일한 형식으로 출력
3. **일관된 행동**: System Prompt에 정의된 규칙을 항상 따름

---

**이 프롬프트 세트는 실제 서비스에서 바로 사용할 수 있도록 설계되었습니다!** 🚀
