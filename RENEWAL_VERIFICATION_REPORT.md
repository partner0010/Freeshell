# 리뉴얼 검증 리포트

**검증 일시**: 2026-01-25  
**검증자**: 시니어 테크 리드  
**검증 기준**: AI Orchestrator 중심 구조 + 숏폼 MVP 설계

---

## 1. Orchestrator 중심 구조 검증

### ✅ 잘 된 부분

1. **Orchestrator 클래스 존재**
   - `backend/app/services/ai_orchestrator.py`: `AIOrchestrator` 클래스 구현됨
   - 프롬프트 분석, 계획 생성, 스크립트 생성 기능 제공
   - OpenAI API 통합 및 재시도 로직 포함

2. **Orchestrator 통합 엔드포인트 존재**
   - `backend/api/integrated_routes.py`: `/generate/with-orchestrator` 엔드포인트 구현
   - `OrchestratorIntegration` 서비스를 통한 통합 경로 제공

3. **설계 문서 일관성**
   - `PLATFORM_STRATEGY.md`에 Orchestrator 중심 아키텍처 명시
   - `orchestrator/` 디렉토리에 별도 구현 존재 (다중 버전)

### ⚠️ 애매한 부분

1. **이중 구조 존재**
   ```
   backend/app/services/ai_orchestrator.py  ← 새 구조
   backend/orchestrator/orchestrator.py     ← 기존 구조
   orchestrator/core/orchestrator.py        ← 또 다른 구조
   ```
   - **문제**: 3개의 Orchestrator 구현이 공존
   - **영향**: 어떤 것을 사용해야 하는지 불명확

2. **Orchestrator 사용 범위 제한적**
   - `backend/app/api/v1/endpoints/prompts.py`: 프롬프트 분석에만 사용
   - 실제 콘텐츠 생성 파이프라인에서는 **직접 서비스 호출**이 주류

### ❌ 명확히 잘못된 부분

1. **콘텐츠 생성 태스크가 Orchestrator를 우회**
   ```python
   # backend/app/tasks/content_generation.py:145
   orchestrator = AIOrchestrator()  # 인스턴스만 생성
   
   # 실제로는 직접 서비스 호출
   image_generator = ImageGenerator()  # 직접 호출
   audio_generator = AudioGenerator()  # 직접 호출
   video_composer = VideoComposer()    # 직접 호출
   ```
   - **문제**: Orchestrator를 거치지 않고 개별 서비스를 직접 호출
   - **설계 위반**: "AI Orchestrator 중심 구조"와 완전히 불일치

2. **숏폼 생성 엔드포인트가 Orchestrator 미사용**
   ```python
   # backend/api/shortform_routes.py:32
   result = shortform_service.generate_from_scene_json(...)  # 직접 호출
   ```
   - **문제**: 기본 숏폼 생성 엔드포인트가 Orchestrator를 사용하지 않음
   - **설계 위반**: 모든 콘텐츠 생성은 Orchestrator를 거쳐야 함

3. **Orchestrator 통합 경로가 선택적**
   - `/api/shortform/generate`: Orchestrator 없음 (기본)
   - `/api/shortform/generate/with-orchestrator`: Orchestrator 사용 (선택)
   - **문제**: 설계상 **모든** 요청이 Orchestrator를 거쳐야 하는데, 선택적으로만 제공

---

## 2. 숏폼 생성 로직 구조 검증

### ✅ 잘 된 부분

1. **파이프라인 구조 존재**
   ```python
   # backend/shortform/services/script_generator.py
   generate_script() → parse_script_fallback() → generate_script_fallback()
   ```
   - 단계별 처리 흐름이 명확함
   - 각 단계가 독립적인 함수로 분리됨

2. **서비스 레이어 분리**
   - `script_generator.py`: 스크립트 생성
   - `scene_generator.py`: Scene JSON 생성
   - `tts_generator.py`: 음성 생성
   - `video_renderer.py`: 비디오 렌더링
   - **구조**: 모듈화가 잘 되어 있음

### ⚠️ 애매한 부분

1. **파이프라인 vs 단순 함수 호출**
   ```python
   # backend/app/tasks/content_generation.py
   # 단순 순차 호출 (파이프라인 아님)
   image_generator.generate(...)
   audio_generator.generate(...)
   video_composer.compose(...)
   ```
   - **문제**: 파이프라인 패턴이 아닌 단순 함수 호출 체인
   - **설계 기대**: 각 단계가 독립적인 파이프라인 컴포넌트여야 함

