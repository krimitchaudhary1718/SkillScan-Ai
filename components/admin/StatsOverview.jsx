'use client';

import { motion } from 'framer-motion';

/**
 * StatsOverview — Admin dashboard stats grid.
 *
 * Displays 6 stat cards in a responsive 3×2 grid with animated
 * count-up values and color-coded icons.
 *
 * @param {object}  stats   – { totalUsers, totalResumes, totalInterviews, avgResumeScore, avgInterviewScore, newUsers7d }
 * @param {boolean} loading – Show skeleton loaders
 */

// Card configuration map
const cardConfig = [
  {
    key: 'totalUsers',
    label: 'Total Users',
    icon: '👥',
    color: 'from-violet-500 to-purple-500',
    format: (v) => v?.toLocaleString() ?? '—',
  },
  {
    key: 'totalResumes',
    label: 'Total Resumes',
    icon: '📄',
    color: 'from-cyan-500 to-blue-500',
    format: (v) => v?.toLocaleString() ?? '—',
  },
  {
    key: 'totalInterviews',
    label: 'Total Interviews',
    icon: '🎯',
    color: 'from-emerald-500 to-teal-500',
    format: (v) => v?.toLocaleString() ?? '—',
  },
  {
    key: 'avgResumeScore',
    label: 'Avg Resume Score',
    icon: '📊',
    color: 'from-amber-500 to-orange-500',
    format: (v) => (v != null ? `${Math.round(v)}%` : '—'),
  },
  {
    key: 'avgInterviewScore',
    label: 'Avg Interview Score',
    icon: '🏆',
    color: 'from-pink-500 to-rose-500',
    format: (v) => (v != null ? `${Math.round(v)}%` : '—'),
  },
  {
    key: 'newUsers7d',
    label: 'New Users (7 days)',
    icon: '📈',
    color: 'from-indigo-500 to-violet-500',
    format: (v) => v?.toLocaleString() ?? '—',
  },
];

// Skeleton loader for a single card
function SkeletonCard() {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/10" />
        <div className="h-3 w-20 rounded bg-white/10" />
      </div>
      <div className="h-8 w-16 rounded bg-white/10" />
    </div>
  );
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
};

export default function StatsOverview({ stats = {}, loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {cardConfig.map((card) => (
        <motion.div
          key={card.key}
          variants={itemVariants}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/[0.08] transition-colors duration-300"
        >
          {/* Icon + label */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-lg`}>
              {card.icon}
            </div>
            <span className="text-sm text-gray-400 font-medium">{card.label}</span>
          </div>

          {/* Value with count-up feel */}
          <motion.span
            className="text-2xl font-black text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {card.format(stats[card.key])}
          </motion.span>
        </motion.div>
      ))}
    </motion.div>
  );
}
