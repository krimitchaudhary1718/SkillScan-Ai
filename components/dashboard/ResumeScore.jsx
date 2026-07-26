'use client';

/**
 * ResumeScore - Animated circular score gauge
 * =============================================
 * SVG circular progress ring that animates from 0 to score.
 * Color dynamically changes based on score thresholds:
 *  - Red    (<40)
 *  - Orange (40-60)
 *  - Yellow (60-75)
 *  - Green  (75-90)
 *  - Cyan   (90+)
 *
 * @param {number} score  - Value 0-100
 * @param {number} size   - Diameter in px (default 150)
 * @param {string} label  - Label below the gauge
 */

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// Score → color mapping
function getScoreColor(score) {
  if (score >= 90) return { stroke: '#06b6d4', text: 'text-cyan-400', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.3)]' };
  if (score >= 75) return { stroke: '#10b981', text: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' };
  if (score >= 60) return { stroke: '#eab308', text: 'text-yellow-400', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]' };
  if (score >= 40) return { stroke: '#f97316', text: 'text-orange-400', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]' };
  return { stroke: '#ef4444', text: 'text-red-400', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' };
}

// Score → grade label
function getGrade(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Great';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Work';
}

export default function ResumeScore({
  score = 0,
  size = 150,
  label = 'Resume Score',
}) {
  const [displayScore, setDisplayScore] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });

  const clampedScore = Math.min(100, Math.max(0, score));
  const { stroke, text, glow } = getScoreColor(clampedScore);
  const grade = getGrade(clampedScore);

  // SVG circle geometry
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  // Count-up animation for the displayed number
  useEffect(() => {
    if (!isInView) return;

    const duration = 1400;
    const steps = 50;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = 1 - Math.pow(1 - step / steps, 3);
      const current = Math.round(clampedScore * progress);

      if (step >= steps) {
        setDisplayScore(clampedScore);
        clearInterval(timer);
      } else {
        setDisplayScore(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [clampedScore, isInView]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-3">
      {/* Circular gauge */}
      <div className={`relative ${glow} rounded-full bg-gray-900`}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />

          {/* Animated progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={
              isInView
                ? { strokeDashoffset: offset }
                : { strokeDashoffset: circumference }
            }
            transition={{
              duration: 1.4,
              ease: [0.21, 0.47, 0.32, 0.98],
              delay: 0.2,
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span className={`text-3xl font-bold ${text}`}>
            {displayScore}
          </span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
            {grade}
          </span>
        </div>
      </div>

      {/* Label */}
      <p className="text-sm text-gray-400 font-medium">{label}</p>
    </div>
  );
}
