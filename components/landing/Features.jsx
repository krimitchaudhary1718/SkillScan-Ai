'use client';

import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';

/**
 * Features - 6 feature cards in a responsive grid with staggered
 * whileInView animations. Each card showcases a key platform capability.
 */

const features = [
  {
    icon: '📄',
    title: 'Resume Analysis',
    description:
      'AI scans your resume to identify skills, gaps, and strengths. Get actionable feedback to stand out from thousands of applicants.',
  },
  {
    icon: '🤖',
    title: 'AI Mock Interview',
    description:
      'Practice with an AI interviewer that adapts to your skill level. Get real-time feedback on your technical and behavioral answers.',
  },
  {
    icon: '📊',
    title: 'Skill Assessment',
    description:
      'Comprehensive skill mapping across frameworks, languages, and soft skills. Know exactly where you stand before your next interview.',
  },
  {
    icon: '🗺️',
    title: 'Learning Roadmap',
    description:
      'Personalized study plans generated from your skill gaps. Curated resources and milestones to level up efficiently.',
  },
  {
    icon: '📈',
    title: 'Progress Tracking',
    description:
      'Visual dashboards track your improvement over time. Monitor interview scores, skill growth, and readiness indicators.',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    description:
      'Your data stays yours. Enterprise-grade encryption, no third-party sharing, and full GDPR compliance for peace of mind.',
  },
];

// Section-level stagger animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export default function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="inline-block px-3 py-1 text-sm font-medium text-violet-400 bg-violet-500/10 rounded-full border border-violet-500/20 mb-4">
            Features
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Powerful{' '}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Features
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Everything you need to prepare for technical interviews, powered by
            cutting-edge AI technology.
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              hover
              delay={index * 0.1}
              className="group"
            >
              {/* Icon container with gradient glow on hover */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/10 flex items-center justify-center text-2xl mb-5 group-hover:from-violet-600/30 group-hover:to-indigo-600/30 transition-all duration-300">
                {feature.icon}
              </div>

              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-400 leading-relaxed text-sm">
                {feature.description}
              </p>

              {/* Subtle bottom gradient accent on hover */}
              <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-violet-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
