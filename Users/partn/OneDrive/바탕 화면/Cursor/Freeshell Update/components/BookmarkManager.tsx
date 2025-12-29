'use client';

import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Star, Tag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  type: 'search' | 'spark' | 'drive';
  tags: string[];
  createdAt: string;
}

export default function BookmarkManager() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('bookmarks');
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  }, []);

  const saveBookmarks = (newBookmarks: BookmarkItem[]) => {
    setBookmarks(newBookmarks);
    localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
  };

  const addBookmark = (item: Omit<BookmarkItem, 'id' | 'createdAt'>) => {
    const newBookmark: BookmarkItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    saveBookmarks([...bookmarks, newBookmark]);
  };

  const removeBookmark = (id: string) => {
    saveBookmarks(bookmarks.filter(b => b.id !== id));
  };

  const allTags = Array.from(new Set(bookmarks.flatMap(b => b.tags)));
  const filteredBookmarks = filterTag
    ? bookmarks.filter(b => b.tags.includes(filterTag))
    : bookmarks;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-secondary text-white rounded-full shadow-lg hover:bg-secondary-dark transition-colors flex items-center justify-center z-40"
      >
        <Bookmark className="w-6 h-6" />
        {bookmarks.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
            {bookmarks.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed bottom-24 right-6 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span>북마크</span>
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {allTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterTag(null)}
                      className={`px-2 py-1 rounded text-xs ${
                        filterTag === null
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      전체
                    </button>
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setFilterTag(tag)}
                        className={`px-2 py-1 rounded text-xs ${
                          filterTag === tag
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="overflow-y-auto flex-1">
                {filteredBookmarks.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>북마크가 없습니다</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredBookmarks.map((bookmark) => (
                      <motion.div
                        key={bookmark.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <a
                              href={bookmark.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium hover:text-primary transition-colors block truncate"
                            >
                              {bookmark.title}
                            </a>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {bookmark.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary/10 text-primary"
                                >
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => removeBookmark(bookmark.id)}
                            className="ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// 북마크 추가 유틸리티 함수
export function addBookmark(title: string, url: string, type: 'search' | 'spark' | 'drive', tags: string[] = []) {
  const saved = localStorage.getItem('bookmarks');
  const bookmarks: BookmarkItem[] = saved ? JSON.parse(saved) : [];
  
  const newBookmark: BookmarkItem = {
    id: Date.now().toString(),
    title,
    url,
    type,
    tags,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem('bookmarks', JSON.stringify([...bookmarks, newBookmark]));
}

