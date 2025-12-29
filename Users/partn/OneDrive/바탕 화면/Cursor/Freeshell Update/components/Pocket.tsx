'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, Play, Loader2, CheckCircle, XCircle, 
  FileText, Image, Film, Music, Download, 
  Sparkles, Zap, Settings, PlayCircle
} from 'lucide-react';
import { videoProductionEngine, VideoProductionConfig, FinalVideo } from '@/lib/video-production';

interface ProductionStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: any;
}

export default function Pocket() {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState<'animation' | 'realistic' | 'photo-restoration'>('animation');
  const [duration, setDuration] = useState(60);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [isProducing, setIsProducing] = useState(false);
  const [steps, setSteps] = useState<ProductionStep[]>([]);
  const [finalVideo, setFinalVideo] = useState<FinalVideo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const productionSteps = [
    { id: 'script', name: '대본 및 캐릭터 생성', icon: FileText },
    { id: 'images', name: '연출 장면 이미지 생성', icon: Image },
    { id: 'animation', name: '애니메이션 생성', icon: Film },
    { id: 'audio', name: '오디오 합성', icon: Music },
    { id: 'compose', name: '최종 영상 합성', icon: Video },
  ];

  const handleProduce = async () => {
    if (!topic.trim()) {
      setError('주제를 입력해주세요.');
      return;
    }

    setIsProducing(true);
    setError(null);
    setFinalVideo(null);

    // 초기 단계 설정
    const initialSteps: ProductionStep[] = productionSteps.map(step => ({
      id: step.id,
      name: step.name,
      status: 'pending',
      progress: 0,
    }));
    setSteps(initialSteps);

    try {
      const config: VideoProductionConfig = {
        topic,
        style,
        duration,
        aspectRatio,
      };

      // 전체 프로세스 실행
      const result = await videoProductionEngine.produceVideo(config);

      setFinalVideo(result);
      
      // 모든 단계 완료 표시
      setSteps(prev => prev.map(step => ({
        ...step,
        status: 'completed',
        progress: 100,
      })));
    } catch (err: any) {
      console.error('영상 제작 오류:', err);
      setError(err.message || '영상 제작 중 오류가 발생했습니다.');
      
      // 오류 발생한 단계 표시
      setSteps(prev => prev.map(step => ({
        ...step,
        status: step.status === 'processing' ? 'error' : step.status,
      })));
    } finally {
      setIsProducing(false);
    }
  };

  const getStepIcon = (step: ProductionStep) => {
    const stepInfo = productionSteps.find(s => s.id === step.id);
    const Icon = stepInfo?.icon || FileText;

    if (step.status === 'processing') {
      return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    } else if (step.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (step.status === 'error') {
      return <XCircle className="w-5 h-5 text-red-500" />;
    } else {
      return <Icon className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        {/* 헤더 */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">포켓 - 올인원 동영상 제작</h2>
            <p className="text-gray-600 dark:text-gray-400">YouTube/SNS용 동영상을 AI로 자동 생성</p>
          </div>
        </div>

        {/* 설정 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium mb-2">주제</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="예: AI 기술의 미래"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isProducing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">스타일</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as any)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isProducing}
            >
              <option value="animation">3D 애니메이션 (픽사 스타일)</option>
              <option value="realistic">실사형</option>
              <option value="photo-restoration">사진 복원형</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">길이 (초)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min={10}
              max={300}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isProducing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">비율</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as any)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isProducing}
            >
              <option value="16:9">16:9 (YouTube)</option>
              <option value="9:16">9:16 (Shorts/Reels)</option>
              <option value="1:1">1:1 (Instagram)</option>
            </select>
          </div>
        </div>

        {/* 제작 버튼 */}
        <button
          onClick={handleProduce}
          disabled={isProducing || !topic.trim()}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold text-lg"
        >
          {isProducing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>영상 제작 중...</span>
            </>
          ) : (
            <>
              <PlayCircle className="w-5 h-5" />
              <span>영상 제작 시작</span>
            </>
          )}
        </button>

        {/* 진행 단계 */}
        <AnimatePresence>
          {steps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-4"
            >
              <h3 className="text-lg font-semibold mb-4">제작 진행 상황</h3>
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStepIcon(step)}
                      <span className="font-medium">{step.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      step.status === 'completed'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : step.status === 'processing'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : step.status === 'error'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {step.status === 'completed' ? '완료' : 
                       step.status === 'processing' ? '진행 중' : 
                       step.status === 'error' ? '오류' : '대기'}
                    </span>
                  </div>
                  {step.status === 'processing' && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 오류 메시지 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* 최종 영상 */}
        {finalVideo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <h3 className="text-lg font-semibold mb-4">제작 완료!</h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="aspect-video mb-4 bg-black rounded-lg overflow-hidden">
                <video
                  src={finalVideo.videoUrl}
                  controls
                  className="w-full h-full"
                  poster={finalVideo.thumbnail}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">스타일</p>
                  <p className="font-medium">{finalVideo.metadata.style}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">길이</p>
                  <p className="font-medium">{finalVideo.metadata.totalDuration}초</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">장면 수</p>
                  <p className="font-medium">{finalVideo.scenes.length}개</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">오디오 트랙</p>
                  <p className="font-medium">{finalVideo.audio.length}개</p>
                </div>
              </div>

              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = finalVideo.videoUrl;
                  link.download = `${topic}-video.mp4`;
                  link.click();
                }}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>영상 다운로드</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

