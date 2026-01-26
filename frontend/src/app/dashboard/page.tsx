"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton, SkeletonCard } from "@/components/Skeleton";
import { PLATFORM_NAV_ITEMS } from "@/components/Navigation";

// 프로젝트 타입 정의
interface Project {
  id: string;
  title: string;
  thumbnail_url?: string;
  status: "completed" | "processing" | "failed" | "pending";
  created_at: string;
  views?: number;
  downloads?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // 프로젝트 로드
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        // 실제로는 API 호출
        // const response = await fetch("/api/v1/projects");
        // const data = await response.json();

        // 예시 데이터
        const mockProjects: Project[] = [
          {
            id: "1",
            title: "카페 브랜딩 영상",
            thumbnail_url: "https://picsum.photos/400/300?random=1",
            status: "completed",
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            views: 1234,
            downloads: 56,
          },
          {
            id: "2",
            title: "제품 소개 영상",
            thumbnail_url: "https://picsum.photos/400/300?random=2",
            status: "completed",
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            views: 890,
            downloads: 34,
          },
          {
            id: "3",
            title: "교육 콘텐츠",
            thumbnail_url: "https://picsum.photos/400/300?random=3",
            status: "processing",
            created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          },
        ];

        setProjects(mockProjects);
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <DashboardLayout navItems={PLATFORM_NAV_ITEMS} title="Freeshell">
        <div className="space-y-6">
          <Skeleton height={60} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // 통계 계산
  const stats = {
    totalProjects: projects.length,
    completedProjects: projects.filter((p) => p.status === "completed").length,
    totalViews: projects.reduce((sum, p) => sum + (p.views || 0), 0),
    totalDownloads: projects.reduce((sum, p) => sum + (p.downloads || 0), 0),
  };

  return (
    <DashboardLayout navItems={PLATFORM_NAV_ITEMS} title="Freeshell">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              환영합니다, {user?.username || "사용자"}님!
            </h1>
            <p className="text-neutral-600 mt-1">콘텐츠 제작과 관리를 한 곳에서</p>
          </div>
          <Button onClick={() => router.push("/create")} size="lg">
            + 새 프로젝트
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>생성된 영상</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary-600">{stats.totalProjects}</div>
              <p className="text-xs text-neutral-500 mt-1">
                완료: {stats.completedProjects}개
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>남은 크레딧</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary-600">50</div>
              <p className="text-xs text-neutral-500 mt-1">프로 플랜</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>총 조회수</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent-600">
                {stats.totalViews.toLocaleString()}
              </div>
              <p className="text-xs text-neutral-500 mt-1">전체 프로젝트</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>이번 달 수익</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success-600">$120</div>
              <p className="text-xs text-neutral-500 mt-1">콘텐츠 수익</p>
            </CardContent>
          </Card>
        </div>

        {/* 빠른 액션 */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 액션</CardTitle>
            <CardDescription>자주 사용하는 기능에 빠르게 접근하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => router.push("/create")}
              >
                <span className="text-2xl">🎨</span>
                <span>스튜디오 열기</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => router.push("/experts")}
              >
                <span className="text-2xl">👥</span>
                <span>전문가 찾기</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => router.push("/feed")}
              >
                <span className="text-2xl">🌐</span>
                <span>피드 둘러보기</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 최근 프로젝트 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>최근 프로젝트</CardTitle>
                <CardDescription>최근에 생성하거나 작업한 프로젝트입니다</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  그리드
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  리스트
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-neutral-600 mb-4">아직 프로젝트가 없습니다</p>
                <Button onClick={() => router.push("/create")}>첫 프로젝트 만들기</Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => router.push(`/project/${project.id}`)}
                  >
                    <div className="relative aspect-video bg-neutral-100 rounded-t-md overflow-hidden">
                      {project.thumbnail_url ? (
                        <img
                          src={project.thumbnail_url}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <span className="text-4xl">📹</span>
                        </div>
                      )}
                      {project.status === "processing" && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-white text-sm font-medium">처리 중...</div>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-neutral-900 mb-1 truncate">
                        {project.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>
                          {new Date(project.created_at).toLocaleDateString("ko-KR")}
                        </span>
                        {project.views !== undefined && (
                          <span>👁 {project.views.toLocaleString()}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-4 p-4 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/project/${project.id}`)}
                  >
                    <div className="relative w-24 h-16 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                      {project.thumbnail_url ? (
                        <img
                          src={project.thumbnail_url}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <span className="text-2xl">📹</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 truncate">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-neutral-500 mt-1">
                        <span>
                          {new Date(project.created_at).toLocaleDateString("ko-KR")}
                        </span>
                        {project.views !== undefined && (
                          <span>👁 {project.views.toLocaleString()}</span>
                        )}
                        {project.downloads !== undefined && (
                          <span>⬇ {project.downloads}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          project.status === "completed"
                            ? "bg-success-100 text-success-700"
                            : project.status === "processing"
                            ? "bg-warning-100 text-warning-700"
                            : "bg-error-100 text-error-700"
                        }`}
                      >
                        {project.status === "completed"
                          ? "완료"
                          : project.status === "processing"
                          ? "진행중"
                          : "실패"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 피드 미리보기 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>인기 콘텐츠</CardTitle>
                <CardDescription>커뮤니티에서 인기 있는 콘텐츠입니다</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push("/feed")}>
                전체 보기 →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="relative aspect-video bg-neutral-100 rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => router.push("/feed")}
                >
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    <span className="text-4xl">📹</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-sm font-medium">인기 콘텐츠 {i}</p>
                    <p className="text-white/80 text-xs">👁 1.2K • ⬇ 45</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 전문가 추천 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>추천 전문가</CardTitle>
                <CardDescription>도움이 필요하신가요? 전문가를 찾아보세요</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push("/experts")}>
                전체 보기 →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "김디자이너", specialty: "영상 편집", rating: 4.9 },
                { name: "박마케터", specialty: "콘텐츠 기획", rating: 4.8 },
                { name: "이애니메이터", specialty: "모션 그래픽", rating: 5.0 },
              ].map((expert, idx) => (
                <Card
                  key={idx}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push("/experts")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                        {expert.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-neutral-900 truncate">
                          {expert.name}
                        </h4>
                        <p className="text-sm text-neutral-600">{expert.specialty}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-xs text-neutral-600">{expert.rating}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
