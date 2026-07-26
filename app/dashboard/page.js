'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';

import StatsCard from '@/components/dashboard/StatsCard';
import SkillChart from '@/components/dashboard/SkillChart';
import ResumeScore from '@/components/dashboard/ResumeScore';
import RecentActivity from '@/components/dashboard/RecentActivity';

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
          <div className="w-12 h-12 rounded-xl bg-white/10 mb-4" />
          <div className="h-8 w-20 bg-white/10 rounded-md mb-2" />
          <div className="h-4 w-28 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
      <div className="h-5 w-36 bg-white/10 rounded mb-6" />
      <div className="h-[300px] flex items-center justify-center">
        <div className="w-48 h-48 rounded-full border-4 border-white/10" />
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
      <div className="h-5 w-36 bg-white/10 rounded mb-6" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3.5 mb-2">
          <div className="w-10 h-10 rounded-lg bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-3 w-20 bg-white/10 rounded" />
          </div>
          <div className="h-6 w-12 bg-white/10 rounded-md" />
        </div>
      ))}
    </div>
  );
}

function EmptyDashboard({ userName }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent pb-1">
          Welcome, {userName || 'there'}!
        </h1>
        <p className="text-gray-400 mt-2 text-sm sm:text-base">
          Get started by uploading your resume or taking a mock interview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Link href="/dashboard/resume" className="block group">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-violet-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                📄
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Upload Your Resume</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Get an AI-powered analysis of your resume with actionable feedback, skill detection, and improvement suggestions.
              </p>
              <div className="mt-5 flex items-center gap-2 text-violet-400 text-sm font-medium group-hover:gap-3 transition-all">
                Get Started
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Link href="/dashboard/interview" className="block group">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-5 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                🎯
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Mock Interview</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Practice with AI-generated interview questions tailored to your target role and get instant feedback.
              </p>
              <div className="mt-5 flex items-center gap-2 text-cyan-400 text-sm font-medium group-hover:gap-3 transition-all">
                Start Now
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error('Failed to load dashboard data');
        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const userName = session?.user?.name?.split(' ')[0] || 'there';

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="h-10 w-72 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-5 w-56 bg-white/5 rounded animate-pulse" />
        </div>
        <StatsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ActivitySkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-3xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-md">{error}</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all cursor-pointer">
          Try Again
        </button>
      </div>
    );
  }

  const hasData = dashboardData && (dashboardData.resumeScore != null || dashboardData.totalInterviews > 0 || (dashboardData.skills && dashboardData.skills.length > 0));

  if (!hasData) {
    return <EmptyDashboard userName={userName} />;
  }

  const {
    resumeScore = 0,
    interviewReadiness = 0,
    totalInterviews = 0,
    averageScore = 0,
    skills = [],
    recentActivity = [],
    suggestions = [],
    weakTopics = [],
  } = dashboardData;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent pb-1">
          Welcome back, {userName}!
        </h1>
        <p className="text-gray-400 mt-2 text-sm sm:text-base">
          Here's your performance overview and AI-powered insights.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center">
          <ResumeScore score={resumeScore} size={120} />
        </motion.div>
        <StatsCard icon="🎯" label="Interview Readiness" value={interviewReadiness} suffix="%" color="cyan" delay={0.15} />
        <StatsCard icon="📋" label="Total Interviews" value={totalInterviews} color="emerald" delay={0.2} />
        <StatsCard icon="⭐" label="Average Score" value={averageScore} suffix="/100" color="amber" delay={0.25} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkillChart skills={skills} />
        <RecentActivity activities={recentActivity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-lg">🤖</div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Suggestions</h3>
              <p className="text-xs text-gray-400">Personalized tips to improve</p>
            </div>
          </div>

          {suggestions.length > 0 ? (
            <ul className="space-y-3">
              {suggestions.map((tip, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.05 }} className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-gray-300 text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{tip}</p>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm py-4 text-center">Complete an interview or upload your resume to get personalized AI suggestions.</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-lg">📌</div>
            <div>
              <h3 className="text-lg font-semibold text-white">Areas to Improve</h3>
              <p className="text-xs text-gray-400">Topics that need more practice</p>
            </div>
          </div>

          {weakTopics.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {weakTopics.map((topic, i) => (
                <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.04 }} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-default">
                  {topic}
                </motion.span>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-gray-500 text-sm">No weak areas identified yet. Take a mock interview to discover your improvement areas.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
