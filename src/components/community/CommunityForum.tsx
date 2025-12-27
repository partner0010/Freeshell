/**
 * 커뮤니티 포럼 컴포넌트
 * 사용자 간 소통 및 지식 공유
 */

'use client';

import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, Share2, Bookmark, TrendingUp, Clock, User } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  avatar: string;
  likes: number;
  comments: number;
  views: number;
  category: string;
  createdAt: Date;
  tags: string[];
}

export function CommunityForum() {
  const [isWritingPost, setIsWritingPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('자유');
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      title: 'AI 코드 생성 팁 공유',
      content: 'AI로 코드를 생성할 때 유용한 프롬프트 작성법을 공유합니다...',
      author: '개발자A',
      avatar: '👨‍💻',
      likes: 42,
      comments: 8,
      views: 156,
      category: '코딩',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      tags: ['AI', '코딩', '팁'],
    },
    {
      id: '2',
      title: '템플릿 마켓플레이스 사용 후기',
      content: '템플릿 마켓플레이스를 사용해보니 정말 편리하네요...',
      author: '디자이너B',
      avatar: '👩‍🎨',
      likes: 28,
      comments: 5,
      views: 98,
      category: '디자인',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      tags: ['템플릿', '디자인'],
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', '코딩', '디자인', '콘텐츠', '질문', '자유'];

  const filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter(post => post.category === selectedCategory);

  const getTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return '방금 전';
    if (hours < 24) return `${hours}시간 전`;
    return `${Math.floor(hours / 24)}일 전`;
  };

  return (
    <div className="space-y-6">
      {/* 카테고리 필터 - 반응형 개선 */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              selectedCategory === category
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
            aria-label={`${category === 'all' ? '전체' : category} 카테고리 필터`}
            aria-pressed={selectedCategory === category}
            role="tab"
            tabIndex={0}
          >
            {category === 'all' ? '전체' : category}
          </button>
        ))}
      </div>

      {/* 인기 게시글 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="text-purple-600" size={20} />
          <h3 className="font-bold text-gray-900">인기 게시글</h3>
        </div>
        <div className="space-y-2">
          {posts.slice(0, 3).map((post) => (
            <div key={post.id} className="bg-white rounded-lg p-3 hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-gray-900 mb-1">{post.title}</h4>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span>{post.likes} 좋아요</span>
                <span>{post.comments} 댓글</span>
                <span>{post.views} 조회</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 게시글 목록 */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0" role="img" aria-label={`${post.author}의 아바타`}>
                {post.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{post.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <User size={14} />
                      <span>{post.author}</span>
                      <span>•</span>
                      <Clock size={14} />
                      <span>{getTimeAgo(post.createdAt)}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                        {post.category}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600">
                    <ThumbsUp size={18} />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600">
                    <MessageSquare size={18} />
                    <span>{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600">
                    <Share2 size={18} />
                    <span>공유</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600">
                    <Bookmark size={18} />
                    <span>저장</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 새 게시글 작성 */}
      {!isWritingPost ? (
        <button
          onClick={() => setIsWritingPost(true)}
          className="w-full bg-white rounded-xl border-2 border-dashed border-gray-300 p-6 text-center hover:border-purple-500 transition-colors cursor-pointer"
        >
          <MessageSquare className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-gray-600 font-medium">새 게시글 작성하기</p>
        </button>
      ) : (
        <div className="bg-white rounded-lg sm:rounded-xl border-2 border-purple-500 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">새 게시글 작성</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">제목</label>
              <input
                type="text"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="게시글 제목을 입력하세요"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                aria-label="게시글 제목"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">카테고리</label>
              <select
                value={newPostCategory}
                onChange={(e) => setNewPostCategory(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                aria-label="게시글 카테고리"
              >
                {categories.filter(c => c !== 'all').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">내용</label>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="게시글 내용을 입력하세요"
                rows={6}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (newPostTitle.trim() && newPostContent.trim()) {
                    const newPost: Post = {
                      id: Date.now().toString(),
                      title: newPostTitle,
                      content: newPostContent,
                      author: '나',
                      avatar: '👤',
                      likes: 0,
                      comments: 0,
                      views: 0,
                      category: newPostCategory,
                      createdAt: new Date(),
                      tags: [],
                    };
                    setPosts([newPost, ...posts]);
                    setNewPostTitle('');
                    setNewPostContent('');
                    setNewPostCategory('자유');
                    setIsWritingPost(false);
                  }
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                게시하기
              </button>
              <button
                onClick={() => {
                  setIsWritingPost(false);
                  setNewPostTitle('');
                  setNewPostContent('');
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

