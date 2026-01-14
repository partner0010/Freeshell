# AI 협업형 에디터 구현 가이드

## 🎯 전체 시스템 구조

### 1. 상태 관리 (Zustand)
- **위치**: `store/editorStore.ts`
- **역할**: 모든 에디터 상태를 중앙 관리
- **주요 상태**:
  - `blocks`: 블록 배열
  - `history`: 실행 취소/복구 히스토리
  - `aiSuggestions`: AI 제안 목록
  - `previewHtml`: 미리보기 HTML

### 2. 메인 컴포넌트
- **위치**: `components/CollaborativeEditor/CollaborativeEditor.tsx`
- **역할**: 전체 에디터 레이아웃 관리

### 3. 블록 시스템
- **위치**: `components/blocks/Block.tsx`
- **역할**: 개별 블록 렌더링 및 편집

### 4. AI 도우미
- **위치**: `components/CollaborativeEditor/AIAssistantPanel.tsx`
- **역할**: AI 분석 결과 표시 및 제안 적용

## 🔄 주요 워크플로우

### 워크플로우 1: 템플릿 로드
```
1. 사용자가 템플릿 선택
2. loadTemplate(templateId) 호출
3. 템플릿 API에서 템플릿 데이터 가져오기
4. 템플릿을 블록으로 변환
5. blocks 상태 업데이트
6. 미리보기 자동 업데이트
```

### 워크플로우 2: 블록 편집
```
1. 사용자가 블록 선택
2. 블록 내용 수정
3. updateBlock() 호출
4. 상태 업데이트
5. 히스토리 저장
6. 미리보기 업데이트
7. AI 재분석 (디바운스 1초)
```

### 워크플로우 3: AI 제안 적용
```
1. 사용자가 블록 선택
2. AI 자동 분석 요청
3. /api/ai/role-based 호출 (editor-assistant)
4. Diff 형식 제안 받기
5. AI 도우미 패널에 표시
6. 사용자가 "적용" 클릭
7. applyAISuggestion() 호출
8. Diff 기반 코드 수정
9. 히스토리 저장
10. 미리보기 업데이트
```

## 📝 구현 단계

### Phase 1: 기본 구조 (완료)
- ✅ Zustand 스토어 생성
- ✅ 기본 컴포넌트 구조
- ✅ 블록 시스템

### Phase 2: 블록 편집 (진행 중)
- ✅ 블록 추가/수정/삭제
- ✅ 드래그 앤 드롭
- ⏳ 리사이즈 핸들

### Phase 3: AI 통합 (완료)
- ✅ AI 분석 요청
- ✅ 제안 표시
- ✅ Diff 적용

### Phase 4: 미리보기 (완료)
- ✅ 실시간 미리보기
- ✅ 반응형 미리보기

### Phase 5: 히스토리 (완료)
- ✅ 실행 취소/복구
- ✅ 히스토리 저장

## 🚀 사용 방법

### 1. 에디터 페이지 생성

```typescript
// app/editor/collaborative/page.tsx
import CollaborativeEditor from '@/components/CollaborativeEditor/CollaborativeEditor';

export default function CollaborativeEditorPage() {
  return <CollaborativeEditor />;
}
```

### 2. 상태 사용 예시

```typescript
import { useEditorStore } from '@/store/editorStore';

function MyComponent() {
  const { blocks, addBlock, selectedBlockId } = useEditorStore();
  
  // 블록 추가
  const handleAdd = () => {
    addBlock({
      id: `block-${Date.now()}`,
      type: 'text',
      content: '새 텍스트',
      styles: {},
      position: { x: 100, y: 100 },
      size: { width: 200, height: 100 },
    });
  };
  
  return <button onClick={handleAdd}>블록 추가</button>;
}
```

## 🔧 커스터마이징

### 블록 타입 추가

```typescript
// store/editorStore.ts의 Block 인터페이스에 추가
type: 'text' | 'image' | 'code' | 'container' | 'custom' | 'video'; // video 추가

// components/blocks/Block.tsx에 렌더링 로직 추가
{block.type === 'video' && (
  <video src={block.content} controls />
)}
```

### AI 분석 커스터마이징

```typescript
// store/editorStore.ts의 requestAIAnalysis 수정
const response = await fetch('/api/ai/role-based', {
  method: 'POST',
  body: JSON.stringify({
    role: 'editor-assistant',
    userPrompt: '커스텀 프롬프트', // 여기 수정
    context: `...`,
  }),
});
```

## 📊 성능 최적화

### 1. 디바운스
- 블록 수정 시 AI 재분석은 1초 디바운스 적용

### 2. 메모이제이션
- 블록 렌더링 시 React.memo 사용

### 3. 가상화
- 많은 블록이 있을 때 react-window 사용 고려

## 🐛 문제 해결

### 블록이 보이지 않을 때
- `position` 좌표 확인
- `z-index` 확인

### AI 분석이 작동하지 않을 때
- `/api/ai/role-based` 엔드포인트 확인
- 브라우저 콘솔 에러 확인

### 미리보기가 업데이트되지 않을 때
- `updatePreview()` 호출 확인
- `previewHtml` 상태 확인

---

**이제 실제로 구현할 수 있는 완전한 에디터 시스템이 준비되었습니다!** 🚀
