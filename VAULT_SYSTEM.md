# 개인 AI Vault 시스템

**작성 일시**: 2026-01-25  
**목표**: 기억/추모/기록을 위한 개인 AI Vault (가장 강력한 감정 락인)

---

## 구현 완료

### 파일 구조
```
backend/vault/
├── __init__.py        ✅
├── models.py          ✅
├── schemas.py         ✅
├── service.py         ✅
├── ai_generator.py    ✅ (새로 추가)
├── router.py          ✅ (새로 추가)
└── encryption.py      ✅ (기존 코드 활용)
```

---

## 핵심 개념

### 개인 AI Vault
- 사용자의 사진·음성·글·영상을 저장
- AI가 "그 사람의 방식"으로 반응
- 추모, 힐링, 기록 목적
- **윤리·동의·삭제 권한이 핵심**

---

## 데이터 구조

```json
{
  "vault_id": "vault_001",
  "owner": "user_123",
  "memories": [
    {
      "id": "memory_001",
      "type": "voice",
      "file": "dad_voice.wav",
      "consent": true,
      "description": "아버지의 목소리",
      "metadata": {}
    }
  ],
  "ai_enabled": true,
  "commercial_use": false,
  "family_shared": false,
  "consent_verified": true
}
```

---

## 윤리·법적 안전 설계 (필수)

### 1. 생전 동의 여부 저장
- 각 메모리 아이템에 `consent` 필드 필수
- 동의 증명 파일 저장 가능
- 동의 날짜 기록

### 2. AI 재현 ON/OFF
- `ai_enabled` 플래그로 제어
- 사용자가 언제든지 비활성화 가능

### 3. 완전 삭제 가능
- Vault 삭제 시 모든 데이터 완전 삭제
- 복구 불가능
- 암호화된 파일도 완전 삭제

### 4. 상업 사용 불가 (기본)
- `commercial_use` 기본값: `false`
- 명시적 동의 없이는 상업 사용 불가

---

## Vault AI 응답 로직

### `vault_response()`
```python
def vault_response(prompt, memory_data):
    """
    그 사람의 방식으로 응답 생성
    
    - 음성 메모리: 말투 분석
    - 텍스트 메모리: 문체 분석
    - 사진/영상: 감정/상황 분석
    - 통합하여 개인화된 응답 생성
    """
    return "그 사람 말투로 생성된 응답"
```

---

## API 엔드포인트

### Vault 관리
- `POST /api/v1/vault` - Vault 생성
- `GET /api/v1/vault` - Vault 목록
- `GET /api/v1/vault/{id}` - Vault 조회
- `PUT /api/v1/vault/{id}` - Vault 수정
- `DELETE /api/v1/vault/{id}` - Vault 완전 삭제

### 메모리 관리
- `POST /api/v1/vault/{id}/memories` - 메모리 추가

### AI 기능
- `POST /api/v1/vault/{id}/ai` - AI 응답 생성

### 동의 관리
- `PUT /api/v1/vault/{id}/consent` - 동의 정보 업데이트

### 통계
- `GET /api/v1/vault/{id}/stats` - Vault 통계

---

## 사용 예시

### Vault 생성
```python
POST /api/v1/vault
{
  "name": "아버지의 기억",
  "purpose": "memorial",  // memorial, healing, archive
  "ai_enabled": true,
  "commercial_use": false,
  "family_shared": false
}
```

### 메모리 추가
```python
POST /api/v1/vault/{vault_id}/memories
{
  "type": "voice",
  "file": "dad_voice.wav",
  "consent": true,  // 생전 동의 여부 필수
  "description": "아버지의 목소리"
}
```

### AI 응답 생성
```python
POST /api/v1/vault/{vault_id}/ai
{
  "prompt": "오늘 하루는 어땠어?",
  "context": "추가 컨텍스트"
}

Response:
{
  "vault_id": "vault_001",
  "response": "음, 오늘 하루는... (그 사람 말투로 생성된 응답)",
  "method": "memory_based",
  "consent_verified": true
}
```

---

## 수익화

### 1. 프리미엄 저장 공간
- 기본: 제한된 저장 공간
- 프리미엄: 확장된 저장 공간

### 2. 기록 영상 자동 제작
- 메모리를 기반으로 추모 영상 자동 생성
- 캐릭터 콘텐츠 파이프라인 활용

### 3. 가족 공유 Vault
- 가족 구성원과 Vault 공유
- 권한 관리 (읽기/쓰기)

---

## 다음 단계

### 즉시 개선 가능
1. **실제 AI 모델 통합**: 음성/텍스트 분석 모델 통합
2. **파일 관리**: S3 등 클라우드 스토리지 통합
3. **가족 공유**: 가족 구성원 초대 및 권한 관리

### 보안 강화
1. **이중 암호화**: 추가 보안 레이어
2. **접근 로그**: 모든 접근 기록
3. **자동 백업**: 안전한 백업 시스템

---

## 주의사항

1. **윤리적 고려**: 매우 민감한 데이터이므로 윤리적 가이드라인 준수 필수
2. **법적 요구사항**: 개인정보보호법, 초상권 등 법적 요구사항 준수
3. **동의 관리**: 생전 동의 증명 및 관리 철저히
4. **삭제 권리**: 사용자의 삭제 요청 즉시 처리
