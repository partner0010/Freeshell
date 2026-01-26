"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton, SkeletonCard } from "@/components/Skeleton";
import { PLATFORM_NAV_ITEMS } from "@/components/Navigation";
import { Heart, MessageCircle, Share2, Eye, TrendingUp, Filter } from "lucide-react";

interface FeedItem {
  id: string;
  title: string;
  description?: string;
  thumbnail_path?: string;
  file_path?: string;
  duration?: number;
  created_at: string;
  user: {
    id: string;
    username: string;
  };
  likes_count: number;
  comments_count: number;
  views?: number;
  is_liked?: boolean;
}

export default function FeedPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, accessToken } = useAuth();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"personalized" | "trending" | "latest">("personalized");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      loadFeed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, filter, page, router, accessToken]);

  const loadFeed = async () => {
    setIsLoading(true);
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      let url = "";
      if (filter === "personalized") {
        url = `/api/recommendation/feed?limit=20`;
      } else if (filter === "trending") {
        url = `/api/recommendation/trending?limit=20`;
      } else {
        url = `/api/sns/timeline?page=${page}&page_size=20`;
      }

      const response = await fetch(url, { headers });
      
      if (response.ok) {
        const data = await response.json();
        
        if (filter === "personalized" || filter === "trending") {
          setFeedItems(data.videos || []);
          setHasMore((data.videos || []).length >= 20);
        } else {
          setFeedItems((prev) => (page === 1 ? data.videos || [] : [...prev, ...(data.videos || [])]));
          setHasMore(data.total_pages > page);
        }
      } else {
        console.error("Failed to load feed");
      }
    } catch (error) {
      console.error("Failed to load feed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (videoId: string, isLiked: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/sns/video/${videoId}/like`, {
        method: isLiked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        setFeedItems((prev) =>
          prev.map((item) =>
            item.id === videoId
              ? {
                  ...item,
                  is_liked: !isLiked,
                  likes_count: isLiked ? item.likes_count - 1 : item.likes_count + 1,
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      setPage((prev) => prev + 1);
    }
  };

  if (authLoading || (isLoading && feedItems.length === 0)) {
    return (
      <DashboardLayout navItems={PLATFORM_NAV_ITEMS} title="피드">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton height={40} width={200} />
            <Skeleton height={40} width={300} />
          </div>
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
    <DashboardLayout navItems={PLATFORM_NAV_ITEMS} title="피드">
      <div className="space-y-6">
        {/* 필터 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-neutral-500" />
              <Button
                variant={filter === "personalized" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilter("personalized");
                  setPage(1);
                }}
              >
                맞춤 추천
              </Button>
              <Button
                variant={filter === "trending" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilter("trending");
                  setPage(1);
                }}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                인기
              </Button>
              <Button
                variant={filter === "latest" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilter("latest");
                  setPage(1);
                }}
              >
                최신
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 피드 그리드 */}
        {feedItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-neutral-500">피드에 콘텐츠가 없습니다.</p>
              <Button
                className="mt-4"
                onClick={() => router.push("/create")}
              >
                첫 콘텐츠 만들기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedItems.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/feed/${item.id}`)}
                >
                  {item.thumbnail_path && (
                    <div className="relative aspect-video bg-neutral-100 rounded-t-lg overflow-hidden">
                      <img
                        src={item.thumbnail_path}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {item.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {Math.floor(item.duration / 60)}:
                          {String(item.duration % 60).padStart(2, "0")}
                        </div>
                      )}
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                    <CardDescription>
                      {item.user.username} · {new Date(item.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {item.description && (
                      <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-neutral-500">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(item.id, item.is_liked || false);
                          }}
                          className={`flex items-center gap-1 hover:text-primary-600 transition-colors ${
                            item.is_liked ? "text-primary-600" : ""
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${item.is_liked ? "fill-current" : ""}`} />
                          {item.likes_count}
                        </button>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {item.comments_count}
                        </div>
                        {item.views !== undefined && (
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {item.views.toLocaleString()}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // 공유 기능
                        }}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 더보기 버튼 */}
            {hasMore && filter === "latest" && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? "로딩 중..." : "더 보기"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
