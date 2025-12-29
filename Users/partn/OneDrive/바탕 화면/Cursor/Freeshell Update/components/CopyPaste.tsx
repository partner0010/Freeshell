'use client';

import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { showSuccess, showError } from './ToastNotifications';

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showSuccess('클립보드에 복사되었습니다');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showError('복사에 실패했습니다');
    }
  };

  return { copied, copy };
}

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className = '' }: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <button
      onClick={() => copy(text)}
      className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors ${className}`}
      title="복사"
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
}

export function usePasteFromClipboard() {
  const [pasted, setPasted] = useState(false);

  const paste = async (): Promise<string | null> => {
    try {
      const text = await navigator.clipboard.readText();
      setPasted(true);
      setTimeout(() => setPasted(false), 1000);
      return text;
    } catch (err) {
      showError('붙여넣기에 실패했습니다');
      return null;
    }
  };

  return { pasted, paste };
}

