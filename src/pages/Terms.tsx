import { FileText, Shield } from 'lucide-react'

export default function Terms() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4">이용약관</h1>
          <p className="text-lg text-gray-400">최종 업데이트: 2024년 12월</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 space-y-8 text-white">
          <section>
            <h2 className="text-2xl font-black mb-4">제1조 (목적)</h2>
            <p className="text-base text-gray-300 leading-relaxed">
              본 약관은 FreeShell(이하 "플랫폼")이 제공하는 창작 도구 서비스의 이용과 관련하여 
              플랫폼과 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">제2조 (서비스의 내용)</h2>
            <div className="text-base text-gray-300 leading-relaxed space-y-3">
              <p>플랫폼은 다음의 서비스를 제공합니다:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>텍스트, 이미지, 음성, 영상 등 창작물 생성 도구</li>
                <li>다국어 번역 및 글로벌 배포 지원</li>
                <li>콘텐츠 자동화 및 예약 시스템</li>
                <li>수익 분석 및 관리 도구</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">제3조 (서비스 이용의 제한)</h2>
            <div className="text-base text-gray-300 leading-relaxed space-y-3">
              <p>다음 각 호에 해당하는 경우 서비스 이용이 제한될 수 있습니다:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>타인의 정보 도용 또는 부정 사용</li>
                <li>불법적이거나 부적절한 콘텐츠 생성</li>
                <li>서비스의 정상적인 운영 방해</li>
                <li>타인의 권리를 침해하는 행위</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">제4조 (저작권 및 지적재산권)</h2>
            <div className="text-base text-gray-300 leading-relaxed space-y-3">
              <p className="font-semibold text-yellow-400">
                ⚠️ 중요: 생성된 콘텐츠의 저작권 및 책임
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>본 플랫폼을 통해 생성된 콘텐츠는 AI가 생성한 것입니다</li>
                <li>생성된 콘텐츠의 사용 및 배포에 대한 책임은 사용자에게 있습니다</li>
                <li>생성된 콘텐츠가 제3자의 권리를 침해하지 않는지 확인할 책임은 사용자에게 있습니다</li>
                <li>플랫폼은 생성된 콘텐츠의 정확성, 적법성을 보장하지 않습니다</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">제5조 (면책 조항)</h2>
            <div className="text-base text-gray-300 leading-relaxed space-y-3">
              <p className="font-semibold text-red-400">
                ⚠️ 플랫폼은 다음 사항에 대해 책임을 지지 않습니다:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>생성된 콘텐츠의 정확성, 완전성, 적법성</li>
                <li>생성된 콘텐츠 사용으로 인한 손해</li>
                <li>제3자 플랫폼(YouTube, TikTok 등)의 정책 변경</li>
                <li>예상 수익의 실현 (수익은 보장되지 않음)</li>
                <li>서비스 중단, 장애, 오류로 인한 손해</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">제6조 (수익 및 결제)</h2>
            <div className="text-base text-gray-300 leading-relaxed space-y-3">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>표시된 "예상 수익"은 추정치이며 실제와 다를 수 있습니다</li>
                <li>수익 발생은 제3자 플랫폼의 정책을 따릅니다</li>
                <li>플랫폼은 수익을 보장하지 않습니다</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">제7조 (개인정보 보호)</h2>
            <p className="text-base text-gray-300 leading-relaxed">
              개인정보의 처리에 관한 사항은 별도의 개인정보처리방침에 따릅니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">제8조 (약관의 변경)</h2>
            <p className="text-base text-gray-300 leading-relaxed">
              플랫폼은 필요한 경우 본 약관을 변경할 수 있으며, 
              변경된 약관은 공지 후 7일 이후부터 효력이 발생합니다.
            </p>
          </section>

          <section className="pt-6 border-t border-white/20">
            <p className="text-sm text-gray-400 text-center">
              문의: support@freeshell.co.kr
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

