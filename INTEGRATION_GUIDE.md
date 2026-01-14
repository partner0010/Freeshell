# Free AI Server 통합 가이드

## 🔗 Shell과 통합하기

### 1. Free AI Server 실행

```bash
cd free-ai-server
python -m app.main
```

서버가 `http://localhost:8000`에서 실행됩니다.

### 2. Shell의 `lib/free-ai-services.ts` 수정

```typescript
// free-ai-server 추가
async function tryFreeAIServer(prompt: string): Promise<FreeAIResponse> {
  try {
    const serverUrl = process.env.FREE_AI_SERVER_URL || 'http://localhost:8000';
    
    const response = await fetch(`${serverUrl}/generate/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.content) {
        return {
          text: data.content,
          source: 'free-ai-server',
          success: true,
          responseTime: data.response_time || 0,
          requiresApiKey: false,
        };
      }
    }
  } catch (error) {
    console.warn('[FreeAI] Free AI Server 실패:', error);
  }

  return {
    text: '',
    source: 'free-ai-server',
    success: false,
    responseTime: 0,
    requiresApiKey: false,
  };
}
```

### 3. 우선순위 조정

`generateWithFreeAI` 함수에서 Free AI Server를 최우선으로:

```typescript
export async function generateWithFreeAI(prompt: string): Promise<FreeAIResponse> {
  // 0순위: Free AI Server (자체 서버)
  try {
    const serverResult = await tryFreeAIServer(prompt);
    if (serverResult.success) {
      return serverResult;
    }
  } catch (error) {
    console.warn('[FreeAI] Free AI Server 실패:', error);
  }

  // 1순위: Groq API
  // ...
}
```

## 🎯 사용 시나리오

### 시나리오 1: 완전 로컬 환경
- Ollama + Free AI Server
- 인터넷 연결 불필요
- 완전 무료

### 시나리오 2: 하이브리드
- Free AI Server (주)
- Groq API (백업)
- Ollama (로컬)

### 시나리오 3: 확장
- 여러 Free AI Server 인스턴스
- 로드 밸런서
- 고가용성

## 📊 성능 비교

| 방법 | 속도 | 비용 | 품질 |
|------|------|------|------|
| Free AI Server (로컬) | 중간 | 무료 | 높음 |
| Groq API | 빠름 | 무료 | 매우 높음 |
| Ollama 직접 | 느림 | 무료 | 높음 |

## 🔧 환경 변수

`.env.local`에 추가:

```env
FREE_AI_SERVER_URL=http://localhost:8000
```

## 🚀 배포

### Docker로 배포

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 시스템 서비스로 실행

```bash
# systemd 서비스 파일 생성
sudo nano /etc/systemd/system/free-ai-server.service
```

```ini
[Unit]
Description=Free AI API Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/free-ai-server
ExecStart=/usr/bin/python3 -m app.main
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable free-ai-server
sudo systemctl start free-ai-server
```
