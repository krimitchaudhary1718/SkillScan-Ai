'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useSession } from 'next-auth/react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

const stats = [
  { value: '10,000+', label: 'Students' },
  { value: '95%', label: 'Success Rate' },
  { value: '500+', label: 'Companies' },
];

export default function Hero() {
  const { data: session } = useSession();

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden pt-32 pb-16">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-violet-600/20 to-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center"
      >
        {/* Top badge */}
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-gray-300 shadow-sm">
            <span className="text-base">🚀</span>
            <span>AI-Powered Interview Prep</span>
          </div>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight leading-[1.1]"
        >
          <span className="text-white">Master Your</span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent italic">
            Technical Interview
          </span>
          <br />
          <span className="text-white">With AI Intelligence</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="mt-6 md:mt-8 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
        >
          Upload your resume, get AI-powered skill analysis, practice with
          realistic interviews, and receive a personalized learning roadmap
          to land your dream tech job.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={itemVariants}
          className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href={session ? '/dashboard/resume' : '/auth/signin'}>
            <Button variant="primary" size="lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Resume
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="secondary" size="lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How it Works
            </Button>
          </a>
        </motion.div>

        {/* Subtext under CTAs */}
        <motion.p
          variants={itemVariants}
          className="mt-5 text-sm text-gray-500"
        >
          ✨ Free to start &bull; No credit card required
        </motion.p>

        {/* Social proof stats */}
        <motion.div
          variants={itemVariants}
          className="mt-16 md:mt-20 flex flex-wrap items-center justify-center gap-8 md:gap-16"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-serif font-bold text-white">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
