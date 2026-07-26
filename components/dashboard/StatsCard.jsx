'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const colorMap = {
  violet: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    ring: 'ring-violet-500/20',
    glow: 'shadow-[0_0_15px_rgba(139,92,246,0.15)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.3)]',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    ring: 'ring-cyan-500/20',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.3)]',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    ring: 'ring-emerald-500/20',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    ring: 'ring-amber-500/20',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]',
  },
  rose: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    ring: 'ring-rose-500/20',
    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)] group-hover:shadow-[0_0_25px_rgba(244,63,94,0.3)]',
  },
};

export default function StatsCard({
  icon,
  label,
  value,
  suffix = '',
  trend = 0,
  color = 'violet',
  delay = 0,
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const colors = colorMap[color] || colorMap.violet;

  useEffect(() => {
    if (!isInView) return;

    const numericValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }

    const duration = 1200;
    const steps = 40;
    const increment = numericValue / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = 1 - Math.pow(1 - step / steps, 3);
      current = Math.round(numericValue * progress * 10) / 10;

      if (step >= steps) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Number.isInteger(numericValue) ? Math.round(current) : current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isInView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={`
        group bg-white/5 backdrop-blur-xl border border-white/10
        rounded-2xl p-6 shadow-xl hover:border-white/20
        transition-all duration-300 cursor-default relative overflow-hidden
      `}
    >
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full ${colors.bg} blur-3xl opacity-50 group-hover:opacity-70 transition-opacity`} />

      <div className="flex items-start justify-between relative z-10">
        <div className={`w-12 h-12 rounded-xl ${colors.bg} ring-1 ${colors.ring} flex items-center justify-center text-xl ${colors.glow} transition-all`}>
          {icon}
        </div>

        {trend !== 0 && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${trend > 0 ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-red-400 bg-red-500/10 border border-red-500/20'}`}>
            <svg className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="mt-4 relative z-10">
        <p className="text-3xl font-bold text-white tracking-tight">
          {displayValue}
          {suffix && <span className="text-lg text-gray-500 ml-1">{suffix}</span>}
        </p>
      </div>

      <p className="mt-1.5 text-sm text-gray-400 relative z-10">{label}</p>
    </motion.div>
  );
}
