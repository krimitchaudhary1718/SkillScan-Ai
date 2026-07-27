'use client';

import { motion } from 'framer-motion';

/**
 * HowItWorks - 4-step horizontal timeline (vertical on mobile) showing
 * the user journey through the platform. Each step has a numbered circle,
 * title, description, and connecting gradient line.
 */

const steps = [
  {
    number: '01',
    title: 'Upload Resume',
    description:
      'Drop your PDF resume and our AI instantly parses your skills, experience, and education.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'AI Analysis',
    description:
      'Gemini AI evaluates your profile against industry standards, identifying strengths and gaps.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-.573.097c-3.074.52-6.175.52-9.249 0l-.573-.097C8.507 20.013 7.925 17.927 9.157 16.695L10.56 15.3" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Practice Interview',
    description:
      'Enter an adaptive AI interview session with questions tailored to your target role and skill level.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Track Progress',
    description:
      'Monitor your scores, identify weak areas, and watch your interview readiness soar.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="inline-block px-3 py-1 text-sm font-medium text-cyan-400 bg-cyan-500/10 rounded-full border border-cyan-500/20 mb-4">
            Process
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            How It{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From resume upload to interview mastery in four simple steps.
          </p>
        </motion.div>

        {/* Steps - Horizontal on desktop, Vertical on mobile */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-px bg-gradient-to-r from-violet-600/50 via-cyan-500/50 to-violet-600/50" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Mobile connecting line */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden absolute left-1/2 top-[72px] w-px h-[calc(100%+32px)] bg-gradient-to-b from-violet-600/40 to-transparent" />
                )}

                {/* Number circle */}
                <div className="relative z-10 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <span className="text-white">{step.icon}</span>
                  </div>
                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-gray-950 border-2 border-violet-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-violet-400">{step.number}</span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-[250px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
