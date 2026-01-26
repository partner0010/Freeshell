"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { analyzePrompt, type PromptAnalyzeResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

const PLACEHOLDER_EXAMPLES = [
  "카페 브랜딩 감성 영상 만들어줘",
  "제품 소개 영상 스크립트 작성해줘",
  "회사 홍보 영상 기획안 만들어줘",
  "교육 콘텐츠 영상 대본 작성해줘",
];

export default function CreatePage() {
  const [prompt, setPrompt] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [contentType, setContentType] = useState<"short" | "long">("short");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PromptAnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      setError("프롬프트를 입력해주세요.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await analyzePrompt({
        text: prompt,
        type: contentType,
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const characterCount = prompt.length;
  const maxLength = 5000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* 그라디언트 배경 애니메이션 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        {/* 헤더 */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            스튜디오에서 제작하기
          </h1>
          <p className="text-lg text-neutral-600">
            아이디어를 입력하면 콘텐츠 계획을 제안하고 제작을 도와드립니다
          </p>
        </div>

        {/* 메인 입력 영역 */}
        <Card className="mb-8 shadow-lg animate-slide-up">
          <CardHeader>
            <CardTitle>프롬프트 입력</CardTitle>
            <CardDescription>
              원하는 콘텐츠에 대한 설명을 자세히 입력해주세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 대형 텍스트 입력 영역 */}
            <div className="space-y-2">
              <label htmlFor="prompt" className="text-sm font-medium text-neutral-700">
                프롬프트
              </label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setError(null);
                }}
                placeholder={PLACEHOLDER_EXAMPLES[Math.floor(Math.random() * PLACEHOLDER_EXAMPLES.length)]}
                className="min-h-[200px] text-base resize-none"
                maxLength={maxLength}
              />
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>
                  {characterCount > maxLength * 0.9 && (
                    <span className="text-warning-500 font-medium">
                      {maxLength - characterCount}자 남음
                    </span>
                  )}
                </span>
                <span className={cn(characterCount > maxLength * 0.9 && "text-warning-500")}>
                  {characterCount} / {maxLength}
                </span>
              </div>
            </div>

            {/* URL 입력 옵션 */}
            <div className="space-y-2">
              <label htmlFor="referenceUrl" className="text-sm font-medium text-neutral-700">
                참고 자료 URL (선택사항)
              </label>
              <Input
                id="referenceUrl"
                type="url"
                value={referenceUrl}
                onChange={(e) => setReferenceUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full"
              />
              <p className="text-xs text-neutral-500">
                참고할 웹페이지나 리소스의 URL을 입력하세요
              </p>
            </div>

            {/* 콘텐츠 타입 선택 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">콘텐츠 타입</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setContentType("short")}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-md border-2 transition-all duration-fast",
                    contentType === "short"
                      ? "border-primary-500 bg-primary-50 text-primary-700 font-semibold shadow-sm"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                  )}
                >
                  <div className="text-lg font-semibold mb-1">숏폼</div>
                  <div className="text-xs text-neutral-500">15-60초 영상</div>
                </button>
                <button
                  type="button"
                  onClick={() => setContentType("long")}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-md border-2 transition-all duration-fast",
                    contentType === "long"
                      ? "border-primary-500 bg-primary-50 text-primary-700 font-semibold shadow-sm"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                  )}
                >
                  <div className="text-lg font-semibold mb-1">롱폼</div>
                  <div className="text-xs text-neutral-500">60초 이상 영상</div>
                </button>
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="rounded-md border-l-4 border-error-500 bg-error-500/10 px-4 py-3 text-sm text-error-600 animate-fade-in">
                {error}
              </div>
            )}

            {/* 분석 버튼 */}
            <Button
              onClick={handleAnalyze}
              disabled={!prompt.trim() || isAnalyzing}
              loading={isAnalyzing}
              loadingLabel="분석 중..."
              size="lg"
              className="w-full"
            >
              {isAnalyzing ? "분석 중..." : "분석 시작"}
            </Button>
          </CardContent>
        </Card>

        {/* 로딩 애니메이션 */}
        {isAnalyzing && (
          <Card className="mb-8 shadow-lg animate-fade-in">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <Spinner size="lg" label="프롬프트를 분석하고 있습니다..." />
                <p className="text-sm text-neutral-600 text-center">
                  AI가 프롬프트를 분석하고 콘텐츠 계획을 생성하는 중입니다.
                  <br />
                  잠시만 기다려주세요...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 분석 결과 프리뷰 */}
        {result && !isAnalyzing && (
          <div className="space-y-6 animate-fade-in">
            {/* 분석 결과 카드 */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>분석 결과</CardTitle>
                <CardDescription>프롬프트 분석 결과입니다</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-neutral-500 mb-1">주제</p>
                    <p className="text-base font-semibold text-neutral-900">{result.analysis.topic}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500 mb-1">톤</p>
                    <p className="text-base font-semibold text-neutral-900">{result.analysis.tone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500 mb-1">제안 길이</p>
                    <p className="text-base font-semibold text-neutral-900">
                      {result.analysis.suggested_duration}초
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500 mb-1">콘텐츠 타입</p>
                    <p className="text-base font-semibold text-neutral-900">
                      {result.analysis.content_type}
                    </p>
                  </div>
                </div>
                {result.analysis.keywords.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-neutral-500 mb-2">키워드</p>
                    <div className="flex flex-wrap gap-2">
                      {result.analysis.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result.analysis.intent && (
                  <div>
                    <p className="text-xs font-medium text-neutral-500 mb-1">의도</p>
                    <p className="text-sm text-neutral-700">{result.analysis.intent}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 계획 카드 */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>{result.plan.title || "콘텐츠 계획"}</CardTitle>
                {result.plan.description && (
                  <CardDescription>{result.plan.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 시각적 스타일 */}
                <div>
                  <p className="text-sm font-medium text-neutral-700 mb-2">시각적 스타일</p>
                  <p className="text-sm text-neutral-600">{result.plan.visual_style}</p>
                </div>

                {/* 씬 목록 */}
                {result.plan.scenes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-neutral-700 mb-3">씬 구성</p>
                    <div className="space-y-3">
                      {result.plan.scenes.map((scene) => (
                        <div
                          key={scene.scene_number}
                          className="p-4 rounded-md border border-neutral-200 bg-neutral-50"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-semibold text-neutral-900">
                              씬 {scene.scene_number}
                            </h4>
                            <span className="text-xs text-neutral-500">{scene.duration}초</span>
                          </div>
                          <p className="text-sm text-neutral-700 mb-2">{scene.description}</p>
                          {scene.visual_elements.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-neutral-500 mb-1">
                                시각적 요소
                              </p>
                              <ul className="list-disc list-inside text-xs text-neutral-600 space-y-1">
                                {scene.visual_elements.map((element, idx) => (
                                  <li key={idx}>{element}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 스크립트 아웃라인 */}
                {result.plan.script_outline && (
                  <div>
                    <p className="text-sm font-medium text-neutral-700 mb-2">스크립트 아웃라인</p>
                    <div className="p-4 rounded-md border border-neutral-200 bg-neutral-50">
                      <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-sans">
                        {result.plan.script_outline}
                      </pre>
                    </div>
                  </div>
                )}

                {/* 추가 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
                  {result.plan.total_duration && (
                    <div>
                      <p className="text-xs font-medium text-neutral-500 mb-1">총 길이</p>
                      <p className="text-sm font-semibold text-neutral-900">
                        {result.plan.total_duration}초
                      </p>
                    </div>
                  )}
                  {result.plan.music_suggestion && (
                    <div>
                      <p className="text-xs font-medium text-neutral-500 mb-1">음악 제안</p>
                      <p className="text-sm text-neutral-700">{result.plan.music_suggestion}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
