'use client';

import ContentCreationGuide from '@/components/ContentCreationGuide';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContentGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <ContentCreationGuide />
      </main>
      <Footer />
    </div>
  );
}

