/**
 * 올인원 스튜디오 - 프로젝트 상세 페이지
 * 생성된 콘텐츠 미리보기 및 편집
 */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import AuthRequired from '@/components/AuthRequired';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ArrowLeft,
  Play,
  Download,
  Edit,
  Share2,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Film,
  Video,
  Sparkles,
  Layers,
  Eye,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

interface ProjectData {
  id: string;
  name: string;
  type: 'shortform' | 'video' | 'animation' | 'movie';
  status: 'draft' | 'generating' | 'completed' | 'error';
  prompt: string;
  steps: {
    story: { status: 'pending' | 'processing' | 'completed' | 'error'; result?: any };
    character: { status: 'pending' | 'processing' | 'completed' | 'error'; result?: any };
    scene: { status: 'pending' | 'processing' | 'completed' | 'error'; result?: any };
    animation: { status: 'pending' | 'processing' | 'completed' | 'error'; result?: any };
    voice: { status: 'pending' | 'processing' | 'completed' | 'error'; result?: any };
    render: { status: 'pending' | 'processing' | 'completed' | 'error'; result?: any };
  };
  videoUrl?: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetailPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'steps' | 'edit'>('preview');

  useEffect(() => {
    if (isAuthenticated && projectId) {
      loadProject();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, projectId]);

  const loadProject = async () => {
    setIsLoadingProject(true);
    try {
      // API에서 프로젝트 데이터 가져오기
      const response = await fetch(`/api/allinone-studio/project/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.project) {
          setProject(data.project);
          setIsLoadingProject(false);
          return;
        }
      }

      // API 실패 시 로컬 스토리지에서 가져오기 (임시)
      try {
        const savedProjects = localStorage.getItem('allinone-projects');
        if (savedProjects) {
          const projects = JSON.parse(savedProjects);
          const foundProject = projects.find((p: any) => p.id === projectId);
          if (foundProject) {
            setProject(foundProject);
            setIsLoadingProject(false);
            return;
          }
        }
      } catch (e) {
        console.error('로컬 스토리지 로드 실패:', e);
      }

      // 프로젝트가 없으면 기본 데이터 생성
      setProject({
        id: projectId,
        name: '새 프로젝트',
        type: 'shortform',
        status: 'draft',
        prompt: '',
        steps: {
          story: { status: 'pending' },
          character: { status: 'pending' },
          scene: { status: 'pending' },
          animation: { status: 'pending' },
          voice: { status: 'pending' },
          render: { status: 'pending' },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
    } finally {
      setIsLoadingProject(false);
    }
  };

  const handleDownload = () => {
    if (project?.videoUrl) {
      window.open(project.videoUrl, '_blank');
    } else {
      alert('다운로드할 영상이 없습니다.');
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

  if (isLoadingProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-gray-400">프로젝트를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">프로젝트를 찾을 수 없습니다</h2>
            <p className="text-gray-400 mb-6">프로젝트가 삭제되었거나 존재하지 않습니다.</p>
            <Link
              href="/allinone-studio"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:shadow-xl transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>대시보드로 돌아가기</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const contentTypeIcons = {
    shortform: Video,
    video: Film,
    animation: Sparkles,
    movie: Layers,
  };

  const contentTypeLabels = {
    shortform: '숏폼 영상',
    video: '영상 콘텐츠',
    animation: '애니메이션',
    movie: '영화',
  };

  const Icon = contentTypeIcons[project.type];
  const completedSteps = Object.values(project.steps).filter(s => s.status === 'completed').length;
  const totalSteps = Object.keys(project.steps).length;
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <Link
              href="/allinone-studio"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>대시보드로 돌아가기</span>
            </Link>
            
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-8 h-8 text-purple-400" />
                  <h1 className="text-4xl font-bold">{project.name || '제목 없음'}</h1>
                </div>
                <p className="text-gray-400 mb-4">{contentTypeLabels[project.type]}</p>
                
                {/* 진행 상태 */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-xs">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400">
                    {completedSteps} / {totalSteps} 단계 완료
                  </span>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex items-center gap-3">
                {project.status === 'completed' && project.videoUrl && (
                  <>
                    <button
                      onClick={() => {
                        if (project.videoUrl) {
                          window.open(project.videoUrl, '_blank');
                        }
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>재생</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>다운로드</span>
                    </button>
                  </>
                )}
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  <span>공유</span>
                </button>
              </div>
            </div>
          </div>

          {/* 탭 */}
          <div className="flex items-center gap-4 mb-6 border-b border-white/20">
            {(['preview', 'steps', 'edit'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'preview' && '미리보기'}
                {tab === 'steps' && '생성 단계'}
                {tab === 'edit' && '편집'}
              </button>
            ))}
          </div>

          {/* 콘텐츠 영역 */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
            {activeTab === 'preview' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Eye className="w-6 h-6 text-purple-400" />
                  미리보기
                </h2>
                
                {project.videoUrl ? (
                  <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
                    <video
                      src={project.videoUrl}
                      controls
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl flex items-center justify-center mb-6">
                    <div className="text-center">
                      <Film className="w-16 h-16 text-white/50 mx-auto mb-4" />
                      <p className="text-gray-400">영상이 아직 생성되지 않았습니다</p>
                      {project.status === 'generating' && (
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                          <span className="text-sm text-gray-400">생성 중...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 프로젝트 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">프로젝트 정보</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">타입:</span>
                        <span>{contentTypeLabels[project.type]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">상태:</span>
                        <span className={
                          project.status === 'completed' ? 'text-green-400' :
                          project.status === 'generating' ? 'text-blue-400' :
                          project.status === 'error' ? 'text-red-400' :
                          'text-gray-400'
                        }>
                          {project.status === 'completed' && '완료'}
                          {project.status === 'generating' && '생성 중'}
                          {project.status === 'error' && '오류'}
                          {project.status === 'draft' && '초안'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">생성일:</span>
                        <span>{new Date(project.createdAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">수정일:</span>
                        <span>{new Date(project.updatedAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {project.prompt && (
                    <div>
                      <h3 className="font-semibold mb-3">프롬프트</h3>
                      <p className="text-sm text-gray-300 bg-white/5 rounded-lg p-4">
                        {project.prompt}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'steps' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                  생성 단계
                </h2>
                
                <div className="space-y-4">
                  {Object.entries(project.steps).map(([key, step], index) => {
                    const stepNames: Record<string, string> = {
                      story: '스토리 & 스크립트',
                      character: '캐릭터 생성',
                      scene: '장면 구성',
                      animation: '애니메이션 & 표현',
                      voice: '음성 & 음악',
                      render: '렌더링',
                    };

                    return (
                      <div
                        key={key}
                        className={`p-6 rounded-xl border-2 ${
                          step.status === 'completed'
                            ? 'bg-green-500/10 border-green-500/50'
                            : step.status === 'processing'
                            ? 'bg-blue-500/10 border-blue-500/50'
                            : step.status === 'error'
                            ? 'bg-red-500/10 border-red-500/50'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{stepNames[key]}</h3>
                              {step.status === 'processing' && (
                                <p className="text-sm text-blue-400 mt-1">처리 중...</p>
                              )}
                              {step.status === 'completed' && (
                                <p className="text-sm text-green-400 mt-1">완료</p>
                              )}
                              {step.status === 'error' && (
                                <p className="text-sm text-red-400 mt-1">오류 발생</p>
                              )}
                            </div>
                          </div>
                          <div>
                            {step.status === 'completed' && (
                              <CheckCircle className="w-6 h-6 text-green-500" />
                            )}
                            {step.status === 'processing' && (
                              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                            )}
                            {step.status === 'error' && (
                              <XCircle className="w-6 h-6 text-red-500" />
                            )}
                            {step.status === 'pending' && (
                              <Clock className="w-6 h-6 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'edit' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Edit className="w-6 h-6 text-purple-400" />
                  편집
                </h2>
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">편집 기능은 곧 제공될 예정입니다.</p>
                  <p className="text-sm text-gray-500">
                    Scene 편집기, 캐릭터 수정, 대사 변경 등의 기능을 준비 중입니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
