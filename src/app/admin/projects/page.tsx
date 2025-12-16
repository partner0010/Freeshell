'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Globe,
  Lock,
  Clock,
  ExternalLink,
  Download,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  TrendingUp,
} from 'lucide-react';

// 더미 프로젝트 데이터
const projectsData = [
  { id: 1, name: '스타트업 랜딩', owner: '김철수', template: 'SaaS 랜딩', status: 'published', views: 12450, blocks: 8, createdAt: '2024-03-15', updatedAt: '2시간 전' },
  { id: 2, name: '개인 포트폴리오', owner: '이영희', template: '포트폴리오', status: 'draft', views: 0, blocks: 5, createdAt: '2024-03-20', updatedAt: '1일 전' },
  { id: 3, name: '회사 소개 페이지', owner: '박민수', template: '기업 소개', status: 'published', views: 8920, blocks: 12, createdAt: '2024-02-10', updatedAt: '3시간 전' },
  { id: 4, name: '온라인 쇼핑몰', owner: '정지원', template: '이커머스', status: 'published', views: 45230, blocks: 15, createdAt: '2024-01-25', updatedAt: '30분 전' },
  { id: 5, name: '개발자 블로그', owner: '최현우', template: '블로그', status: 'draft', views: 0, blocks: 4, createdAt: '2024-03-25', updatedAt: '5분 전' },
  { id: 6, name: '이벤트 페이지', owner: '강서연', template: '이벤트', status: 'archived', views: 2340, blocks: 6, createdAt: '2024-01-15', updatedAt: '2주 전' },
];

const statusConfig: Record<string, { color: string; label: string; icon: React.ComponentType<any> }> = {
  published: { color: 'bg-green-100 text-green-700', label: '게시됨', icon: Globe },
  draft: { color: 'bg-yellow-100 text-yellow-700', label: '초안', icon: Lock },
  archived: { color: 'bg-gray-100 text-gray-700', label: '보관됨', icon: Clock },
};

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const filteredProjects = projectsData.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // 통계
  const stats = {
    total: projectsData.length,
    published: projectsData.filter(p => p.status === 'published').length,
    draft: projectsData.filter(p => p.status === 'draft').length,
    totalViews: projectsData.reduce((sum, p) => sum + p.views, 0),
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800">프로젝트 관리</h1>
          <p className="text-gray-500 mt-1">모든 사용자의 프로젝트를 관리하세요</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-gray-600 hover:bg-gray-50">
          <Download size={18} />
          내보내기
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderKanban className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">전체 프로젝트</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Globe className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">게시됨</p>
              <p className="text-2xl font-bold text-gray-800">{stats.published}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Lock className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">초안</p>
              <p className="text-2xl font-bold text-gray-800">{stats.draft}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">총 조회수</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="프로젝트명 또는 소유자로 검색..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            <option value="all">모든 상태</option>
            <option value="published">게시됨</option>
            <option value="draft">초안</option>
            <option value="archived">보관됨</option>
          </select>
        </div>
      </div>

      {/* 프로젝트 테이블 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">프로젝트</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">소유자</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">템플릿</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">상태</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">블록</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">조회수</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">최근 수정</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProjects.map((project) => {
              const StatusIcon = statusConfig[project.status].icon;
              return (
                <motion.tr
                  key={project.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-gradient-to-br from-pastel-lavender to-pastel-sky rounded-lg" />
                      <span className="font-medium text-gray-800">{project.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{project.owner}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{project.template}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[project.status].color}`}>
                      <StatusIcon size={12} />
                      {statusConfig[project.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{project.blocks}</td>
                  <td className="px-6 py-4 text-gray-600">{project.views.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{project.updatedAt}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                        <ExternalLink size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>

        {/* 페이지네이션 */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredProjects.length}개 프로젝트
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
              <ChevronLeft size={18} />
            </button>
            <button className="px-4 py-2 bg-primary-500 text-white rounded-lg">1</button>
            <button className="p-2 border rounded-lg hover:bg-gray-50">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

