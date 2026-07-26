'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';

export default function HistoryPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        if (data.recentInterviews) {
          setInterviews(data.recentInterviews);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <LoadingSpinner size="lg" color="violet" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent pb-1 mb-2">Interview History</h1>
        <p className="text-gray-400">Review your past mock interviews and track progress.</p>
      </div>

      {interviews.length === 0 ? (
        <Card className="text-center p-12">
          <p className="text-gray-400 mb-4">You haven't completed any interviews yet.</p>
          <Link href="/dashboard/interview" className="text-violet-400 hover:text-violet-300 font-medium">
            Start your first mock interview →
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {interviews.map((session, i) => {
            const date = new Date(session.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            });
            const score = session.overallScore || 0;
            const statusColor = session.status === 'completed' ? 'text-emerald-400 bg-emerald-400/10' : 'text-yellow-400 bg-yellow-400/10';

            return (
              <motion.div
                key={session._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/dashboard/interview/session?sessionId=${session._id}`}>
                  <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-violet-500/30 hover:bg-white/10 transition-all cursor-pointer">
                    <div className="flex gap-4 items-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg
                        ${score >= 80 ? 'bg-emerald-500/20 text-emerald-300' : score >= 60 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}
                      `}>
                        {score}%
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{session.role}</h3>
                        <p className="text-sm text-gray-400">{session.category} • {session.difficulty}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-gray-400">{date}</span>
                      <span className={`px-3 py-1 rounded-full border border-current ${statusColor} capitalize`}>
                        {session.status}
                      </span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
