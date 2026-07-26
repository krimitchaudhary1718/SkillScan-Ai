'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

function getScoreStyle(score) {
  if (score >= 80) return 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20';
  if (score >= 60) return 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20';
  if (score >= 40) return 'bg-orange-500/10 text-orange-400 ring-orange-500/20';
  return 'bg-red-500/10 text-red-400 ring-red-500/20';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] } },
};

export default function RecentActivity({ activities = [] }) {
  if (!activities || activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-4">🎤</div>
          <p className="text-gray-400 text-sm mb-4 max-w-xs">
            No interviews yet. Start your first AI mock interview and track your progress here!
          </p>
          <Link
            href="/dashboard/interview"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:brightness-110 transition-all duration-200 shadow-[0_0_15px_rgba(124,58,237,0.3)]"
          >
            Start Interview
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        <Link href="/dashboard/history" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
          View All →
        </Link>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="space-y-2"
      >
        {activities.map((activity, index) => (
          <motion.div
            key={activity._id || index}
            variants={itemVariants}
            className="flex items-center gap-4 p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg shrink-0 shadow-sm">
              🎯
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {activity.role || 'Mock Interview'}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {activity.category && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                    {activity.category}
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {formatDate(activity.createdAt)}
                </span>
              </div>
            </div>

            {activity.overallScore != null && (
              <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold ring-1 ${getScoreStyle(activity.overallScore)}`}>
                {activity.overallScore}%
              </div>
            )}

            <div className="hidden sm:flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${activity.status === 'completed' ? 'bg-emerald-500' : 'bg-yellow-500 animate-pulse'}`} />
              <span className={`text-xs font-medium ${activity.status === 'completed' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {activity.status === 'completed' ? 'Completed' : 'In Progress'}
              </span>
            </div>

            <Link
              href={`/dashboard/history?session=${activity._id}`}
              className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
