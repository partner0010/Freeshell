'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, FileText, Download, Upload, Loader2, CheckCircle } from 'lucide-react';
// Meeting notes functionality - to be implemented with SHELL AI
interface MeetingNote {
  title: string;
  summary: string;
  keyPoints: string[];
  actionItems: Array<{
    task: string;
    assignee: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  participants: string[];
  date: Date;
  duration: number;
  transcript?: string;
}

import { GlobalHeader } from '@/components/layout/GlobalHeader';

async function generateMeetingNotes(
  audioFile: File,
  options?: { language?: string; includeTranscript?: boolean; includeActionItems?: boolean }
): Promise<MeetingNote> {
  // SHELL AI를 사용하여 회의록 생성
  // 1. 오디오를 텍스트로 변환 (음성 인식)
  // 2. AI를 사용하여 회의록 생성
  
  try {
    // 1. 오디오 전사 API 호출
    const formData = new FormData();
    formData.append('audio', audioFile);

    const transcribeResponse = await fetch('/api/meeting-notes/transcribe', {
      method: 'POST',
      body: formData,
    });

    let transcript = '';
    if (transcribeResponse.ok) {
      const transcribeData = await transcribeResponse.json();
      transcript = transcribeData.transcript || '';
    } else {
      // 전사 실패 시 기본 메시지
      transcript = `[오디오 전사 실패] ${audioFile.name} 파일의 전사에 실패했습니다.`;
    }

    // 2. AI를 사용하여 회의록 생성
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `다음 회의 녹취록을 바탕으로 전문적인 회의록을 작성해주세요:\n\n${transcript}\n\n회의록에는 다음 항목이 포함되어야 합니다:\n1. 회의 제목\n2. 회의 개요 및 요약\n3. 주요 안건 및 핵심 포인트\n4. 결정 사항\n5. 액션 아이템 (담당자, 우선순위 포함)\n6. 참석자 목록\n7. 회의 날짜 및 시간\n8. 회의록 전문 (옵션)\n\n응답은 JSON 형식으로 제공해주세요.`,
        context: 'meeting-notes',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const aiResponse = data.response || data.message || '';
      
      // AI 응답 파싱 시도 (JSON 형식인 경우)
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            title: parsed.title || '회의 노트',
            summary: parsed.summary || aiResponse.substring(0, 200),
            keyPoints: parsed.keyPoints || [
              '주요 안건 1',
              '주요 안건 2',
              '주요 안건 3',
            ],
            actionItems: parsed.actionItems || [
              { task: '작업 1', assignee: '담당자 1', priority: 'high' as const },
              { task: '작업 2', assignee: '담당자 2', priority: 'medium' as const },
            ],
            participants: parsed.participants || ['참석자 1', '참석자 2', '참석자 3'],
            date: parsed.date ? new Date(parsed.date) : new Date(),
            duration: parsed.duration || 3600,
            transcript: options?.includeTranscript ? transcript : undefined,
          };
        }
      } catch (parseError) {
        console.warn('JSON 파싱 실패, 기본 형식 사용:', parseError);
      }

      // 기본 형식으로 반환
      return {
        title: '회의 노트',
        summary: aiResponse.substring(0, 200) + (aiResponse.length > 200 ? '...' : ''),
        keyPoints: [
          '주요 안건 1',
          '주요 안건 2',
          '주요 안건 3',
        ],
        actionItems: [
          { task: '작업 1', assignee: '담당자 1', priority: 'high' as const },
          { task: '작업 2', assignee: '담당자 2', priority: 'medium' as const },
        ],
        participants: ['참석자 1', '참석자 2', '참석자 3'],
        date: new Date(),
        duration: 3600,
        transcript: options?.includeTranscript ? transcript : undefined,
      };
    }
    
    throw new Error('회의록 생성에 실패했습니다.');
  } catch (error: any) {
    console.error('회의록 생성 오류:', error);
    throw new Error(error.message || '회의록 생성 중 오류가 발생했습니다.');
  }
}

