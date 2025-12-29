import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold gradient-text mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-4">페이지를 찾을 수 없습니다</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>홈으로</span>
          </Link>
          <Link
            href="/#search"
            className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary transition-colors flex items-center space-x-2"
          >
            <Search className="w-5 h-5" />
            <span>검색하기</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

