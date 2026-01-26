-- 쿠폰 시스템 데이터베이스 마이그레이션 SQL
-- PostgreSQL용

-- 쿠폰 테이블
CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    
    -- 쿠폰 타입 및 값
    type TEXT NOT NULL,  -- subscription_days, credit, discount_percent, discount_amount, plan_upgrade
    value DOUBLE PRECISION NOT NULL,
    
    -- 사용 제한
    max_users INTEGER,
    max_uses_per_user INTEGER DEFAULT 1,
    current_users INTEGER DEFAULT 0,
    
    -- 기간 및 활성화
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- 제한 사항
    plan_restriction TEXT,
    min_purchase DOUBLE PRECISION,
    
    -- 생성 정보
    created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 추가 옵션
    options JSONB
);

-- 쿠폰 사용 내역 테이블
CREATE TABLE IF NOT EXISTS coupon_usages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    coupon_id TEXT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 사용 정보
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied_value DOUBLE PRECISION NOT NULL,
    
    -- 결과 정보
    result_type TEXT NOT NULL,
    result_data JSONB
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_expires_at ON coupons(expires_at);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_id ON coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_user_id ON coupon_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_used_at ON coupon_usages(used_at);

-- 쿠폰 코드는 대문자로 저장
CREATE OR REPLACE FUNCTION uppercase_coupon_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.code := UPPER(NEW.code);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_uppercase_coupon_code
    BEFORE INSERT OR UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION uppercase_coupon_code();
