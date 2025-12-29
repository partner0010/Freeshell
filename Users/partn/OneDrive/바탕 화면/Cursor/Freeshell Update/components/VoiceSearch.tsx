'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceSearchProps {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
}

export default function VoiceSearch({ onTranscript, onError }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // 브라우저 지원 확인
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'ko-KR';

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          setTranscript(transcript);
          
          if (event.results[current].isFinal) {
            onTranscript(transcript);
            setIsListening(false);
          }
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          setIsListening(false);
          onError?.(event.error);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [onTranscript, onError]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript('');
      } catch (error) {
        console.error('음성 인식 시작 실패:', error);
        onError?.('음성 인식을 시작할 수 없습니다.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        음성 검색은 Chrome, Edge, Safari에서 지원됩니다.
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="text-sm text-gray-600 dark:text-gray-400 italic"
          >
            &quot;{transcript}&quot;
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={isListening ? stopListening : startListening}
        className={`p-2 rounded-lg transition-all ${
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
        title={isListening ? '음성 인식 중지' : '음성 검색 시작'}
      >
        {isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}

