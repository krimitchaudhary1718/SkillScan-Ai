'use client';

import { motion } from 'framer-motion';

/**
 * RoadmapTimeline — Vertical timeline with gradient connector for
 * learning phase milestones.
 *
 * Each phase shows: number, title, duration, description, topics, projects.
 *
 * @param {Array} phases – [{ title, duration, description, topics[], projects[] }]
 */

// Priority color helper for topic tags
function getPriorityColor(index) {
  const colors = [
    'bg-violet-500/15 text-violet-300 border-violet-500/30',
    'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    'bg-amber-500/15 text-amber-300 border-amber-500/30',
    'bg-pink-500/15 text-pink-300 border-pink-500/30',
  ];
  return colors[index % colors.length];
}

const phaseVariants = {
  hidden: { opacity: 0, x: -30 },
  show: (i) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay: i * 0.15, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
};

export default function RoadmapTimeline({ phases = [] }) {
  if (phases.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No learning phases available yet.
      </div>
    );
  }

  return (
    <div className="relative">
      {/* ── Vertical gradient connector line ── */}
      <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 via-purple-500 to-indigo-500 opacity-30" />

      <div className="space-y-8">
        {phases.map((phase, index) => (
          <motion.div
            key={index}
            custom={index}
            variants={phaseVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="relative pl-16 md:pl-20"
          >
            {/* ── Phase number circle ── */}
            <div className="absolute left-3 md:left-5 top-1 w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center ring-4 ring-gray-950 z-10">
              <span className="text-xs font-bold text-white">{index + 1}</span>
            </div>

            {/* ── Phase card ── */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl shadow-purple-500/5">
              {/* Header row */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h3 className="text-lg font-bold text-white">{phase.title}</h3>
                {phase.duration && (
                  <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    ⏱ {phase.duration}
                  </span>
                )}
              </div>

              {/* Description */}
              {phase.description && (
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {phase.description}
                </p>
              )}

              {/* Topics */}
              {phase.topics?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Topics
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {phase.topics.map((topic, ti) => (
                      <span
                        key={ti}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getPriorityColor(ti)}`}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Projects */}
              {phase.projects?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Recommended Projects
                  </p>
                  <div className="space-y-2">
                    {phase.projects.map((project, pi) => (
                      <div
                        key={pi}
                        className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-gray-300 flex items-start gap-2"
                      >
                        <span className="text-violet-400 mt-0.5">🚀</span>
                        <span>{project}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
