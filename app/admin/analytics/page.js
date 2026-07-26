'use client';

export default function AdminAnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-gray-400">Deep dive into platform usage metrics.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
        <div className="text-6xl mb-4">📈</div>
        <h2 className="text-2xl font-semibold text-white mb-2">Coming Soon</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Detailed charting and analytics reports are currently in development.
          Check back in the next update!
        </p>
      </div>
    </div>
  );
}
