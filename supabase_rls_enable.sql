-- RLS (Row Level Security) 활성화 및 정책 설정
-- Supabase 대시보드 > SQL Editor에서 이 스크립트를 실행하세요

-- 1. RLS 활성화 (4개 테이블 모두)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_step_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 2. 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Enable all access for all users" ON users;
DROP POLICY IF EXISTS "Enable all access for all users" ON projects;
DROP POLICY IF EXISTS "Enable all access for all users" ON ai_step_results;
DROP POLICY IF EXISTS "Enable all access for all users" ON payments;

-- 3. Users 테이블 정책 (개발용 - 모든 접근 허용)
CREATE POLICY "Enable all access for all users" ON users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 4. Projects 테이블 정책 (개발용 - 모든 접근 허용)
CREATE POLICY "Enable all access for all users" ON projects
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 5. AI Step Results 테이블 정책 (개발용 - 모든 접근 허용)
CREATE POLICY "Enable all access for all users" ON ai_step_results
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 6. Payments 테이블 정책 (개발용 - 모든 접근 허용)
CREATE POLICY "Enable all access for all users" ON payments
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 참고: 
-- 개발 단계에서는 위 정책으로 충분합니다.
-- 프로덕션 배포 전에 NextAuth와 통합하여 더 세밀한 권한 제어를 설정할 수 있습니다.
