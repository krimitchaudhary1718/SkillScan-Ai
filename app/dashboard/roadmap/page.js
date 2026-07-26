'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import RoadmapTimeline from '@/components/roadmap/RoadmapTimeline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (data.progress?.roadmap) {
        setRoadmap(data.progress.roadmap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const generateRoadmap = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'Full Stack Developer' }) // Example default
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setRoadmap(data.roadmap);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <LoadingSpinner size="lg" color="violet" />
        <p className="text-gray-400">Loading your roadmap...</p>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent pb-1 mb-2">Learning Roadmap</h1>
          <p className="text-gray-400">Get a personalized learning path based on your resume and interview performance.</p>
        </div>
        
        <Card className="text-center p-12 flex flex-col items-center gap-4">
          <div className="text-4xl mb-2">🗺️</div>
          <h3 className="text-xl font-semibold">No Roadmap Yet</h3>
          <p className="text-gray-400 max-w-md">
            Upload your resume and take a mock interview to get a tailored learning path. Or generate a general one now.
          </p>
          <div className="mt-4">
            <Button onClick={generateRoadmap} loading={generating}>
              Generate Learning Roadmap
            </Button>
            {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent pb-1 mb-2">Your Learning Roadmap</h1>
          <p className="text-gray-400">Customized path to ace your target interviews.</p>
        </div>
        <Button variant="secondary" onClick={generateRoadmap} loading={generating}>
          Regenerate Roadmap
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <Card>
          <h2 className="text-xl font-semibold mb-2 text-violet-300">Overview</h2>
          <p className="text-gray-300">{roadmap.overview || 'Follow these phases to improve your skills.'}</p>
          
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-sm text-gray-400 mr-2 self-center">Priority Skills:</span>
            {(roadmap.prioritySkills || []).map(skill => (
              <span key={skill} className="bg-rose-500/10 text-rose-300 border border-rose-500/20 px-3 py-1 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </Card>

        <div>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <span className="text-cyan-400">🚀</span> Action Plan
          </h2>
          <RoadmapTimeline phases={roadmap.phases || []} />
        </div>
      </motion.div>
    </div>
  );
}