2. **상태 관리 부재**
   - 파이프라인 중간 상태를 저장/복구하는 메커니즘이 없음
   - 실패 시 전체 재시작만 가능 (부분 재시도 불가)

### ❌ 명확히 잘못된 부분

1. **하드코딩된 시나리오**
   ```python
   # backend/app/tasks/content_generation.py:159
   scene_prompts = [
       "카페 외관, 따뜻한 조명",      # 하드코딩
       "카페 내부, 아늑한 분위기",    # 하드코딩
       "커피 제조 과정, 전문적",     # 하드코딩
   ]
   ```
   - **문제**: 프롬프트 분석 결과를 사용하지 않고 고정값 사용
   - **설계 위반**: Orchestrator의 분석 결과를 활용해야 함

2. **Orchestrator 결과 무시**
   ```python
   # backend/app/tasks/content_generation.py:145
   orchestrator = AIOrchestrator()
   # 하지만 실제로는 orchestrator 결과를 사용하지 않음
   ```
   - **문제**: Orchestrator를 생성하지만 결과를 활용하지 않음
   - **설계 위반**: Orchestrator의 `plan`과 `script`를 사용해야 함

---

## 3. AI 실패 시 Fallback 코드 검증

### ✅ 잘 된 부분

1. **이미지 생성 Fallback**
   ```python
   # backend/app/services/image_generator.py:296
   model = self.default_model if attempt == 0 else self.fallback_model
   ```
   - 기본 모델 실패 시 대체 모델 사용
   - Provider 간 Fallback (Replicate → Stability AI)

2. **스크립트 생성 Fallback**
   ```python
   # backend/shortform/services/script_generator.py:60
   return generate_script_fallback(refined_prompt)  # 규칙 기반
   ```
   - LLM 실패 시 규칙 기반 스크립트 생성
   - JSON 파싱 실패 시 텍스트 파싱 Fallback

3. **TTS Fallback**
   ```python
   # backend/shortform/services/tts_generator.py:113
   async def generate_fallback_tts(text: str) -> str:
   ```
   - TTS 실패 시 기본 음성 생성

### ⚠️ 애매한 부분

1. **Fallback 범위 제한적**
   - 개별 서비스 레벨에서만 Fallback 존재
   - **Orchestrator 레벨의 통합 Fallback 부재**

2. **Fallback 전략 불명확**
   - 어떤 실패 시 어떤 Fallback을 사용하는지 명확한 규칙 없음
   - 단계별 Fallback 우선순위가 정의되지 않음

### ❌ 명확히 잘못된 부분

1. **Orchestrator Fallback 부재**
   ```python
   # backend/app/services/ai_orchestrator.py
   # OpenAI API 실패 시 예외만 발생, Fallback 없음
   except Exception as e:
       logger.error(f"Error in analyze_prompt: {e}")
       raise  # 그냥 예외 발생
   ```
   - **문제**: Orchestrator 자체에 Fallback 로직이 없음
   - **설계 기대**: AI 실패 시 Rule Engine으로 자동 전환되어야 함

2. **콘텐츠 생성 태스크의 Fallback 부재**
   ```python
   # backend/app/tasks/content_generation.py:187
   except Exception as e:
       logger.error(f"Failed to generate image {i + 1}: {e}")
       raise  # 예외 발생 시 전체 작업 실패
   ```
   - **문제**: 개별 단계 실패 시 전체 작업이 실패
   - **설계 기대**: 단계별 Fallback으로 부분 성공 가능해야 함

3. **설계 문서와 실제 코드 불일치**
   - `PLATFORM_STRATEGY.md`: "AI 실패 시 자동 Fallback" 명시
   - 실제 코드: Orchestrator 레벨 Fallback 없음

---

## 4. 설계 기준 vs 실제 코드 불일치 목록

### 🔴 Critical (즉시 수정 필요)

1. **Orchestrator 중심 구조 미구현**
   - **설계**: 모든 콘텐츠 생성이 Orchestrator를 거쳐야 함
   - **실제**: 대부분의 엔드포인트가 Orchestrator를 우회
   - **위치**: 
     - `backend/app/tasks/content_generation.py`
     - `backend/api/shortform_routes.py`
   - **영향**: 설계 철학과 완전히 불일치

