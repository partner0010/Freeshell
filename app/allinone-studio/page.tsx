/**
 * 올인원 스튜디오 - 메인 대시보드
 * 프로젝트 목록, 통계, 빠른 액션
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import AuthRequired from '@/components/AuthRequired';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Sparkles,
  Film,
  Video,
  Music,
  Layers,
  Plus,
  Folder,
  Clock,
  TrendingUp,
  Play,
  Download,
  Eye,
  Loader2,
  ArrowRight,
  BarChart3,
  Zap
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  type: 'shortform' | 'video' | 'animation' | 'movie';
  status: 'draft' | 'generating' | 'completed' | 'error';
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  steps?: {
    story: boolean;
    character: boolean;
    scene: boolean;
    animation: boolean;
    voice: boolean;
    render: boolean;
  };
}

interface Stats {
  totalProjects: number;
  completedProjects: number;
  generatingProjects: number;
  totalViews: number;
}

export default function AllInOneStudioPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    completedProjects: 0,
    generatingProjects: 0,
    totalViews: 0,
  });
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  const loadProjects = async () => {
    setIsLoadingProjects(true);
    try {
      // 올인원 스튜디오 프로젝트 목록 로드
      const response = await fetch('/api/allinone-studio/project');
      if (response.ok) {
        const data = await response.json();
        const allinoneProjects = (data.projects || []) as Project[];
        setProjects(allinoneProjects);
        
        // 통계 계산
        setStats({
          totalProjects: allinoneProjects.length,
          completedProjects: allinoneProjects.filter((p: Project) => p.status === 'completed').length,
          generatingProjects: allinoneProjects.filter((p: Project) => p.status === 'generating').length,
          totalViews: 0, // TODO: 실제 조회수 데이터
        });
      } else {
        // API 실패 시 로컬 스토리지에서 가져오기 (임시)
        try {
          const savedProjects = localStorage.getItem('allinone-projects');
          if (savedProjects) {
            const projects = JSON.parse(savedProjects) as Project[];
            setProjects(projects);
            setStats({
              totalProjects: projects.length,
              completedProjects: projects.filter(p => p.status === 'completed').length,
              generatingProjects: projects.filter(p => p.status === 'generating').length,
              totalViews: 0,
            });
          }
        } catch (e) {
          console.error('로컬 스토리지 로드 실패:', e);
        }
      }
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthRequired />;
  }

  const contentTypeIcons = {
    shortform: Video,
    video: Film,
    animation: Sparkles,
    movie: Layers,
  };

  const contentTypeColors = {
    shortform: 'from-purple-600 to-pink-600',
    video: 'from-blue-600 to-cyan-600',
    animation: 'from-pink-500 to-rose-500',
    movie: 'from-indigo-600 to-purple-600',
  };

  const contentTypeLabels = {
    shortform: '숏폼 영상',
    video: '영상 콘텐츠',
    animation: '애니메이션',
    movie: '영화',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                  올인원 콘텐츠 스튜디오
                </h1>
                <p className="text-xl text-gray-300 max-w-2xl">
                  AI가 자동으로 생성하는 전문적인 콘텐츠를 관리하고 편집하세요
                </p>
              </div>
              <Link
                href="/allinone-studio/create"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>새 콘텐츠 생성</span>
              </Link>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">전체 프로젝트</span>
                  <Folder className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-3xl font-bold">{stats.totalProjects}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">완료된 프로젝트</span>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-3xl font-bold">{stats.completedProjects}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">생성 중</span>
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                </div>
                <div className="text-3xl font-bold">{stats.generatingProjects}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">총 조회수</span>
                  <Eye className="w-5 h-5 text-pink-400" />
                </div>
                <div className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* 빠른 액션 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-purple-400" />
              빠른 시작
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(['shortform', 'video', 'animation', 'movie'] as const).map((type) => {
                const Icon = contentTypeIcons[type];
                return (
                  <Link
                    key={type}
                    href={`/allinone-studio/create?type=${type}`}
                    className={`bg-gradient-to-br ${contentTypeColors[type]} rounded-xl p-6 hover:scale-105 transition-all shadow-lg hover:shadow-xl`}
                  >
                    <Icon className="w-8 h-8 mb-3" />
                    <h3 className="text-lg font-bold mb-1">{contentTypeLabels[type]}</h3>
                    <p className="text-sm opacity-90">새로 만들기</p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 프로젝트 목록 */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Folder className="w-6 h-6 text-purple-400" />
                내 프로젝트
              </h2>
              <button
                onClick={loadProjects}
                disabled={isLoadingProjects}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Loader2 className={`w-4 h-4 ${isLoadingProjects ? 'animate-spin' : ''}`} />
                새로고침
              </button>
            </div>

            {isLoadingProjects ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
                <p className="text-gray-400">프로젝트를 불러오는 중...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 border border-white/20 text-center">
                <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">프로젝트가 없습니다</h3>
                <p className="text-gray-400 mb-6">새로운 콘텐츠를 생성해보세요</p>
                <Link
                  href="/allinone-studio/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:shadow-xl transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>첫 콘텐츠 만들기</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => {
                  const Icon = contentTypeIcons[project.type];
                  const statusColors = {
                    draft: 'bg-gray-500',
                    generating: 'bg-blue-500',
                    completed: 'bg-green-500',
                    error: 'bg-red-500',
                  };
                  
                  return (
                    <Link
                      key={project.id}
                      href={`/allinone-studio/project/${project.id}`}
                      className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:border-purple-500 transition-all hover:scale-105 group"
                    >
                      {/* 썸네일 영역 */}
                      <div className={`w-full h-48 bg-gradient-to-br ${contentTypeColors[project.type]} rounded-lg mb-4 flex items-center justify-center relative overflow-hidden`}>
                        {project.thumbnail ? (
                          <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
                        ) : (
                          <Icon className="w-16 h-16 text-white/50" />
                        )}
                        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full ${statusColors[project.status]} text-white text-xs font-semibold`}>
                          {project.status === 'draft' && '초안'}
                          {project.status === 'generating' && '생성 중'}
                          {project.status === 'completed' && '완료'}
                          {project.status === 'error' && '오류'}
                        </div>
                      </div>

                      {/* 프로젝트 정보 */}
                      <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                        {project.name || '제목 없음'}
                      </h3>
                      <p className="text-sm text-gray-400 mb-4">
                        {contentTypeLabels[project.type]}
                      </p>

                      {/* 진행 상태 */}
                      {project.steps && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                            <BarChart3 className="w-4 h-4" />
                            <span>생성 진행도</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {Object.entries(project.steps).map(([key, completed]) => (
                              <div
                                key={key}
                                className={`h-2 rounded ${
                                  completed ? 'bg-green-500' : 'bg-gray-700'
                                }`}
                                title={key}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 메타 정보 */}
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(project.updatedAt).toLocaleDateString('ko-KR')}</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {project.status === 'completed' && (
                            <>
                              <Play className="w-4 h-4" />
                              <Download className="w-4 h-4" />
                            </>
                          )}
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
