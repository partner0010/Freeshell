'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Tag,
  User,
  Search,
  Filter,
  MoreVertical,
  Clock,
  MessageCircle,
  Heart,
  Share2,
  Image,
  Link,
  Bold,
  Italic,
  List,
  Quote,
  Code,
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: string;
  scheduledFor?: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  views: number;
  comments: number;
  likes: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export function BlogCMSPanel() {
  const [activeTab, setActiveTab] = useState<'posts' | 'editor' | 'categories' | 'settings'>('posts');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: '1',
      title: 'GRIP으로 웹사이트 만들기: 완벽 가이드',
      excerpt: 'GRIP을 사용하여 전문적인 웹사이트를 만드는 방법을 알아봅니다.',
      content: '<p>본문 내용...</p>',
      author: '관리자',
      status: 'published',
      publishedAt: '2024-12-01',
      category: '튜토리얼',
      tags: ['GRIP', '웹사이트', '가이드'],
      views: 1250,
      comments: 23,
      likes: 89,
    },
    {
      id: '2',
      title: '2024년 웹 디자인 트렌드',
      excerpt: '올해 주목해야 할 웹 디자인 트렌드를 소개합니다.',
      content: '<p>본문 내용...</p>',
      author: '관리자',
      status: 'published',
      publishedAt: '2024-11-28',
      category: '트렌드',
      tags: ['디자인', '트렌드', '2024'],
      views: 890,
      comments: 15,
      likes: 67,
    },
    {
      id: '3',
      title: 'AI를 활용한 콘텐츠 제작',
      excerpt: 'AI 도구를 사용하여 효율적으로 콘텐츠를 제작하는 방법',
      content: '<p>본문 내용...</p>',
      author: '관리자',
      status: 'draft',
      category: 'AI',
      tags: ['AI', '콘텐츠', '생산성'],
      views: 0,
      comments: 0,
      likes: 0,
    },
  ]);
  
  const [categories] = useState<Category[]>([
    { id: '1', name: '튜토리얼', slug: 'tutorial', count: 12 },
    { id: '2', name: '트렌드', slug: 'trends', count: 8 },
    { id: '3', name: 'AI', slug: 'ai', count: 5 },
    { id: '4', name: '업데이트', slug: 'updates', count: 15 },
  ]);
  
  const [newPost, setNewPost] = useState<{
    title: string;
    content: string;
    excerpt: string;
    category: string;
    tags: string;
    status: 'draft' | 'published' | 'scheduled';
  }>({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    status: 'draft',
  });

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-600';
      case 'scheduled':
        return 'bg-blue-100 text-blue-600';
      case 'draft':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleCreatePost = () => {
    if (!newPost.title) return;
    
    const post: BlogPost = {
      id: `post-${Date.now()}`,
      title: newPost.title,
      excerpt: newPost.excerpt,
      content: newPost.content,
      author: '관리자',
      status: newPost.status,
      category: newPost.category,
      tags: newPost.tags.split(',').map((t) => t.trim()),
      views: 0,
      comments: 0,
      likes: 0,
    };
    
    setPosts([post, ...posts]);
    setNewPost({ title: '', content: '', excerpt: '', category: '', tags: '', status: 'draft' });
    setShowEditor(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-500" />
          블로그/CMS
        </h3>
        <button
          onClick={() => setShowEditor(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm"
        >
          <Plus className="w-4 h-4" />
          새 글
        </button>
      </div>
      
      {/* 탭 */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
        {[
          { id: 'posts', label: '게시글' },
          { id: 'categories', label: '카테고리' },
          { id: 'settings', label: '설정' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-600 text-primary-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* 게시글 목록 */}
      {activeTab === 'posts' && (
        <div className="space-y-3">
          {/* 검색 및 필터 */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색..."
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border rounded-lg px-2 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="all">전체</option>
              <option value="published">게시됨</option>
              <option value="draft">임시저장</option>
              <option value="scheduled">예약</option>
            </select>
          </div>
          
          {/* 게시글 리스트 */}
          <div className="space-y-2">
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(post.status)}`}>
                        {post.status === 'published' ? '게시됨' : post.status === 'scheduled' ? '예약' : '임시저장'}
                      </span>
                      <span className="text-xs text-gray-500">{post.category}</span>
                    </div>
                    <h4 className="font-medium text-gray-800 dark:text-white text-sm line-clamp-1">
                      {post.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{post.excerpt}</p>
                  </div>
                  
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {post.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {post.likes}
                    </span>
                  </div>
                  
                  <div className="flex gap-1">
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-500">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-500">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {/* 카테고리 */}
      {activeTab === 'categories' && (
        <div className="space-y-3">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-600 dark:text-gray-400">
            <Plus className="w-4 h-4" />
            카테고리 추가
          </button>
          
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white text-sm">{category.name}</h4>
                <p className="text-xs text-gray-500">/{category.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{category.count}개 글</span>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                  <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 설정 */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">블로그 설정</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">블로그 제목</label>
                <input
                  type="text"
                  defaultValue="GRIP 블로그"
                  className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-500 mb-1 block">글 당 표시 수</label>
                <select className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-600 dark:border-gray-500">
                  <option>10개</option>
                  <option>20개</option>
                  <option>50개</option>
                </select>
              </div>
              
              <label className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">댓글 허용</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary-500" />
              </label>
              
              <label className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">RSS 피드 활성화</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary-500" />
              </label>
            </div>
          </div>
        </div>
      )}
      
      {/* 글쓰기 모달 */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditor(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-4">새 글 작성</h3>
              
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-4 py-3 text-lg font-semibold border-0 border-b dark:bg-gray-800 focus:ring-0 focus:border-primary-500"
                    placeholder="제목을 입력하세요"
                  />
                </div>
                
                {/* 간단한 툴바 */}
                <div className="flex gap-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  {[Bold, Italic, Link, Image, List, Quote, Code].map((Icon, i) => (
                    <button
                      key={i}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  ))}
                </div>
                
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 min-h-[200px]"
                  placeholder="내용을 입력하세요..."
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">카테고리</label>
                    <select
                      value={newPost.category}
                      onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">선택</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">태그</label>
                    <input
                      type="text"
                      value={newPost.tags}
                      onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      placeholder="쉼표로 구분"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">요약</label>
                  <textarea
                    value={newPost.excerpt}
                    onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    rows={2}
                    placeholder="게시글 요약"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowEditor(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleCreatePost}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    임시저장
                  </button>
                  <button
                    onClick={() => {
                      setNewPost({ ...newPost, status: 'published' as const });
                      handleCreatePost();
                    }}
                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                  >
                    게시하기
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BlogCMSPanel;

