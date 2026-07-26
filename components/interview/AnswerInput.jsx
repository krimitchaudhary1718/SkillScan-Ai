'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AnswerInput({
  value = '',
  onChange,
  onSubmit,
  loading = false,
  disabled = false,
}) {
  const textareaRef = useRef(null);
  const charCount = value.length;

  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !loading && !disabled && value.trim()) {
      e.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="space-y-3"
    >
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          placeholder="Type your answer here..."
          rows={6}
          className={`
            w-full min-h-[150px] resize-y rounded-2xl
            bg-gray-900/50 border border-white/10
            text-white placeholder-gray-500
            p-5 text-base leading-relaxed
            focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500
            transition-all duration-300 shadow-inner
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />

        <div className="absolute bottom-3 right-4 text-xs text-gray-400">
          {charCount > 0 && (
            <span className={charCount > 2000 ? 'text-red-400' : ''}>
              {charCount.toLocaleString()} characters
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 hidden sm:block">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-gray-300 text-[10px] font-mono">Ctrl</kbd>
          {' + '}
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-gray-300 text-[10px] font-mono">Enter</kbd>
          {' '}to submit
        </p>

        <button
          onClick={onSubmit}
          disabled={loading || disabled || !value.trim()}
          className={`
            px-6 py-2.5 rounded-lg font-semibold text-sm
            flex items-center gap-2 transition-all duration-300 shadow-md
            disabled:opacity-40 disabled:cursor-not-allowed
            ${
              loading
                ? 'bg-white/10 text-gray-400'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:brightness-110 shadow-purple-500/25 hover:shadow-purple-500/40'
            }
          `}
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>AI is evaluating…</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Submit Answer</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
