'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ToolbarProps {
  children: ReactNode;
  className?: string;
}

export default function Toolbar({ children, className = '' }: ToolbarProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between ${className}`}
    >
      {children}
    </motion.div>
  );
}

interface ToolbarGroupProps {
  children: ReactNode;
  className?: string;
}

export function ToolbarGroup({ children, className = '' }: ToolbarGroupProps) {
  return <div className={`flex items-center space-x-2 ${className}`}>{children}</div>;
}

interface ToolbarButtonProps {
  onClick: () => void;
  icon: ReactNode;
  label?: string;
  active?: boolean;
  disabled?: boolean;
}

export function ToolbarButton({
  onClick,
  icon,
  label,
  active = false,
  disabled = false,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-colors ${
        active
          ? 'bg-primary text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={label}
    >
      {icon}
    </button>
  );
}

