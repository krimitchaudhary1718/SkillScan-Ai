'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import AnalysisResult from '@/components/resume/AnalysisResult';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';

function AnalysisContent() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('id');
  const router = useRouter();
  
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!resumeId) {
      router.push('/dashboard/resume');
      return;
    }

    const fetchAnalysis = async () => {
      try {
        const res = await fetch(`/api/resume/analyze?id=${resumeId}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Failed to fetch analysis');
        
        setAnalysis(data.analysis);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [resumeId, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <LoadingSpinner size="lg" color="violet" />
        <p className="text-gray-400">Loading analysis results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-4 mt-12">
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl inline-block">
          {error}
        </div>
        <div>
          <Button variant="secondary" onClick={() => router.push('/dashboard/resume')}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.push('/dashboard/resume')} className="px-2">
          ← Back
        </Button>
        <h1 className="text-2xl font-bold gradient-text">Detailed Analysis</h1>
      </div>
      
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AnalysisResult analysis={analysis} />
        </motion.div>
      )}
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>}>
      <AnalysisContent />
    </Suspense>
  );
}
