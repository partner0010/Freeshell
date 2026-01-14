# Cursor AI 개발 가이드

## 이 문서의 목적

이 문서는 Cursor AI가 플랫폼을 개발할 때 따라야 할 기준 문서입니다.

## 핵심 원칙

### 1. AI Orchestrator 중심
- 모든 기능은 Orchestrator를 통해 통합
- AI 실패 시 자동 Fallback
- 플러그인 기반 확장

### 2. 하이브리드 시스템
- AI + Rule 기반
- 항상 동작 보장
- 비용 최적화

### 3. Ethics First
- 모든 요청은 Ethics Guard 통과
- 동의 기반 운영
- 위험 자동 차단

### 4. 수익 모델 통합
- 모든 사용은 크레딧 시스템 연동
- 자연스러운 유료 전환
- 지속 가능한 구조

## 개발 순서

### 1. 새로운 기능 추가 시

```python
# 1. Engine 클래스 생성
class NewEngine(Engine):
    def __init__(self):
        super().__init__("new_engine", EngineType.AI, priority=0)
    
    async def execute(self, input_data):
        # 구현
        pass

# 2. Orchestrator에 등록
orchestrator.register_engine(NewEngine())

# 3. Ethics Guard 통과
result = await blocking_flow.process_request(user_input, user_id)

# 4. 크레딧 확인
can_use = credit_system.can_use_credits(user_id, credit_type)
```

### 2. API 엔드포인트 추가 시

```python
@app.post("/api/content/create")
async def create_content(
    request: ContentRequest,
    user_id: str = Depends(get_current_user)
):
    # 1. Ethics Guard
    ethics_result = await blocking_flow.process_request(...)
    
    # 2. 크레딧 확인
    can_use = credit_system.can_use_credits(...)
    
    # 3. Orchestrator 처리
    result = await orchestrator.process(...)
    
    # 4. 크레딧 사용
    credit_system.use_credits(...)
    
    return result
```

### 3. 프론트엔드 컴포넌트 추가 시

```typescript
// 1. API 호출
const response = await fetch('/api/content/create', {
  method: 'POST',
  body: JSON.stringify({ prompt, type })
});

// 2. 크레딧 업데이트
if (response.ok) {
  updateCredits(response.credits);
}

// 3. 업그레이드 제안 (크레딧 부족 시)
if (response.credit_insufficient) {
  showUpgradeModal(response.upgrade_suggestion);
}
```

## 파일 구조 규칙

### Backend
```
orchestrator/
├── core/           # 핵심 Orchestrator
├── engines/        # 엔진 구현
├── video/          # 영상 관련
├── motion/         # 모션 관련
├── ethics/         # 윤리 시스템
├── expert/         # 전문가 시스템
├── revenue/        # 수익 시스템
└── utils/          # 유틸리티
```

### Frontend
```
app/
├── (main)/         # 메인 페이지
├── content/        # 콘텐츠 생성
├── expert/         # 전문가 매칭
├── credits/        # 크레딧 관리
└── api/            # API 라우트
```

## 코딩 규칙

### 1. 에러 처리
```python
try:
    result = await process()
    if not result.success:
        # Fallback 시도
        result = await fallback_process()
except Exception as e:
    logger.error(f"Error: {e}")
    # 항상 Fallback 제공
    result = await fallback_process()
```

### 2. 로깅
```python
from orchestrator.utils.logger import get_logger

logger = get_logger(__name__)

logger.info("Process started")
logger.warning("Fallback used")
logger.error("Error occurred")
```

### 3. 타입 힌트
```python
from typing import Dict, Any, Optional, List

async def process(
    user_id: str,
    data: Dict[str, Any],
    options: Optional[List[str]] = None
) -> Dict[str, Any]:
    pass
```

## 테스트 규칙

### 1. 단위 테스트
```python
def test_engine():
    engine = NewEngine()
    result = await engine.execute(test_data)
    assert result.success
```

### 2. 통합 테스트
```python
def test_integration():
    platform = UnifiedPlatform()
    result = await platform.create_content(...)
    assert result['success']
```

### 3. Ethics 테스트
```python
def test_ethics():
    result = await blocking_flow.process_request(...)
    assert result['allowed'] or result['blocked']
```

## 문서화 규칙

### 1. 모든 모듈에 README
```markdown
# Module Name

## 개요
간단한 설명

## 사용 예시
코드 예시

## API
주요 함수 설명
```

### 2. 주요 함수에 Docstring
```python
async def process(data: Dict[str, Any]) -> Result:
    """
    데이터 처리
    
    Args:
        data: 입력 데이터
        
    Returns:
        처리 결과
        
    Raises:
        ValueError: 데이터 형식 오류
    """
    pass
```

## 배포 규칙

### 1. 환경 변수
```python
# .env
DATABASE_URL=...
API_KEYS=...
ENVIRONMENT=production
```

### 2. Docker
```dockerfile
FROM python:3.10
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app"]
```

### 3. CI/CD
```yaml
- test
- build
- deploy
```

## 참고 문서

- `PLATFORM_STRATEGY.md`: 전체 전략
- `IMPLEMENTATION_ROADMAP.md`: 구현 로드맵
- 각 모듈의 README.md

---

**이 가이드를 따라 일관된 개발을 유지하세요.**
