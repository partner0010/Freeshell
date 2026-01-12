/**
 * 웹/앱 에디터 페이지
 * 직접 에디터를 사용할 수 있는 페이지
 */
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import WebsiteEditor from '@/components/WebsiteEditor';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthRequired from '@/components/AuthRequired';
import { checkAuth } from '@/lib/utils/auth-check';

export default function EditorPage() {
  const searchParams = useSearchParams();
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [initialFiles, setInitialFiles] = useState<Array<{ name: string; type: string; content: string }>>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    checkAuth().then(authState => {
      setIsAuthenticated(authState.isAuthenticated);
      setIsChecking(false);
    });
  }, []);

  useEffect(() => {
    const id = searchParams.get('template');
    const filesParam = searchParams.get('files');
    const aiFailed = searchParams.get('aiFailed');
    
    if (id) {
      setTemplateId(id);
    }
    
    if (filesParam) {
      try {
        const files = JSON.parse(decodeURIComponent(filesParam));
        if (Array.isArray(files)) {
          setInitialFiles(files);
        }
      } catch (error) {
        console.error('파일 파싱 실패:', error);
      }
    }

    // AI 실패 알림 (더 사용자 친화적으로)
    if (aiFailed === 'true') {
      setTimeout(() => {
        // 토스트 메시지로 표시 (alert 대신)
        const event = new CustomEvent('show-toast', {
          detail: {
            type: 'info',
            message: 'AI 생성에 실패했습니다. 선택하신 템플릿으로 에디터를 열었습니다. 템플릿을 수정하여 사용하실 수 있습니다.',
            duration: 5000,
          },
        });
        window.dispatchEvent(event);
      }, 1000);
    }

    // AI 성공 알림
    if (searchParams.get('aiSuccess') === 'true') {
      setTimeout(() => {
        const event = new CustomEvent('show-toast', {
          detail: {
            type: 'success',
            message: 'AI가 웹사이트를 성공적으로 생성했습니다!',
            duration: 3000,
          },
        });
        window.dispatchEvent(event);
      }, 500);
    }
  }, [searchParams]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">확인 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <AuthRequired 
          message="에디터를 사용하려면 회원가입이 필요합니다."
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-screen">
        <WebsiteEditor 
          initialTemplateId={templateId} 
          initialFiles={initialFiles.length > 0 ? initialFiles : undefined}
        />
      </div>
    </div>
  );
}
