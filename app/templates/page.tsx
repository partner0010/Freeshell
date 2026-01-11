/**
 * 템플릿 라이브러리 전용 페이지
 */
'use client';

import TemplateLibrary from '@/components/TemplateLibrary';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <Navbar />
      <TemplateLibrary />
      <Footer />
    </main>
  );
}
