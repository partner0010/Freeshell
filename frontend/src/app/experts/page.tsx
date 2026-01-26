"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton, SkeletonCard } from "@/components/Skeleton";
import { PLATFORM_NAV_ITEMS } from "@/components/Navigation";
import { Search, Star, Users, Award, Filter, MessageSquare } from "lucide-react";

interface Expert {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews_count: number;
  completed_projects: number;
  price_per_hour?: number;
  avatar_url?: string;
  bio?: string;
  skills?: string[];
  verified?: boolean;
}

export default function ExpertsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "top-rated">("all");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      loadExperts();
    }
  }, [isAuthenticated, authLoading, filter, router]);

  const loadExperts = async () => {
    setIsLoading(true);
    try {
      // TODO: 실제 API 연동
      // const token = localStorage.getItem("token");
      // const response = await fetch(`/api/v1/experts?filter=${filter}&search=${searchQuery}`, {
      //   headers: token ? { Authorization: `Bearer ${token}` } : {},
      // });

      // Mock 데이터
      const mockExperts: Expert[] = [
        {
          id: "1",
          name: "김영상",
          specialty: "비디오 편집 전문가",
          rating: 4.9,
          reviews_count: 127,
          completed_projects: 342,
          price_per_hour: 50000,
          bio: "10년 이상의 경력을 가진 비디오 편집 전문가입니다.",
          skills: ["Premiere Pro", "After Effects", "Final Cut Pro"],
          verified: true,
        },
        {
          id: "2",
          name: "이애니메이션",
          specialty: "2D/3D 애니메이션",
          rating: 4.8,
          reviews_count: 89,
          completed_projects: 156,
          price_per_hour: 60000,
          bio: "창의적인 애니메이션 제작을 전문으로 합니다.",
          skills: ["Blender", "Maya", "After Effects"],
          verified: true,
        },
        {
          id: "3",
          name: "박음향",
          specialty: "음향 디자인 & 믹싱",
          rating: 4.7,
          reviews_count: 65,
          completed_projects: 98,
          price_per_hour: 45000,
          bio: "프로페셔널한 음향 제작 서비스를 제공합니다.",
          skills: ["Pro Tools", "Logic Pro", "Ableton Live"],
          verified: false,
        },
        {
          id: "4",
          name: "최스크립트",
          specialty: "콘텐츠 기획 & 스크립트",
          rating: 4.9,
          reviews_count: 203,
          completed_projects: 421,
          price_per_hour: 40000,
          bio: "효과적인 스토리텔링과 콘텐츠 기획을 도와드립니다.",
          skills: ["스토리텔링", "기획", "작가"],
          verified: true,
        },
      ];

      let filtered = mockExperts;
      
      if (filter === "verified") {
        filtered = filtered.filter((e) => e.verified);
      } else if (filter === "top-rated") {
        filtered = filtered.filter((e) => e.rating >= 4.8);
      }

      if (searchQuery) {
        filtered = filtered.filter(
          (e) =>
            e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.skills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      setExperts(filtered);
    } catch (error) {
      console.error("Failed to load experts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = (expertId: string) => {
    router.push(`/experts/${expertId}/request`);
  };

  if (authLoading || isLoading) {
    return (
      <DashboardLayout navItems={PLATFORM_NAV_ITEMS} title="전문가">
        <div className="space-y-6">
          <Skeleton height={60} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={PLATFORM_NAV_ITEMS} title="전문가">
      <div className="space-y-6">
        {/* 검색 및 필터 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="전문가 이름, 전문 분야, 기술 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-neutral-500" />
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  전체
                </Button>
                <Button
                  variant={filter === "verified" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("verified")}
                >
                  <Award className="w-4 h-4 mr-1" />
                  인증됨
                </Button>
                <Button
                  variant={filter === "top-rated" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("top-rated")}
                >
                  <Star className="w-4 h-4 mr-1" />
                  최고 평점
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 전문가 목록 */}
        {experts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-neutral-500">검색 결과가 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experts.map((expert) => (
              <Card
                key={expert.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/experts/${expert.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-xl">
                        {expert.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{expert.name}</CardTitle>
                          {expert.verified && (
                            <Award className="w-4 h-4 text-primary-600" />
                          )}
                        </div>
                        <CardDescription className="mt-1">{expert.specialty}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {expert.bio && (
                    <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{expert.bio}</p>
                  )}
                  
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{expert.rating}</span>
                      <span className="text-neutral-500">({expert.reviews_count})</span>
                    </div>
                    <div className="flex items-center gap-1 text-neutral-500">
                      <Users className="w-4 h-4" />
                      <span>{expert.completed_projects}건 완료</span>
                    </div>
                  </div>

                  {expert.skills && expert.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {expert.skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-neutral-100 text-neutral-600 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {expert.skills.length > 3 && (
                        <span className="px-2 py-1 text-xs text-neutral-500">
                          +{expert.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {expert.price_per_hour && (
                      <div className="text-lg font-semibold text-primary-600">
                        {expert.price_per_hour.toLocaleString()}원/시간
                      </div>
                    )}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequest(expert.id);
                      }}
                      size="sm"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      요청하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
