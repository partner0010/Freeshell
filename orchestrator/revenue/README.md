# 수익 모델 시스템

## 개요

플랫폼의 수익 구조를 관리하는 시스템

## 핵심 수익원

### 1. 콘텐츠 생성 크레딧
- 구독 기반 크레딧 제공
- 추가 크레딧 구매
- 플랜별 차별화

### 2. 전문가 중개 수수료
- 서비스 수수료: 15-30%
- 전문가 구독: $9.99/월

### 3. 프리미엄 AI 기능
- 고급 AI 모델 접근
- 빠른 처리 속도
- API 접근

### 4. 교육/전자책 마켓
- 제품 판매 수수료: 20-30%
- 전문가 수익화

### 5. 기업용 원격관리
- 기업 플랜: $199-1,999/월
- 대량 관리 기능

## 사용 예시

### 크레딧 시스템

```python
from orchestrator.revenue import CreditSystem, CreditType

credit_system = CreditSystem()

# 크레딧 사용 가능 여부 확인
can_use, message = credit_system.can_use_credits(
    user_id="user_001",
    credit_type=CreditType.IMAGE,
    amount=1
)

# 크레딧 사용
success, message = credit_system.use_credits(
    user_id="user_001",
    credit_type=CreditType.IMAGE
)

# 크레딧 구매
credit_system.purchase_credits(
    user_id="user_001",
    amount=100,
    price=10.0
)
```

### 가격 전략

```python
from orchestrator.revenue import PricingStrategy, PlanType

pricing = PricingStrategy()

# 월간 가격
monthly = pricing.get_monthly_price(PlanType.PRO)  # $29.99

# 연간 가격 (할인)
annual = pricing.get_annual_price(PlanType.PRO)  # $287.90

# 업그레이드 제안
suggestion = pricing.get_upgrade_suggestion(PlanType.FREE)
```

### 수익 예측

```python
from orchestrator.revenue import RevenueForecaster

forecaster = RevenueForecaster()

# MVP 수익 예측
forecast = forecaster.forecast_mvp(
    user_count=1000,
    conversion_rate=0.20
)

# 6개월 예측
forecasts = forecaster.forecast_6months(
    initial_users=1000,
    growth_rate=0.20
)
```

### 전환 전략

```python
from orchestrator.revenue import ConversionFunnel

funnel = ConversionFunnel()

# 전환 기회 감지
opportunity = funnel.detect_opportunity(
    user_id="user_001",
    context={'credit_exhausted': True}
)

# 전환 가치 계산
value = funnel.calculate_conversion_value(
    user_id="user_001",
    target_plan=PlanType.PRO
)
```

## 수익 목표

### 3개월
- 사용자: 1,000명
- 월 수익: $10,000

### 6개월
- 사용자: 5,000명
- 월 수익: $30,000

### 12개월
- 사용자: 20,000명
- 월 수익: $100,000
