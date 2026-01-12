/**
 * 제작 시작 및 3D 로딩 화면
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Loading3D from '@/components/Loading3D';

export default function GeneratePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('웹사이트를 생성하고 있습니다...');

  useEffect(() => {
    const templateId = searchParams.get('template');
    const prompts = searchParams.get('prompts');

    // AI 생성 시도
    const generateWithAI = async () => {
      try {
        const response = await fetch('/api/ai/build', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: prompts }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.files && data.files.length > 0) {
            // AI 생성 성공 - 에디터로 이동
            const filesData = encodeURIComponent(JSON.stringify(data.files));
            router.push(`/editor?files=${filesData}&aiSuccess=true`);
            return;
          }
        }
      } catch (error) {
        console.error('AI 생성 실패:', error);
      }
      
      // AI 실패 시 즉시 템플릿으로 폴백 (사용자 대기 시간 최소화)
      if (templateId) {
        // 템플릿이 있으면 바로 에디터로 이동
        router.push(`/editor?template=${templateId}&aiFailed=true&fallback=template`);
      } else {
        // 템플릿도 없으면 폴백 페이지로 이동
        router.push(`/build/step2/fallback?query=${encodeURIComponent(prompts || '')}&aiFailed=true`);
      }
    };

    // 진행률 시뮬레이션
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 50) {
          // 50%에서 AI 생성 시도
          if (prev === 50) {
            generateWithAI();
          }
        }
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    // 메시지 변경
    const messageInterval = setInterval(() => {
      const messages = [
        'AI가 요구사항을 분석하고 있습니다...',
        '최적의 템플릿을 선택하고 있습니다...',
        '코드를 생성하고 있습니다...',
        '스타일을 적용하고 있습니다...',
        '최종 확인 중입니다...',
      ];
      const index = Math.floor((progress / 100) * messages.length);
      if (index < messages.length) {
        setMessage(messages[index]);
      }
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(messageInterval);
    };
  }, [router, searchParams, progress]);

  return <Loading3D progress={progress} message={message} mode="random" />;
}
