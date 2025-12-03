import { Shield, Lock } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4">개인정보 처리방침</h1>
          <p className="text-lg text-gray-400">최종 업데이트: 2024년 12월</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 space-y-8 text-white">
          <section>
            <h2 className="text-2xl font-black mb-4">1. 수집하는 개인정보</h2>
            <div className="text-base text-gray-300 leading-relaxed space-y-3">
              <p className="font-semibold">회원가입 시 수집:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>필수: 이메일, 사용자명, 비밀번호</li>
                <li>선택: 프로필 사진, 생년월일</li>
              </ul>
              <p className="font-semibold mt-4">서비스 이용 시 자동 수집:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>IP 주소, 쿠키, 서비스 이용 기록</li>
                <li>생성한 콘텐츠 정보, 플랫폼 연동 정보</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">2. 개인정보의 이용 목적</h2>
            <ul className="list-disc list-inside space-y-2 ml-4 text-base text-gray-300">
              <li>회원 관리 및 본인 확인</li>
              <li>서비스 제공 및 개선</li>
              <li>콘텐츠 생성 및 관리</li>
              <li>수익 정산 및 통계</li>
              <li>고객 지원 및 문의 응대</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">3. 개인정보의 보유 및 이용 기간</h2>
            <div className="text-base text-gray-300 leading-relaxed space-y-3">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>회원 탈퇴 시: 즉시 파기</li>
                <li>단, 법령에 따라 보존 필요 시: 해당 기간 동안 보관</li>
                <li>전자상거래법: 5년 (계약, 결제 기록)</li>
                <li>통신비밀보호법: 3개월 (접속 로그)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">4. 개인정보의 제3자 제공</h2>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-4">
              <p className="text-base text-blue-400 font-semibold">
                원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
              </p>
            </div>
            <p className="text-base text-gray-300">
              단, 다음의 경우는 예외로 합니다:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-base text-gray-300">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 요구되는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">5. 이용자의 권리</h2>
            <ul className="list-disc list-inside space-y-2 ml-4 text-base text-gray-300">
              <li>개인정보 열람 요구</li>
              <li>개인정보 정정 요구</li>
              <li>개인정보 삭제 요구</li>
              <li>개인정보 처리 정지 요구</li>
              <li>회원 탈퇴 (언제든지 가능)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">6. 개인정보 보호 조치</h2>
            <ul className="list-disc list-inside space-y-2 ml-4 text-base text-gray-300">
              <li>비밀번호 암호화 저장 (해싱)</li>
              <li>HTTPS 통신 암호화</li>
              <li>접근 권한 관리</li>
              <li>정기적인 보안 점검</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">7. 쿠키(Cookie)의 사용</h2>
            <div className="text-base text-gray-300 leading-relaxed space-y-3">
              <p>플랫폼은 다음의 목적으로 쿠키를 사용합니다:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>로그인 상태 유지</li>
                <li>서비스 이용 편의성 제공</li>
                <li>이용 통계 분석</li>
              </ul>
              <p className="mt-4">
                이용자는 브라우저 설정을 통해 쿠키 사용을 거부할 수 있습니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">8. AI 생성 콘텐츠 관련</h2>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
              <p className="text-base text-yellow-400 font-semibold mb-3">
                ⚠️ 중요 고지사항
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-base text-gray-300">
                <li>생성된 콘텐츠는 AI 기술로 생성된 것입니다</li>
                <li>정확성, 적법성을 사용 전 반드시 확인하세요</li>
                <li>생성된 콘텐츠로 인한 법적 책임은 사용자에게 있습니다</li>
                <li>제3자의 권리를 침해하지 않도록 주의하세요</li>
              </ul>
            </div>
          </section>

          <section className="pt-6 border-t border-white/20">
            <p className="text-base text-gray-400">
              개인정보 관련 문의: privacy@freeshell.co.kr
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

