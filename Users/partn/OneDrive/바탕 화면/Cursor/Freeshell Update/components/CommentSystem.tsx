'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, User, Trash2 } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  replies?: Comment[];
}

export default function CommentSystem({ itemId }: { itemId: string }) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: '사용자1',
      content: '정말 유용한 정보네요!',
      timestamp: '2024-01-15 10:30',
    },
  ]);
  const [newComment, setNewComment] = useState('');

  const addComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: '현재 사용자',
      content: newComment,
      timestamp: new Date().toLocaleString('ko-KR'),
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  const deleteComment = (id: string) => {
    setComments(comments.filter(c => c.id !== id));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-6">
        <MessageCircle className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">댓글</h2>
        <span className="text-gray-500 dark:text-gray-400">({comments.length})</span>
      </div>

      <div className="mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addComment()}
            placeholder="댓글을 입력하세요..."
            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={addComment}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
          >
            <Send className="w-5 h-5" />
            <span>전송</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{comment.author}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{comment.timestamp}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

