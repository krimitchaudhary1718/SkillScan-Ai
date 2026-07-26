'use client';

import { motion } from 'framer-motion';
import ResumeScore from '@/components/dashboard/ResumeScore';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } },
};

function getLevelStyle(level) {
  const map = {
    entry: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
    junior: 'bg-cyan-500/10 text-cyan-400 ring-cyan-500/20',
    mid: 'bg-indigo-500/10 text-indigo-400 ring-indigo-500/20',
    senior: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    lead: 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20',
  };
  return map[level?.toLowerCase()] || map.mid;
}

function getReadinessStyle(score) {
  if (score >= 80) return { color: 'from-emerald-400 to-emerald-500', text: 'text-emerald-400' };
  if (score >= 60) return { color: 'from-yellow-400 to-amber-500', text: 'text-yellow-400' };
  if (score >= 40) return { color: 'from-orange-400 to-orange-500', text: 'text-orange-400' };
  return { color: 'from-red-400 to-rose-500', text: 'text-red-400' };
}

export default function AnalysisResult({ analysis }) {
  if (!analysis) return null;

  const {
    score = 0,
    skills = [],
    technologies = [],
    strengths = [],
    weaknesses = [],
    missingSkills = [],
    suggestions = [],
    summary = '',
    experienceLevel = '',
    careerReadiness = null,
  } = analysis;

  const readinessScore = careerReadiness || Math.min(100, Math.round(score * 0.9));
  const readinessStyle = getReadinessStyle(readinessScore);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-purple-500/5">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <ResumeScore score={score} size={160} label="Overall Score" />
          <div className="flex-1 text-center sm:text-left space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Resume Analysis Complete</h2>
              <p className="text-gray-400 text-sm mt-1">AI-powered breakdown of your resume quality and content</p>
            </div>
            {experienceLevel && (
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Experience Level</span>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ring-1 ${getLevelStyle(experienceLevel)}`}>
                  {experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)}
                </span>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Career Readiness</span>
                <span className={`font-semibold ${readinessStyle.text}`}>{readinessScore}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${readinessScore}%` }}
                  transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                  className={`h-full rounded-full bg-gradient-to-r ${readinessStyle.color}`}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {summary && (
        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-xl border border-violet-500/20">🤖</div>
            <h3 className="text-lg font-semibold text-white">AI Summary</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{summary}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-xl border border-cyan-500/20">🎯</div>
            <h3 className="font-semibold text-white">Skills Detected</h3>
            {skills.length > 0 && <span className="ml-auto text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded-md">{skills.length}</span>}
          </div>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-200 text-xs font-medium ring-1 ring-white/10">{skill}</span>
              ))}
            </div>
          ) : <p className="text-gray-500 text-sm">No skills detected</p>}
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl border border-blue-500/20">💻</div>
            <h3 className="font-semibold text-white">Technologies</h3>
            {technologies.length > 0 && <span className="ml-auto text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded-md">{technologies.length}</span>}
          </div>
          {technologies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-200 text-xs font-medium ring-1 ring-white/10">{tech}</span>
              ))}
            </div>
          ) : <p className="text-gray-500 text-sm">No technologies detected</p>}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white">Strengths</h3>
          </div>
          {strengths.length > 0 ? (
            <ul className="space-y-2.5">
              {strengths.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-gray-500 text-sm">No strengths identified</p>}
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white">Weaknesses</h3>
          </div>
          {weaknesses.length > 0 ? (
            <ul className="space-y-2.5">
              {weaknesses.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-gray-500 text-sm">No weaknesses identified</p>}
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white">Missing Skills</h3>
          </div>
          {missingSkills.length > 0 ? (
            <ul className="space-y-2.5">
              {missingSkills.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-gray-500 text-sm">No missing skills — great job!</p>}
        </motion.div>
      </div>

      {suggestions.length > 0 && (
        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-xl border border-violet-500/20">💡</div>
            <div>
              <h3 className="font-semibold text-white">AI Improvement Suggestions</h3>
              <p className="text-xs text-gray-500">Actionable steps to strengthen your resume</p>
            </div>
          </div>
          <ol className="space-y-3">
            {suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-gray-300 text-xs font-bold">{i + 1}</span>
                </div>
                <p className="text-gray-300 leading-relaxed">{suggestion}</p>
              </li>
            ))}
          </ol>
        </motion.div>
      )}
    </motion.div>
  );
}
