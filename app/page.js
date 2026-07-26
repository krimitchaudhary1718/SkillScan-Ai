import Navbar from '@/components/ui/Navbar';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Testimonials from '@/components/landing/Testimonials';
import Footer from '@/components/landing/Footer';

/**
 * Landing Page
 *
 * Assembles all landing sections with the animated background
 * layered behind content. Each section handles its own scroll
 * animations via Framer Motion's whileInView.
 */
export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Animated gradient orbs behind all content */}
      <AnimatedBackground />

      {/* Fixed navigation bar */}
      <Navbar />

      {/* Page sections (rendered in order, z-10 relative above background) */}
      <div className="relative z-10">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />

        {/* CTA Banner before footer */}
        <section className="py-24 md:py-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="relative bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-indigo-600/10 border border-white/10 rounded-3xl p-10 md:p-16 backdrop-blur-xl overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl" />

              <h2 className="relative text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Ace Your Next Interview?
              </h2>
              <p className="relative text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of developers who landed their dream jobs
                with SkillScan AI. Start for free today.
              </p>
              <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/auth/signin"
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-medium text-white bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-xl hover:brightness-110 shadow-lg shadow-purple-500/25 transition-all"
                >
                  Get Started Free
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-medium text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
