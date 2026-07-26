'use client';

import { motion } from 'framer-motion';

/**
 * Card - Glassmorphism container with smooth reveal animation.
 *
 * @param {React.ReactNode} children - Card content
 * @param {string} className - Additional classes
 * @param {boolean} hover - Enable hover glow/scale effects
 * @param {number} delay - Animation delay for stagger effects
 */
export default function Card({
  children,
  className = '',
  hover = false,
  delay = 0,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      whileHover={
        hover
          ? { scale: 1.02, transition: { duration: 0.2 } }
          : {}
      }
      className={`
        bg-white/5 backdrop-blur-xl border border-white/10
        rounded-2xl p-6 md:p-8 shadow-xl
        ${hover ? 'hover:shadow-purple-500/10 hover:border-white/20 transition-all duration-300 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
