"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

// 생성 단계 타입
export type GenerationStage =
  | "analyzing"
  | "generating_images"
  | "generating_audio"
  | "composing_video"
  | "completed"
  | "failed";

// 단계 정보
interface StageInfo {
  id: GenerationStage;
  label: string;
  icon: string;
}

const STAGES: StageInfo[] = [
  { id: "analyzing", label: "프롬프트 분석", icon: "📝" },
  { id: "generating_images", label: "이미지 생성", icon: "🎨" },
  { id: "generating_audio", label: "오디오 생성", icon: "🎵" },
  { id: "composing_video", label: "비디오 합성", icon: "🎬" },
];

// 진행률 정보
export interface GenerationProgressData {
  stage: GenerationStage;
  progress: number; // 0-100
  currentStageProgress?: number; // 현재 단계 내 진행률
  estimatedTimeRemaining?: number; // 초
  error?: string;
  stageDetails?: {
    current?: number;
    total?: number;
    message?: string;
  };
}

interface GenerationProgressProps {
  jobId: string;
  onCancel?: () => void;
  onRetry?: () => void;
  onComplete?: () => void;
  className?: string;
}

export default function GenerationProgress({
  jobId,
  onCancel,
  onRetry,
  onComplete,
  className,
}: GenerationProgressProps) {
  const [progressData, setProgressData] = useState<GenerationProgressData | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  // API 상태를 단계로 매핑
  const mapStatusToStage = (status: string, stageData?: any): GenerationStage => {
    if (status === "completed") return "completed";
    if (status === "failed") return "failed";
    
    // stageData에서 현재 단계 정보 추출 (실제 API 응답 구조에 맞춰 조정 필요)
    if (stageData?.stage) {
      return stageData.stage as GenerationStage;
    }
    
    // 진행률에 따라 단계 추정
    // 실제로는 API에서 명확한 stage 정보를 받아야 함
    return "generating_images"; // 기본값
  };

  // 진행률 폴링
  useEffect(() => {
    if (!isPolling || !jobId) return;

    const pollProgress = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const response = await fetch(`${apiBaseUrl}/api/v1/content/status/${jobId}`);
        
        if (!response.ok) {
          throw new Error("진행률 조회 실패");
        }

        const data = await response.json();
        
        // API 응답을 GenerationProgressData로 변환
        const progressData: GenerationProgressData = {
          stage: mapStatusToStage(data.status, data),
          progress: data.progress || 0,
          currentStageProgress: data.current_stage_progress,
          estimatedTimeRemaining: data.estimated_time_remaining,
          error: data.error,
          stageDetails: data.stage_details || data.data,
        };

        setProgressData(progressData);

        // 완료 또는 실패 시 폴링 중지
        if (progressData.stage === "completed" || progressData.stage === "failed") {
          setIsPolling(false);
          if (progressData.stage === "completed" && onComplete) {
            onComplete();
          }
        }
      } catch (error) {
        console.error("Failed to fetch progress:", error);
        setProgressData((prev) => ({
          ...prev!,
          stage: "failed",
          error: error instanceof Error ? error.message : "진행률 조회 실패",
        }));
        setIsPolling(false);
      }
    };

    // 초기 로드
    pollProgress();

    // 주기적 폴링 (2초마다)
    const interval = setInterval(pollProgress, 2000);

    return () => clearInterval(interval);
  }, [jobId, isPolling, onComplete]);

  // 취소 처리
  const handleCancel = async () => {
    if (!confirm("정말 생성 작업을 취소하시겠습니까?")) return;

    setIsCancelling(true);
    try {
      // 실제로는 API 호출
      // await fetch(`/api/v1/content/${jobId}/cancel`, { method: "POST" });
      setIsPolling(false);
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error("Failed to cancel:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  // 재시도 처리
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  // 단계 인덱스
  const getStageIndex = (stage: GenerationStage): number => {
    return STAGES.findIndex((s) => s.id === stage);
  };

  // 단계 상태
  const getStageStatus = (stageIndex: number, currentStage: GenerationStage): "completed" | "active" | "pending" => {
    const currentIndex = getStageIndex(currentStage);
    if (stageIndex < currentIndex) return "completed";
    if (stageIndex === currentIndex) return "active";
    return "pending";
  };

  // 시간 포맷팅
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}초`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${minutes}분 ${secs}초` : `${minutes}분`;
  };

  if (!progressData) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Spinner size="lg" label="진행률 정보를 불러오는 중..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isCompleted = progressData.stage === "completed";
  const isFailed = progressData.stage === "failed";

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>콘텐츠 생성 진행 중</CardTitle>
          {!isCompleted && !isFailed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? "취소 중..." : "취소"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 전체 진행률 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-neutral-700">전체 진행률</span>
            <span className="text-neutral-600">{progressData.progress}%</span>
          </div>
          <Progress value={progressData.progress} className="h-2" />
        </div>

        {/* 예상 남은 시간 */}
        {progressData.estimatedTimeRemaining && !isCompleted && !isFailed && (
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>예상 남은 시간: {formatTime(progressData.estimatedTimeRemaining)}</span>
          </div>
        )}

        {/* 단계별 진행률 */}
        <div className="space-y-3">
          {STAGES.map((stage, index) => {
            const status = getStageStatus(index, progressData.stage);
            const isActive = status === "active";
            const isCompleted = status === "completed";
            const isPending = status === "pending";

            return (
              <div
                key={stage.id}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-md border transition-all duration-fast",
                  isActive && "bg-primary-50 border-primary-200",
                  isCompleted && "bg-success-50 border-success-200",
                  isPending && "bg-neutral-50 border-neutral-200"
                )}
              >
                {/* 아이콘 */}
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                  {isCompleted ? (
                    <div className="w-8 h-8 rounded-full bg-success-500 flex items-center justify-center animate-checkmark">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  ) : isActive ? (
                    <div className="relative w-8 h-8">
                      <Spinner size="sm" className="absolute inset-0" />
                      <span className="absolute inset-0 flex items-center justify-center text-lg pointer-events-none">
                        {stage.icon}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl opacity-50">{stage.icon}</span>
                  )}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isActive && "text-primary-700",
                        isCompleted && "text-success-700",
                        isPending && "text-neutral-500"
                      )}
                    >
                      {stage.label}
                    </span>
                    {isActive && progressData.currentStageProgress !== undefined && (
                      <span className="text-xs text-neutral-600">
                        {progressData.currentStageProgress}%
                      </span>
                    )}
                  </div>

                  {/* 현재 단계 진행률 바 */}
                  {isActive && progressData.currentStageProgress !== undefined && (
                    <Progress
                      value={progressData.currentStageProgress}
                      className="h-1.5"
                    />
                  )}

                  {/* 단계 상세 정보 */}
                  {isActive && progressData.stageDetails?.message && (
                    <p className="text-xs text-neutral-600 mt-1">
                      {progressData.stageDetails.message}
                    </p>
                  )}

                  {/* 완료 메시지 */}
                  {isCompleted && (
                    <p className="text-xs text-success-600 mt-1">완료</p>
                  )}

                  {/* 대기 메시지 */}
                  {isPending && (
                    <p className="text-xs text-neutral-500 mt-1">대기 중</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 에러 메시지 */}
        {isFailed && progressData.error && (
          <div className="p-4 rounded-md border-l-4 border-error-500 bg-error-50">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-error-700">생성 실패</p>
                <p className="text-sm text-error-600 mt-1">{progressData.error}</p>
                {onRetry && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleRetry}
                    className="mt-3"
                  >
                    재시도
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 완료 메시지 */}
        {isCompleted && (
          <div className="p-4 rounded-md border-l-4 border-success-500 bg-success-50">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-success-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-medium text-success-700">
                콘텐츠 생성이 완료되었습니다!
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <style jsx>{`
        @keyframes checkmark {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-checkmark {
          animation: checkmark 0.5s ease-out;
        }
      `}</style>
    </Card>
  );
}
