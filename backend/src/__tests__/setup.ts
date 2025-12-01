/**
 * Jest 테스트 설정
 */

// 환경 변수 설정
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'file:./test.db'

// 전역 테스트 설정
beforeAll(() => {
  // 테스트 전 초기화
})

afterAll(() => {
  // 테스트 후 정리
})

