/**
 * 프로젝트 목록 페이지
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Calendar, ArrowRight, Loader2, FolderOpen, Trash2, Edit2, MoreVertical, Search, Filter, X, Download, Upload } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Project {
  id: string;
  title: string;
  target_audience: string;
  purpose: string;
  platform: string;
  content_type: string;
  created_at: string;
  updated_at: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);

  // 세션에서 사용자 ID 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.user) {
            setUserId(data.user.id);
          } else {
            // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
            router.push('/auth/login?redirect=/projects');
          }
        }
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        router.push('/auth/login?redirect=/projects');
      }
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    if (userId) {
      fetchProjects();
    }
  }, [userId]);

  const fetchProjects = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/project?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || '프로젝트를 불러올 수 없습니다.');
      }
    } catch (err: any) {
      setError(err.message || '프로젝트를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = () => {
    router.push('/projects/new');
  };

  const handleOpenProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    
    if (!confirm('정말 이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setDeletingId(projectId);
    try {
      const response = await fetch(`/api/project/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '프로젝트 삭제 실패');
      }

      // 목록에서 제거
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err: any) {
      setError(err.message || '프로젝트 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    router.push(`/projects/${projectId}?edit=true`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">프로젝트를 불러오는 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  내 프로젝트
                </h1>
                <p className="text-xl text-gray-600">
                  AI 콘텐츠 제작 프로젝트를 관리하세요
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        try {
                          const text = await file.text();
                          const projectData = JSON.parse(text);
                          const response = await fetch('/api/project/import', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ projectData }),
                          });
                          if (response.ok) {
                            const { toast } = await import('@/lib/utils/toast');
                            toast.success('프로젝트가 가져와졌습니다.');
                            fetchProjects();
                          } else {
                            const error = await response.json();
                            const { toast } = await import('@/lib/utils/toast');
                            toast.error(error.error || '프로젝트 가져오기 중 오류가 발생했습니다.');
                          }
                        } catch (error) {
                          const { toast } = await import('@/lib/utils/toast');
                          toast.error('파일을 읽는 중 오류가 발생했습니다.');
                        }
                      }
                    };
                    input.click();
                  }}
                  className="px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600 transition-all flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>가져오기</span>
                </button>
                <button
                  onClick={handleCreateProject}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>새 프로젝트</span>
                </button>
              </div>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* 검색 및 필터 */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 검색 */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="프로젝트 검색..."
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* 필터 버튼 */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-colors flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                <span>필터</span>
              </button>
            </div>

            {/* 필터 패널 */}
            {showFilters && (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 콘텐츠 타입 필터 */}
                  <div>
                    <label className="block text-sm font-medium mb-2">콘텐츠 타입</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">전체</option>
                      <option value="blog-post">블로그</option>
                      <option value="youtube-script">유튜브</option>
                      <option value="sns-post">SNS</option>
                      <option value="instagram-caption">인스타</option>
                      <option value="twitter-thread">트위터</option>
                    </select>
                  </div>

                  {/* 정렬 */}
                  <div>
                    <label className="block text-sm font-medium mb-2">정렬</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name')}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="newest">최신순</option>
                      <option value="oldest">오래된순</option>
                      <option value="name">이름순</option>
                    </select>
                  </div>
                </div>

                {/* 필터 초기화 */}
                <button
                  onClick={() => {
                    setFilterType('all');
                    setSortBy('newest');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  필터 초기화
                </button>
              </div>
            )}
          </div>

          {/* 프로젝트 목록 */}
          {projects.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-dashed border-gray-300 p-16 text-center">
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                아직 프로젝트가 없습니다
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                새 프로젝트를 생성하여 AI 콘텐츠 제작을 시작하세요
              </p>
              <button
                onClick={handleCreateProject}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-6 h-6" />
                <span>첫 프로젝트 만들기</span>
              </button>
            </div>
          ) : (() => {
            // 필터링 및 정렬
            let filteredProjects = projects;

            // 검색 필터
            if (searchQuery) {
              filteredProjects = filteredProjects.filter(project =>
                project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.target_audience.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.purpose.toLowerCase().includes(searchQuery.toLowerCase())
              );
            }

            // 타입 필터
            if (filterType !== 'all') {
              filteredProjects = filteredProjects.filter(project =>
                project.content_type === filterType
              );
            }

            // 정렬
            filteredProjects = [...filteredProjects].sort((a, b) => {
              switch (sortBy) {
                case 'newest':
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'oldest':
                  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case 'name':
                  return a.title.localeCompare(b.title, 'ko');
                default:
                  return 0;
              }
            });

            return (
              <>
                {filteredProjects.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-xl border-2 border-dashed border-gray-300 p-16 text-center">
                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      검색 결과가 없습니다
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      다른 검색어나 필터를 시도해보세요
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterType('all');
                      }}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      필터 초기화
                    </button>
                  </div>
                ) : (
                  <div className="mb-4 text-sm text-gray-600">
                    총 {filteredProjects.length}개의 프로젝트
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-blue-500 transition-all hover:shadow-xl group overflow-hidden relative"
                >
                  {/* 액션 메뉴 */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(showDeleteConfirm === project.id ? null : project.id);
                        }}
                        className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                        aria-label="프로젝트 메뉴"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                      
                      {/* 드롭다운 메뉴 */}
                      {showDeleteConfirm === project.id && (
                        <div className="absolute top-10 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[120px] z-20">
                          <button
                            onClick={(e) => handleEditProject(project.id, e)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>편집</span>
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(null);
                              try {
                                const response = await fetch(`/api/project/${project.id}/duplicate`, {
                                  method: 'POST',
                                });
                                if (response.ok) {
                                  const data = await response.json();
                                  const { toast } = await import('@/lib/utils/toast');
                                  toast.success(data.message || '프로젝트가 복제되었습니다.');
                                  fetchProjects();
                                } else {
                                  const errorData = await response.json();
                                  const { toast } = await import('@/lib/utils/toast');
                                  toast.error(errorData.error || '프로젝트 복제 중 오류가 발생했습니다.');
                                }
                              } catch (error) {
                                console.error('프로젝트 복제 오류:', error);
                                const { toast } = await import('@/lib/utils/toast');
                                toast.error('프로젝트 복제 중 오류가 발생했습니다.');
                              }
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            <span>복제</span>
                          </button>
                          <button
                            onClick={(e) => {
                              setShowDeleteConfirm(null);
                              handleDeleteProject(project.id, e);
                            }}
                            disabled={deletingId === project.id}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                          >
                            {deletingId === project.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>삭제 중...</span>
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                <span>삭제</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 카드 내용 (클릭 시 상세 페이지로 이동) */}
                  <div
                    onClick={() => handleOpenProject(project.id)}
                    className="cursor-pointer"
                  >
                    {/* 카드 헤더 */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                          {project.content_type === 'blog-post' ? '블로그' :
                           project.content_type === 'youtube-script' ? '유튜브' :
                           project.content_type === 'sns-post' ? 'SNS' :
                           project.content_type === 'instagram-caption' ? '인스타' :
                           '트위터'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        타겟: {project.target_audience}
                      </p>
                    </div>

                    {/* 카드 본문 */}
                    <div className="p-6">
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-semibold">목적:</span>
                          <span>{project.purpose === 'traffic' ? '유입' : project.purpose === 'conversion' ? '전환' : '브랜딩'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-semibold">플랫폼:</span>
                          <span>{project.platform}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(project.created_at).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-2">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const response = await fetch(`/api/project/${project.id}/export?format=json`);
                              if (response.ok) {
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `project-${project.id}.json`;
                                a.click();
                                window.URL.revokeObjectURL(url);
                              } else {
                                const { toast } = await import('@/lib/utils/toast');
                                toast.error('프로젝트 내보내기 중 오류가 발생했습니다.');
                              }
                            } catch (error) {
                              console.error('프로젝트 내보내기 오류:', error);
                              const { toast } = await import('@/lib/utils/toast');
                              toast.error('프로젝트 내보내기 중 오류가 발생했습니다.');
                            }
                          }}
                          className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>내보내기</span>
                        </button>
                        <button className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors font-semibold text-sm flex items-center justify-center gap-2 group-hover:bg-blue-50 group-hover:text-blue-600">
                          <span>계속하기</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      <Footer />
    </div>
  );
}

