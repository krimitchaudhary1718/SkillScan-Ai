'use client';

import { motion } from 'framer-motion';

function getGradeInfo(score) {
  if (score >= 90) return { letter: 'A+', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', barColor: 'bg-emerald-500' };
  if (score >= 80) return { letter: 'A',  color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', barColor: 'bg-emerald-500' };
  if (score >= 70) return { letter: 'B',  color: 'text-blue-400',  bg: 'bg-blue-500/10',  border: 'border-blue-500/20',  barColor: 'bg-blue-500'  };
  if (score >= 60) return { letter: 'C',  color: 'text-yellow-400',bg: 'bg-yellow-500/10',border: 'border-yellow-500/20',barColor: 'bg-yellow-500'};
  if (score >= 50) return { letter: 'D',  color: 'text-orange-400',bg: 'bg-orange-500/10',border: 'border-orange-500/20',barColor: 'bg-orange-500'};
  return              { letter: 'F',  color: 'text-red-400',   bg: 'bg-red-500/10',   border: 'border-red-500/20',   barColor: 'bg-red-500'   };
}

function ScoreBar({ label, value = 0, delay = 0, barColor }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-semibold">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
    </div>
  );
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function FeedbackCard({ evaluation }) {
  if (!evaluation) return null;

  const {
    correctness = 0,
    completeness = 0,
    clarity = 0,
    feedback = '',
    keyPoints = [],
    improvements = [],
  } = evaluation;

  const overallScore = Math.round((correctness * 0.4 + completeness * 0.35 + clarity * 0.25));
  const grade = getGradeInfo(overallScore);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center gap-5">
        <div className={`w-20 h-20 rounded-2xl ${grade.bg} border ${grade.border} flex items-center justify-center`}>
          <span className={`text-3xl font-bold ${grade.color}`}>
            {grade.letter}
          </span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">AI Evaluation</h3>
          <p className="text-gray-400 text-sm mt-0.5">
            Overall score:{' '}
            <span className={`font-bold ${grade.color}`}>{overallScore}/100</span>
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Score Breakdown
        </h4>
        <ScoreBar label="Correctness" value={correctness} delay={0.2} barColor={grade.barColor} />
        <ScoreBar label="Completeness" value={completeness} delay={0.3} barColor={grade.barColor} />
        <ScoreBar label="Clarity" value={clarity} delay={0.4} barColor={grade.barColor} />
      </motion.div>

      {feedback && (
        <motion.div variants={itemVariants} className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Feedback
          </h4>
          <p className="text-gray-300 text-sm leading-relaxed bg-white/5 rounded-xl p-4 border border-white/10">
            {feedback}
          </p>
        </motion.div>
      )}

      {keyPoints.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Key Points
          </h4>
          <ul className="space-y-2">
            {keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <svg className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">{point}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {improvements.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Areas to Improve
          </h4>
          <ul className="space-y-2">
            {improvements.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <svg className="w-4 h-4 mt-0.5 text-yellow-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}
