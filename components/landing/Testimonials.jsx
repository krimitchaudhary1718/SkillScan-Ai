'use client';

import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';

/**
 * Testimonials - Social proof section with 3 student testimonials.
 * Each card includes a quote, author info, and star rating.
 */

const testimonials = [
  {
    quote:
      'SkillScan AI completely transformed my interview prep. The AI mock interviews were incredibly realistic — I felt more prepared than after any bootcamp practice session. Landed my dream role at Google!',
    name: 'Sarah Chen',
    role: 'Software Engineer',
    company: 'Google',
    initials: 'SC',
    color: 'from-violet-500 to-purple-600',
    stars: 5,
  },
  {
    quote:
      'The resume analysis pinpointed exactly what I was missing. Within two weeks of following the personalized roadmap, I got callbacks from 3 FAANG companies. This tool is a game-changer for job seekers.',
    name: 'Marcus Johnson',
    role: 'Frontend Developer',
    company: 'Meta',
    initials: 'MJ',
    color: 'from-cyan-500 to-blue-600',
    stars: 5,
  },
  {
    quote:
      'As a career switcher, I had no idea where my gaps were. SkillScan mapped everything out and gave me a clear path forward. The progress tracking kept me accountable. Now I\'m at Microsoft!',
    name: 'Priya Patel',
    role: 'Full Stack Developer',
    company: 'Microsoft',
    initials: 'PP',
    color: 'from-emerald-500 to-teal-600',
    stars: 5,
  },
];

// Render 5 stars with filled/empty based on rating
function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < count ? 'text-amber-400' : 'text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="inline-block px-3 py-1 text-sm font-medium text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            What Students{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Say
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Join thousands of developers who accelerated their career with
            SkillScan AI.
          </p>
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              hover
              delay={index * 0.12}
              className="flex flex-col justify-between"
            >
              {/* Star rating */}
              <div>
                <StarRating count={testimonial.stars} />

                {/* Quote */}
                <blockquote className="mt-4 text-gray-300 text-sm leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
              </div>

              {/* Author info */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
                {/* Avatar with gradient */}
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-sm font-bold text-white shrink-0`}
                >
                  {testimonial.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
