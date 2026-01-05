'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, Scale, AlertCircle } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-6">
              <Scale className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              이용약관
            </h1>
            <p className="text-gray-600">
              최종 업데이트: {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* 본문 */}
          <div className="prose prose-gray max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                1. 총칙
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                본 약관은 Shell(이하 &quot;서비스&quot;)이 제공하는 모든 서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 용어의 정의</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>서비스</strong>: Shell이 제공하는 모든 온라인 서비스를 의미합니다.</li>
                <li><strong>이용자</strong>: 서비스에 접속하여 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 의미합니다.</li>
                <li><strong>콘텐츠</strong>: 서비스를 통해 제공되는 모든 정보, 데이터, 텍스트, 이미지 등을 의미합니다.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 서비스의 제공 및 변경</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                서비스는 다음과 같은 서비스를 제공합니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>AI 기반 검색 서비스</li>
                <li>콘텐츠 생성 도구</li>
                <li>원격 지원 솔루션</li>
                <li>기타 서비스가 추가로 제공하는 일체의 서비스</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                서비스는 필요한 경우 서비스의 내용을 변경할 수 있으며, 변경 시 사전에 공지합니다.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-blue-600" />
                4. 이용자의 의무
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                이용자는 다음 행위를 하여서는 안 됩니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>타인의 정보 도용</li>
                <li>서비스에 게시된 정보의 변경</li>
                <li>서비스가 정한 정보 이외의 정보(컴퓨터 프로그램 등)의 송신 또는 게시</li>
                <li>서비스 및 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>서비스 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                <li>외설 또는 폭력적인 메시지, 화상, 음성 기타 공서양속에 반하는 정보를 공개 또는 게시하는 행위</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 서비스의 중단</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                서비스는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
              </p>
              <p className="text-gray-700 leading-relaxed">
                서비스는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상합니다. 단, 서비스가 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 저작권의 귀속 및 이용제한</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                서비스가 작성한 저작물에 대한 저작권 기타 지적재산권은 서비스에 귀속합니다.
              </p>
              <p className="text-gray-700 leading-relaxed">
                이용자는 서비스를 이용함으로써 얻은 정보를 서비스의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. 면책조항</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                서비스는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                서비스는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.
              </p>
              <p className="text-gray-700 leading-relaxed">
                서비스는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. 준거법 및 관할법원</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                서비스와 이용자 간에 발생한 전자상거래 분쟁에 관한 소송은 제소 당시의 이용자의 주소에 의하고, 주소가 없는 경우에는 거소를 관할하는 지방법원의 전속관할로 합니다.
              </p>
              <p className="text-gray-700 leading-relaxed">
                서비스와 이용자 간에 발생한 분쟁에 관한 소송은 대한민국 법을 적용합니다.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