2. **Orchestrator 결과 미활용**
   - **설계**: Orchestrator의 `analysis`, `plan`, `script`를 활용
   - **실제**: 하드코딩된 프롬프트 사용
   - **위치**: `backend/app/tasks/content_generation.py:159`
   - **영향**: Orchestrator가 의미 없는 존재

3. **Orchestrator Fallback 부재**
   - **설계**: AI 실패 시 Rule Engine으로 자동 전환
   - **실제**: 예외 발생 시 그냥 실패
   - **위치**: `backend/app/services/ai_orchestrator.py`
   - **영향**: 안정성 저하

### 🟡 Major (우선 수정 권장)

4. **이중/삼중 Orchestrator 구조**
   - **설계**: 단일 Orchestrator 구현
   - **실제**: 3개의 다른 구현 공존
   - **위치**: 
     - `backend/app/services/ai_orchestrator.py`
     - `backend/orchestrator/orchestrator.py`
     - `orchestrator/core/orchestrator.py`
   - **영향**: 혼란, 유지보수 어려움

5. **파이프라인 패턴 미적용**
   - **설계**: 독립적인 파이프라인 컴포넌트
   - **실제**: 단순 함수 호출 체인
   - **위치**: `backend/app/tasks/content_generation.py`
   - **영향**: 확장성 및 재사용성 저하

6. **상태 관리 부재**
   - **설계**: 파이프라인 중간 상태 저장/복구
   - **실제**: 상태 관리 메커니즘 없음
   - **영향**: 실패 시 전체 재시작만 가능

### 🟢 Minor (개선 권장)

7. **Fallback 전략 문서화 부재**
   - **설계**: 명확한 Fallback 우선순위
   - **실제**: 코드에만 존재, 문서 없음
   - **영향**: 유지보수 어려움

8. **에러 처리 일관성 부족**
   - **설계**: 통일된 에러 처리 전략
   - **실제**: 서비스마다 다른 에러 처리 방식
   - **영향**: 디버깅 어려움

---

## 종합 평가

### 현재 상태: ⚠️ **부분적 리뉴얼**

**긍정적 측면:**
- Orchestrator 클래스는 구현되어 있음
- 개별 서비스 레벨 Fallback은 존재
- 모듈화는 잘 되어 있음

**부정적 측면:**
- **핵심 설계 철학이 구현되지 않음**: Orchestrator 중심 구조가 아님
- **기존 구조 위에 덧댄 형태**: 새 코드와 기존 코드가 혼재
- **Orchestrator가 장식품**: 생성은 하지만 사용하지 않음

### 결론

**이 리뉴얼은 "제대로 리뉴얼"되지 않았습니다.**

**이유:**
1. Orchestrator 중심 구조가 아닌 **직접 서비스 호출 구조**가 주류
2. Orchestrator를 생성하지만 **결과를 활용하지 않음**
3. **기존 구조 위에 새 구조를 덧댄 형태** (진정한 리뉴얼 아님)

### 권장 조치

#### 즉시 조치 (Critical)

1. **콘텐츠 생성 태스크 재작성**
   ```python
   # 현재 (잘못됨)
   image_generator = ImageGenerator()
   image_generator.generate(...)
   
   # 수정 (올바름)
   orchestrator = AIOrchestrator()
   result = orchestrator.process_prompt(prompt)
   plan = result['plan']
   # plan을 기반으로 이미지 생성
   ```

2. **Orchestrator Fallback 구현**
   ```python
   # AI 실패 시 Rule Engine으로 전환
   try:
       result = await ai_engine.execute(...)
   except Exception:
       result = await rule_engine.execute(...)
   ```

3. **단일 Orchestrator로 통합**
   - 3개 구현 중 하나로 통합
   - 나머지 제거 또는 deprecated 표시

#### 중기 조치 (Major)

4. **파이프라인 패턴 적용**
   - 각 단계를 독립적인 컴포넌트로 재구성
   - 상태 관리 메커니즘 추가

5. **모든 엔드포인트 Orchestrator 통합**
   - `/api/shortform/generate`도 Orchestrator 사용
   - 직접 서비스 호출 경로 제거

---

**검증 완료**
