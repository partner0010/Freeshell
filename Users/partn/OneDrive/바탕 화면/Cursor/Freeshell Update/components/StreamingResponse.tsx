'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface StreamingResponseProps {
  text: string;
  isStreaming?: boolean;
}

export default function StreamingResponse({ text, isStreaming = false }: StreamingResponseProps) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(text);
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 10); // 타이핑 효과 속도

    return () => clearInterval(interval);
  }, [text, isStreaming]);

  return (
    <div className="space-y-2">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="prose dark:prose-invert max-w-none"
      >
        {displayedText.split('\n').map((line, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {line || '\u00A0'}
          </motion.p>
        ))}
      </motion.div>
      {isStreaming && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-2 h-5 bg-primary ml-1"
        />
      )}
    </div>
  );
}

