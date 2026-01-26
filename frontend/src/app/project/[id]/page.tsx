"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// 프로젝트 타입 정의
interface Project {
  id: string;
  title: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  status: "completed" | "processing" | "failed" | "pending";
  created_at: string;
  duration?: number;
  assets?: {
    images: Array<{ id: string; url: string; type: string }>;
    audios: Array<{ id: string; url: string; type: string }>;
    scripts: Array<{ id: string; content: string; type: string }>;
  };
  analytics?: {
    views: number;
    downloads: number;
  };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSharing, setIsSharing] = useState(false);

  // 프로젝트 로드
  useEffect(() => {
    const loadProject = async () => {
      setIsLoading(true);
      // 실제로는 API 호출
      // const response = await fetch(`/api/v1/projects/${projectId}`);
      // const data = await response.json();

      // 예시 데이터
      const mockProject: Project = {
        id: projectId,
        title: "카페 브랜딩 영상",
        description: "따뜻하고 아늑한 카페 분위기를 담은 브랜딩 영상입니다.",
        video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnail_url: "https://picsum.photos/1920/1080?random=1",
        status: "completed",
        created_at: new Date().toISOString(),
        duration: 30,
        assets: {
          images: [
            { id: "img-1", url: "https://picsum.photos/800/600?random=1", type: "scene" },
            { id: "img-2", url: "https://picsum.photos/800/600?random=2", type: "scene" },
            { id: "img-3", url: "https://picsum.photos/800/600?random=3", type: "scene" },
          ],
          audios: [
            { id: "audio-1", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", type: "narration" },
          ],
          scripts: [
            { id: "script-1", content: "안녕하세요. 오늘은 특별한 카페를 소개합니다.", type: "narration" },
            { id: "script-2", content: "따뜻한 조명과 아늑한 분위기가 인상적입니다.", type: "narration" },
          ],
        },
        analytics: {
          views: 1234,
          downloads: 56,
        },
      };

      setProject(mockProject);
      setIsLoading(false);
    };

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  // 공유 링크 복사
  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/project/${projectId}`;
      await navigator.clipboard.writeText(shareUrl);
      setIsSharing(true);
      setTimeout(() => setIsSharing(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  // 다운로드
  const handleDownload = () => {
    if (project?.video_url) {
      window.open(project.video_url, "_blank");
    }
  };

  // 삭제
  const handleDelete = async () => {
    if (confirm("정말 이 프로젝트를 삭제하시겠습니까?")) {
      // 실제로는 API 호출
      // await fetch(`/api/v1/projects/${projectId}`, { method: "DELETE" });
      router.push("/dashboard");
    }
  };

  const navItems = [
    { label: "대시보드", href: "/dashboard", icon: "📊" },
    { label: "스튜디오", href: "/create", icon: "🎨" },
    { label: "라이브러리", href: "/library", icon: "📚" },
    { label: "피드", href: "/feed", icon: "🌐" },
    { label: "전문가", href: "/experts", icon: "👥" },
  ];

  if (isLoading) {
    return (
      <DashboardLayout navItems={navItems}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
            <p className="mt-4 text-neutral-600">프로젝트를 불러오는 중...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout navItems={navItems}>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-neutral-600">프로젝트를 찾을 수 없습니다.</p>
            <Button onClick={() => router.push("/dashboard")} className="mt-4">
              대시보드로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-neutral-900">{project.title}</h1>
            {project.description && (
              <p className="text-neutral-600 mt-2">{project.description}</p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm text-neutral-500">
              <span>생성일: {new Date(project.created_at).toLocaleDateString("ko-KR")}</span>
              {project.duration && <span>• 길이: {project.duration}초</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleShare}>
              {isSharing ? "복사됨!" : "공유"}
            </Button>
            <Button variant="ghost" onClick={handleDownload}>
              다운로드
            </Button>
            <Button variant="ghost" onClick={() => router.push(`/project/${projectId}/edit`)}>
              편집
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              삭제
            </Button>
          </div>
        </div>

        {/* 비디오 플레이어 */}
        <Card>
          <CardContent className="p-0">
            <div className="relative aspect-video bg-neutral-900 rounded-t-md overflow-hidden">
              {project.video_url ? (
                <video
                  src={project.video_url}
                  controls
                  className="w-full h-full"
                  poster={project.thumbnail_url}
                >
                  브라우저가 비디오 태그를 지원하지 않습니다.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <p>비디오가 없습니다</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 탭 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="script">Script</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview 탭 */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>프로젝트 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-neutral-500">상태</p>
                    <p className="font-medium">
                      {project.status === "completed"
                        ? "완료"
                        : project.status === "processing"
                        ? "진행중"
                        : project.status === "failed"
                        ? "실패"
                        : "대기"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">생성일</p>
                    <p className="font-medium">
                      {new Date(project.created_at).toLocaleString("ko-KR")}
                    </p>
                  </div>
                  {project.duration && (
                    <div>
                      <p className="text-sm text-neutral-500">길이</p>
                      <p className="font-medium">{project.duration}초</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {project.analytics && (
                <Card>
                  <CardHeader>
                    <CardTitle>통계</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-neutral-500">조회수</p>
                      <p className="font-medium text-2xl">{project.analytics.views.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">다운로드 수</p>
                      <p className="font-medium text-2xl">
                        {project.analytics.downloads.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Assets 탭 */}
          <TabsContent value="assets" className="space-y-4">
            {/* 이미지 */}
            {project.assets?.images && project.assets.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>이미지 ({project.assets.images.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.assets.images.map((image) => (
                      <div key={image.id} className="relative aspect-video bg-neutral-100 rounded-md overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.type}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 오디오 */}
            {project.assets?.audios && project.assets.audios.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>오디오 ({project.assets.audios.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.assets.audios.map((audio) => (
                    <div key={audio.id} className="flex items-center gap-4 p-4 border border-neutral-200 rounded-md">
                      <div className="flex-shrink-0">
                        <svg
                          className="w-8 h-8 text-primary-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900">{audio.type}</p>
                        <audio src={audio.url} controls className="w-full mt-2" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Script 탭 */}
          <TabsContent value="script" className="space-y-4">
            {project.assets?.scripts && project.assets.scripts.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>스크립트</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {project.assets.scripts.map((script, index) => (
                      <div key={script.id} className="p-4 bg-neutral-50 rounded-md">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-neutral-500">
                            {script.type}
                          </span>
                          <span className="text-xs text-neutral-400">•</span>
                          <span className="text-xs text-neutral-500">라인 {index + 1}</span>
                        </div>
                        <p className="text-neutral-900">{script.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-neutral-600">스크립트가 없습니다.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics 탭 */}
          <TabsContent value="analytics" className="space-y-4">
            {project.analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>조회수</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary-600">
                      {project.analytics.views.toLocaleString()}
                    </p>
                    <p className="text-sm text-neutral-500 mt-2">전체 조회수</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>다운로드 수</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-secondary-600">
                      {project.analytics.downloads.toLocaleString()}
                    </p>
                    <p className="text-sm text-neutral-500 mt-2">전체 다운로드 수</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-neutral-600">통계 데이터가 없습니다.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
