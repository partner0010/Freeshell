/**
 * 웹사이트/앱 템플릿 갤러리 페이지
 */
'use client';

import WebsiteTemplateGallery from '@/components/WebsiteTemplateGallery';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function WebsiteTemplatesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <Navbar />
      <WebsiteTemplateGallery />
      <Footer />
    </main>
  );
}
