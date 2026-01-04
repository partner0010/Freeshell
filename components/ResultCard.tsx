'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Star, Calendar } from 'lucide-react';
import Image from 'next/image';

interface ResultCardProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  date?: string;
  rating?: number;
  category?: string;
}

export default function ResultCard({
  title,
  description,
  url,
  image,
  date,
  rating,
  category,
}: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
    >
      {image && (
        <div className="w-full h-48 rounded-lg mb-4 bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
          <Image 
            src={image} 
            alt={title} 
            fill
            className="object-cover rounded-lg"
            unoptimized
          />
        </div>
      )}
      
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-xl font-semibold flex-1">{title}</h3>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{description}</p>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          {date && (
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4 mr-1" />
              {date}
            </div>
          )}
          {rating && (
            <div className="flex items-center text-yellow-500">
              <Star className="w-4 h-4 mr-1 fill-current" />
              {rating}
            </div>
          )}
        </div>
        {category && (
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
            {category}
          </span>
        )}
      </div>
    </motion.div>
  );
}