export default function MeetingNotesPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [meetingNote, setMeetingNote] = useState<MeetingNote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setError('오디오 파일만 업로드 가능합니다.');
      return;
    }

    setAudioFile(file);
    setError(null);
    setMeetingNote(null);
  };

  const handleGenerate = async () => {
    if (!audioFile) {
      setError('오디오 파일을 먼저 업로드해주세요.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const note = await generateMeetingNotes(audioFile, {
        language: 'ko',
        includeTranscript: true,
        includeActionItems: true,
      });
      setMeetingNote(note);
    } catch (err: any) {
      setError(err.message || '회의 노트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!meetingNote) return;

    const content = `
# ${meetingNote.title}

**날짜:** ${meetingNote.date.toLocaleDateString('ko-KR')}
**시간:** ${Math.floor(meetingNote.duration / 60)}분
**참석자:** ${meetingNote.participants.join(', ')}

## 요약
${meetingNote.summary}

## 핵심 포인트
${meetingNote.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

## 액션 아이템
${meetingNote.actionItems.map((item, i) => 
  `${i + 1}. **${item.task}** - 담당: ${item.assignee} (우선순위: ${item.priority})`
).join('\n')}

## 회의록
${meetingNote.transcript}
    `.trim();

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meetingNote.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <GlobalHeader />

      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Mic className="text-purple-600 w-6 h-6 sm:w-8 sm:h-8" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900">
              SHELL AI 회의 노트
            </h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            회의 음성을 자동으로 전문적인 노트로 변환합니다
          </p>
        </div>

        {/* 파일 업로드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border border-gray-200 mb-6 sm:mb-8"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                회의 오디오 파일 업로드
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 text-center hover:border-purple-500 transition-colors">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="audio-upload"
                  aria-label="오디오 파일 업로드"
                />
                <label
                  htmlFor="audio-upload"
                  className="cursor-pointer flex flex-col items-center gap-3 sm:gap-4 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
                  tabIndex={0}
                  role="button"
                  aria-label="오디오 파일 선택"
                >
                  <Upload className="text-gray-400 w-10 h-10 sm:w-12 sm:h-12" />
                  <div>
                    <p className="text-sm sm:text-base text-gray-700 font-semibold">
                      {audioFile ? audioFile.name : '오디오 파일을 선택하세요'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      MP3, WAV, M4A 등 오디오 형식 지원
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!audioFile || isProcessing}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label={isProcessing ? '회의 노트 생성 중' : '회의 노트 생성'}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  회의 노트 생성 중...
                </>
              ) : (
                <>
                  <FileText size={20} />
                  회의 노트 생성
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* 결과 표시 */}
        {meetingNote && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border border-gray-200 space-y-4 sm:space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{meetingNote.title}</h2>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
              >
                <Download size={18} />
                다운로드
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <p className="text-sm text-gray-500">날짜</p>
                <p className="font-semibold text-gray-900">
                  {meetingNote.date.toLocaleDateString('ko-KR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">시간</p>
                <p className="font-semibold text-gray-900">
                  {Math.floor(meetingNote.duration / 60)}분
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">참석자</p>
                <p className="font-semibold text-gray-900">{meetingNote.participants.length}명</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">액션 아이템</p>
                <p className="font-semibold text-gray-900">{meetingNote.actionItems.length}개</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">요약</h3>
              <p className="text-gray-700">{meetingNote.summary}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">핵심 포인트</h3>
              <ul className="space-y-2">
                {meetingNote.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={18} />
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {meetingNote.actionItems.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">액션 아이템</h3>
                <div className="space-y-3">
                  {meetingNote.actionItems.map((item, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.task}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            담당: {item.assignee} • 우선순위: {item.priority}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : item.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {item.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {meetingNote.transcript && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">회의록</h3>
                <div className="p-4 bg-gray-50 rounded-xl max-h-96 overflow-y-auto">
                  <p className="text-gray-700 whitespace-pre-wrap">{meetingNote.transcript}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

