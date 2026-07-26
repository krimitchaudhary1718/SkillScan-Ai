'use client';

import { useState, useEffect } from 'react';
import StatsOverview from '@/components/admin/StatsOverview';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <LoadingSpinner size="lg" color="violet" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Platform Overview</h1>
        <p className="text-gray-400">System statistics and overall metrics.</p>
      </div>

      {stats && <StatsOverview stats={stats} />}

      {/* Placeholder for more advanced charts down the line */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-64 flex items-center justify-center">
          <p className="text-gray-500">Signups Chart Placeholder</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-64 flex items-center justify-center">
          <p className="text-gray-500">Activity Chart Placeholder</p>
        </div>
      </div>
    </div>
  );
}
