'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-6">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              개인정보 보호정책
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
                1. 개인정보의 처리 목적
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Shell(이하 &quot;서비스&quot;)는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>서비스 제공 및 계약의 이행</li>
                <li>회원 관리 및 본인 확인</li>
                <li>서비스 개선 및 신규 서비스 개발</li>
                <li>고객 문의 및 불만 처리</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-blue-600" />
                2. 수집하는 개인정보의 항목
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                서비스는 다음의 개인정보 항목을 처리하고 있습니다:
              </p>
              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">필수 항목</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>서비스 이용 기록 (검색어, 접속 로그 등)</li>
                  <li>기기 정보 (브라우저 종류, OS 정보 등)</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">선택 항목</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>이메일 주소 (고객 지원 시)</li>
                  <li>이름 (고객 지원 시)</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-blue-600" />
                3. 개인정보의 보유 및 이용 기간
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                서비스는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>서비스 이용 기록: 서비스 이용 종료 시까지</li>
                <li>고객 문의 기록: 문의 처리 완료 후 3년</li>
                <li>법령에 따라 보존이 필요한 경우: 해당 법령에서 정한 기간</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. 개인정보의 제3자 제공</h2>
              <p className="text-gray-700 leading-relaxed">
                서비스는 원칙적으로 정보주체의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                <li>정보주체가 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 정보주체의 권리·의무 및 행사방법</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                정보주체는 다음과 같은 권리를 행사할 수 있습니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>개인정보 열람 요구</li>
                <li>개인정보 정정·삭제 요구</li>
                <li>개인정보 처리정지 요구</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                위 권리 행사는 서비스에 대해 서면, 전자우편 등을 통하여 하실 수 있으며, 서비스는 이에 대해 지체 없이 조치하겠습니다.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 개인정보의 파기</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                서비스는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">파기 방법</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>전자적 파일 형태: 복구 및 재생되지 않도록 안전하게 삭제</li>
                  <li>기록물, 인쇄물, 서면 등: 분쇄하거나 소각</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. 개인정보 보호책임자</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700">
                  <strong>개인정보 보호책임자</strong><br />
                  이메일: privacy@shell.com<br />
                  연락처: 고객 지원 페이지를 통해 문의해주세요.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. 개인정보 처리방침 변경</h2>
              <p className="text-gray-700 leading-relaxed">
                이 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
