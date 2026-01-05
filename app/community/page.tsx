/**
 * 커뮤니티 페이지 - 프로젝트 갤러리
 */

'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectGallery from '@/components/ProjectGallery';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ProjectGallery />
        </div>
      </main>

      <Footer />
    </div>
  );
}

