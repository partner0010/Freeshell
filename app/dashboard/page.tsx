/**
 * 사용자 대시보드
 * 프로젝트 관리, 통계, 설정
 */
'use client';

import { useState, useEffect } from 'react';
import { 
  Folder, 
  FileText, 
  BarChart3, 
  Settings, 
  Clock,
  TrendingUp,
  Zap,
  Eye,
  Download,
  Plus,
  Search
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EnhancedButton from '@/components/EnhancedButton';
import EnhancedCard from '@/components/EnhancedCard';
import PageHeader from '@/components/PageHeader';
import ScrollAnimation from '@/components/ScrollAnimation';
import AuthRequired from '@/components/AuthRequired';
import { checkAuth } from '@/lib/utils/auth-check';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  type: 'website' | 'app';
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalProjects: number;
  activeProjects: number;
  totalViews: number;
  totalDownloads: number;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    activeProjects: 0,
    totalViews: 0,
    totalDownloads: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAuth().then(authState => {
      setIsAuthenticated(authState.isAuthenticated);
      setIsChecking(false);
      if (authState.isAuthenticated) {
        loadDashboard();
      }
    });
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      // 프로젝트 목록 로드
      const projectsResponse = await fetch('/api/user/projects');
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.projects || []);
        
        // 통계 계산
        const totalProjects = projectsData.projects?.length || 0;
        const activeProjects = projectsData.projects?.filter((p: Project) => p.status === 'published').length || 0;
        setStats({
          totalProjects,
          activeProjects,
          totalViews: 0, // 실제로는 데이터베이스에서 가져와야 함
          totalDownloads: 0, // 실제로는 데이터베이스에서 가져와야 함
        });
      }
    } catch (error) {
      console.error('대시보드 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">확인 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <AuthRequired 
          message="대시보드를 사용하려면 회원가입이 필요합니다."
        />
        <Footer />
      </div>
    );
  }

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <PageHeader
        title="대시보드"
        description="프로젝트를 관리하고 통계를 확인하세요"
        icon={BarChart3}
        action={
          <Link href="/build/step1">
            <EnhancedButton
              variant="gradient"
              icon={Plus}
            >
              새 프로젝트 만들기
            </EnhancedButton>
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* 통계 카드 */}
        <ScrollAnimation direction="down">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <EnhancedCard hover>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Folder className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalProjects}</h3>
                <p className="text-sm text-gray-600">총 프로젝트</p>
              </div>
            </EnhancedCard>

            <EnhancedCard hover>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.activeProjects}</h3>
                <p className="text-sm text-gray-600">활성 프로젝트</p>
              </div>
            </EnhancedCard>

            <EnhancedCard hover>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalViews}</h3>
                <p className="text-sm text-gray-600">총 조회수</p>
              </div>
            </EnhancedCard>

            <EnhancedCard hover>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalDownloads}</h3>
                <p className="text-sm text-gray-600">총 다운로드</p>
              </div>
            </EnhancedCard>
          </div>
        </ScrollAnimation>

        {/* 프로젝트 목록 */}
        <ScrollAnimation direction="up">
          <EnhancedCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">내 프로젝트</h2>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="프로젝트 검색..."
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="mt-4 text-gray-600">로딩 중...</p>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                  <Folder className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">
                    {searchQuery ? '검색 결과가 없습니다' : '프로젝트가 없습니다'}
                  </p>
                  <Link href="/build/step1">
                    <EnhancedButton variant="gradient" icon={Plus}>
                      첫 프로젝트 만들기
                    </EnhancedButton>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjects.map((project, index) => (
                    <Link
                      key={project.id}
                      href={`/editor?project=${project.id}`}
                    >
                      <EnhancedCard hover className="h-full">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              project.status === 'published'
                                ? 'bg-green-100 text-green-700'
                                : project.status === 'archived'
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {project.status === 'published' ? '발행됨' : project.status === 'archived' ? '보관됨' : '초안'}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2">{project.name}</h3>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(project.updatedAt).toLocaleDateString()}
                            </span>
                            <span className="capitalize">{project.type}</span>
                          </div>
                        </div>
                      </EnhancedCard>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </EnhancedCard>
        </ScrollAnimation>
      </div>

      <Footer />
    </div>
  );
}
