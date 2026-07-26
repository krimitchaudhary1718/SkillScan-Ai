'use client';

import { motion } from 'framer-motion';

/**
 * LoadingSpinner - Dual-mode loading indicator with gradient stroke.
 *
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} variant - 'spinner' | 'dots'
 */

const sizeMap = {
  sm: { spinner: 20, dots: 6 },
  md: { spinner: 32, dots: 8 },
  lg: { spinner: 48, dots: 10 },
};

// Pulsing dots animation variant
function PulsingDots({ size = 'md' }) {
  const dotSize = sizeMap[size].dots;
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="rounded-full bg-violet-400"
          style={{ width: dotSize, height: dotSize }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// SVG spinner with gradient stroke
function GradientSpinner({ size = 'md' }) {
  const dim = sizeMap[size].spinner;
  const strokeWidth = size === 'sm' ? 3 : size === 'lg' ? 4 : 3.5;

  return (
    <motion.svg
      width={dim}
      height={dim}
      viewBox="0 0 50 50"
      animate={{ rotate: 360 }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <defs>
        <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      {/* Track circle */}
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={strokeWidth}
      />
      {/* Animated arc */}
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="url(#spinner-gradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray="80 200"
        strokeDashoffset="0"
      />
    </motion.svg>
  );
}

export default function LoadingSpinner({ size = 'md', variant = 'spinner' }) {
  if (variant === 'dots') {
    return <PulsingDots size={size} />;
  }
  return <GradientSpinner size={size} />;
}
