# 가벼운 Web 메타공간 시스템

**작성 일시**: 2026-01-25  
**목표**: 가벼운 Web 메타공간 (채팅 + 캐릭터) - 공간형 SNS

---

## 구현 완료

### 파일 구조
```
backend/spatial/
├── __init__.py        ✅
├── models.py          ✅ (기존 Space 모델 import)
├── schemas.py         ✅
├── service.py         ✅
├── chat_handler.py    ✅ (새로 추가)
└── router.py          ✅ (새로 추가)
```

---

## 핵심 개념

### 가벼운 Web 메타공간
- ❌ 무거운 메타버스
- ⭕ 공간형 SNS
- WebGL / Three.js Lite
- 아바타는 AI 캐릭터 재사용
- 목적: 만남 + 대화 + 이벤트

---

## 데이터 구조

```json
{
  "space_id": "space_1",
  "name": "라운지",
  "type": "lounge",
  "participants": [
    {
      "user_id": "user_123",
      "character_id": "char_001",
      "position": {"x": 0, "y": 0, "z": 0}
    }
  ]
}
```

---

## 채팅 + 캐릭터 반응

### `space_chat()`
```python
def space_chat(user, message):
    """
    공간 채팅 처리 + 캐릭터 반응
    
    Returns:
        {
            "character_reply": "AI 캐릭터 응답",
            "emotion": "smile"
        }
    """
    return {
        "character_reply": "AI 캐릭터 응답",
        "emotion": "smile"
    }
```

---

## 기술 스택

- **Three.js**: 3D 공간 렌더링 (Lite 버전)
- **WebSocket**: 실시간 채팅 및 위치 동기화
- **캐릭터 모션**: 기존 모션 시스템 재사용

---

## API 엔드포인트

### 공간 관리
- `POST /api/v1/spatial/spaces` - 공간 생성
- `GET /api/v1/spatial/spaces` - 공간 목록
- `GET /api/v1/spatial/spaces/{id}` - 공간 조회
- `POST /api/v1/spatial/spaces/{id}/join` - 공간 입장
- `POST /api/v1/spatial/spaces/{id}/leave` - 공간 퇴장

### 채팅
- `POST /api/v1/spatial/spaces/{id}/chat` - 채팅 전송 + 캐릭터 반응

### WebSocket
- `WS /api/v1/spatial/spaces/{id}/ws` - 실시간 채팅 및 위치 동기화

---

## 사용 예시

### 공간 생성
```python
POST /api/v1/spatial/spaces
{
  "name": "친구들과의 라운지",
  "type": "lounge",
  "is_public": false,
  "max_users": 20,
  "theme": "cozy"
}
```

### 채팅 전송
```python
POST /api/v1/spatial/spaces/{space_id}/chat
{
  "message": "안녕하세요!",
  "character_id": "char_001"  // 선택적
}

Response:
{
  "space_id": "space_1",
  "user_id": "user_123",
  "character_id": "char_001",
  "message": "안녕하세요!",
  "character_reply": "안녕하세요! 반갑습니다.",
  "emotion": "smile",
  "timestamp": "2026-01-25T12:00:00"
}
```

### WebSocket 연결
```javascript
const ws = new WebSocket('ws://localhost:8000/api/v1/spatial/spaces/space_1/ws?token=...&character_id=char_001');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'chat_message') {
    console.log('Message:', data.message);
    console.log('Character reply:', data.character_reply);
    console.log('Emotion:', data.emotion);
  }
};

// 메시지 전송
ws.send(JSON.stringify({
  type: 'chat',
  message: '안녕하세요!',
  character_id: 'char_001'
}));
```

---

## 수익화

### 1. 테마 공간
- 기본 공간: 무료
- 프리미엄 테마: 유료

### 2. 이벤트 입장
- 특별 이벤트 공간 입장료

### 3. 캐릭터 팬미팅
- 캐릭터 주최 팬미팅 공간
- 입장료 및 후원

---

## 다음 단계

### 즉시 개선 가능
1. **Three.js 통합**: 프론트엔드 Three.js Lite 렌더링
2. **캐릭터 모션**: 공간 내 캐릭터 애니메이션
3. **위치 동기화**: 실시간 위치 업데이트

### 추가 기능
1. **이벤트 시스템**: 특별 이벤트 공간 생성
2. **음성 채팅**: WebRTC 기반 음성 통화
3. **콘텐츠 공유**: 공간 내 콘텐츠 공유

---

## 주의사항

1. **성능**: WebGL/Three.js는 리소스 집약적이므로 Lite 버전 사용
2. **확장성**: WebSocket 연결 수에 따른 서버 리소스 관리
3. **보안**: WebSocket 인증 및 메시지 검증 필수
