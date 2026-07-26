'use client';

import { motion, AnimatePresence } from 'framer-motion';

const difficultyConfig = {
  easy: {
    label: 'Easy',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  medium: {
    label: 'Medium',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    border: 'border-yellow-500/20',
  },
  hard: {
    label: 'Hard',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/20',
  },
};

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  difficulty = 'medium',
  topic = 'General',
}) {
  const diffStyle = difficultyConfig[difficulty] || difficultyConfig.medium;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={questionNumber}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl"
      >
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-sm font-medium text-gray-400">
            Question{' '}
            <span className="text-white font-bold">{questionNumber}</span>
            {' '}of{' '}
            <span className="text-white font-bold">{totalQuestions}</span>
          </span>

          <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${diffStyle.bg} ${diffStyle.text} ${diffStyle.border}`}>
            {diffStyle.label}
          </span>

          <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-white/10 text-gray-300 border border-white/10">
            {topic}
          </span>
        </div>

        <p className="text-lg md:text-xl text-white leading-relaxed font-medium">
          {question}
        </p>

        <div className="mt-5 flex items-center gap-2 text-gray-400 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Estimated time:{' '}
            {difficulty === 'easy' ? '2-3' : difficulty === 'medium' ? '3-5' : '5-8'} minutes
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
