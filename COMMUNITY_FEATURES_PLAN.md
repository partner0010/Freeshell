# 커뮤니티 기능 기획 문서

## 조사 결과 요약

온라인 커뮤니티 플랫폼 조사 결과, 성공적인 AI/기술 커뮤니티들이 공통적으로 제공하는 핵심 기능들:

### 주요 커뮤니티 플랫폼 분석

1. **Stack Overflow 스타일 (Q&A 중심)**
   - 질문과 답변 시스템
   - 투표 시스템 (좋아요/싫어요)
   - 태그 기반 분류
   - 답변 채택 기능
   - 리putation 시스템

2. **Reddit 스타일 (포럼 중심)**
   - 주제별 서브레딧 (게시판)
   - 실시간 업데이트
   - 댓글 트레드 (중첩 댓글)
   - 추천/비추천 시스템

3. **Discord/Slack 스타일 (채팅 중심)**
   - 실시간 채팅
   - 채널 기반 분류
   - 다이렉트 메시지
   - 파일 공유

4. **GitHub Discussions 스타일 (토론 중심)**
   - 카테고리별 토론
   - 질문/아이디어/일반 토론 구분
   - 마크다운 지원
   - 이슈와 연동

## 제안하는 메뉴 구성

### 1. 커뮤니티 메인 (`/community`)
- 최신 게시글 피드
- 인기 게시글
- 추천 게시글
- 실시간 활동 요약

### 2. 질문과 답변 (`/community/qna`)
- **목적**: AI 솔루션 사용 중 발생하는 질문과 답변
- **특징**:
  - Stack Overflow 스타일 Q&A
  - 태그 시스템 (AI, 검색, 번역, 이미지 등)
  - 답변 채택 기능
  - 점수 시스템 (리퓨테이션)
  - 검색 기능

### 3. 게시판 (`/community/forum`)
- **카테고리**:
  - 📢 공지사항
  - 💡 아이디어 및 제안
  - 🐛 버그 리포트
  - 📚 사용 가이드 및 튜토리얼
  - 🎨 프로젝트 공유
  - 💬 자유 게시판
- **특징**:
  - 카테고리별 게시판
  - 댓글 및 좋아요 기능
  - 이미지/코드 첨부 지원

### 4. 실시간 채팅 (`/community/chat`)
- **채널 구성**:
  - # 일반: 전체 공개 채팅
  - # AI-검색: AI 검색 관련 토론
  - # AI-번역: 번역 기능 토론
  - # 이미지-검색: 이미지 검색 토론
  - # 질문-답변: 빠른 Q&A
  - # 프로젝트-공유: 프로젝트 소개
- **특징**:
  - 실시간 메시지
  - 이모지 지원
  - 파일 공유
  - 멘션 기능 (@사용자)

### 5. 프로젝트 갤러리 (`/community/projects`)
- 사용자가 만든 프로젝트 공유
- 이미지, 링크, 설명 포함
- 좋아요 및 댓글
- 필터링 (인기, 최신, 태그별)

### 6. 튜토리얼 (`/community/tutorials`)
- 사용자 제작 튜토리얼
- 단계별 가이드
- 댓글 및 질문
- 평가 시스템 (별점)

## 기술 스택 제안

### 백엔드
- **API Routes**: Next.js API Routes
- **실시간**: WebSocket 또는 Server-Sent Events (SSE)
- **데이터 저장**: 로컬 스토리지 + 서버 (나중에 DB 연동)

### 프론트엔드
- **상태 관리**: Zustand (이미 사용 중)
- **실시간 업데이트**: React Query 또는 SWR
- **UI 컴포넌트**: 기존 Tailwind CSS + Framer Motion

## 구현 우선순위

### Phase 1 (즉시 구현)
1. ✅ 커뮤니티 메인 페이지
2. ✅ 게시판 (기본 기능)
3. ✅ 질문과 답변 (기본 기능)

### Phase 2 (추가 기능)
1. 실시간 채팅 (WebSocket 또는 SSE)
2. 프로젝트 갤러리
3. 튜토리얼 섹션

### Phase 3 (고급 기능)
1. 알림 시스템
2. 검색 기능 강화
3. 사용자 프로필
4. 팔로우/친구 시스템

## UI/UX 디자인 원칙

1. **일관성**: 기존 Shell 솔루션 디자인과 일관성 유지
2. **접근성**: 반응형 디자인, 다크 모드 지원
3. **직관성**: 명확한 네비게이션, 쉬운 사용법
4. **실시간성**: 새 게시글/댓글 실시간 표시
5. **커뮤니티 친화적**: 좋아요, 댓글, 공유 기능 강조

## 데이터 구조 (초기)

### 게시글 (Post)
```typescript
interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  likes: number;
  views: number;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 댓글 (Comment)
```typescript
interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  likes: number;
  createdAt: Date;
  replies?: Comment[]; // 중첩 댓글
}
```

### 채팅 메시지 (ChatMessage)
```typescript
interface ChatMessage {
  id: string;
  channel: string;
  author: string;
  content: string;
  timestamp: Date;
  mentions?: string[];
}
```

