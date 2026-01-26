# 캐릭터 음성 생성 기능

**작성 일시**: 2026-01-25  
**목표**: 캐릭터 고정 IP의 음성 생성 (TTS + Voice Cloning)

---

## 구현 완료

### 파일 구조
```
backend/character/
├── voice_generator.py  ✅ (새로 추가)
├── router.py          ✅ (음성 생성 엔드포인트 추가)
└── schemas.py         ✅ (CharacterVoiceRequest/Response 추가)
```

---

## 핵심 함수

### `generate_character_voice()`
```python
def generate_character_voice(
    text: str,
    voice_ref: Optional[str] = None,
    character_id: Optional[str] = None,
    personality: Optional[Dict[str, Any]] = None,
    output_dir: str = "storage/character_voices"
) -> str:
    """
    캐릭터 음성 생성 (MVP: TTS + Voice Cloning Hook)
    
    Returns:
        생성된 음성 파일 경로 (voice_output.wav)
    """
```

---

## 동작 방식

### 1. Voice Cloning (우선순위 1)
- `voice_ref` 파일이 제공되고 ElevenLabs 사용 가능한 경우
- ElevenLabs Voice Cloning API 사용
- 참조 음성 파일을 업로드하여 클론 생성
- 클론된 voice로 텍스트를 음성으로 변환

### 2. TTS (우선순위 2)
- 기존 `AudioGenerator` 사용 (ElevenLabs TTS)
- 캐릭터의 `personality` 설정 반영
  - `tone`: 감정 톤 (따뜻함, 차갑함 등)
  - `speed`: 말하기 속도 (느림, 보통, 빠름)

### 3. Fallback (우선순위 3)
- TTS 서비스가 없는 경우
- 무음 파일 생성 (실제 사용 시 TTS 라이브러리 권장)

---

## API 엔드포인트

### `POST /api/v1/characters/{character_id}/voice`

**요청:**
```json
{
  "text": "안녕하세요, 저는 AI 하나입니다.",
  "voice_ref": "voice_ref.wav"  // 선택적
}
```

**응답:**
```json
{
  "character_id": "char_001",
  "voice_url": "storage/character_voices/voice_char_001_123456.wav",
  "duration": 3.5,
  "method": "voice_cloning"  // 또는 "tts", "fallback"
}
```

---

## 사용 예시

### Python 코드
```python
from backend.character.voice_generator import generate_character_voice

# 캐릭터 음성 생성
voice_path = generate_character_voice(
    text="안녕하세요, 저는 AI 하나입니다.",
    voice_ref="voice_ref.wav",
    character_id="char_001",
    personality={
        "tone": "따뜻함",
        "speed": "보통"
    }
)

print(f"Generated voice: {voice_path}")
```

### API 호출
```bash
curl -X POST "http://localhost:8000/api/v1/characters/char_001/voice" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "안녕하세요, 저는 AI 하나입니다."
  }'
```

---

## 통합 계획

### 다음 단계
1. **Content 생성 통합**: Content 생성 시 자동으로 캐릭터 음성 사용
2. **Voice ID 캐싱**: 클론된 voice_id를 캐릭터 metadata에 저장하여 재사용
3. **배치 처리**: 여러 텍스트를 한 번에 음성으로 변환
4. **음성 품질 향상**: 더 나은 Voice Cloning 모델 통합

---

## 의존성

### 필수
- `backend/app/services/audio_generator.py` (ElevenLabs TTS)

### 선택적
- `elevenlabs` 라이브러리 (Voice Cloning)
- `wave` (Python 표준 라이브러리, WAV 파일 처리)

---

## 환경 변수

```bash
# ElevenLabs API 키 (Voice Cloning 사용 시)
ELEVENLABS_API_KEY=your_api_key_here
```

---

## 주의사항

1. **비용**: ElevenLabs Voice Cloning은 API 호출 비용이 발생할 수 있음
2. **파일 경로**: `voice_ref`는 서버에서 접근 가능한 경로여야 함
3. **Fallback**: TTS 서비스가 없는 경우 무음 파일이 생성됨 (실제 사용 시 TTS 라이브러리 권장)
