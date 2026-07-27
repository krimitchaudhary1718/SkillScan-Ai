'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import UploadZone from '@/components/resume/UploadZone';
import AnalysisResult from '@/components/resume/AnalysisResult';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ResumePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        if (data.resume && data.resume.analysis) {
          setAnalysis(data.resume.analysis);
        }
      } catch (err) {
        console.error('Failed to fetch resumes:', err);
      } finally {
        setInitialLoad(false);
      }
    };
    fetchResumes();
  }, []);

  const handleUpload = async (file) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || 'Upload failed');
      }

      const analyzeRes = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId: uploadData.resumeId }),
      });

      const analyzeData = await analyzeRes.json();

      if (!analyzeRes.ok) {
        throw new Error(analyzeData.error || 'Analysis failed');
      }

      setAnalysis(analyzeData.analysis);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-3xl font-bold text-white">Resume Analysis</h1>
        <p className="text-gray-400">
          Upload your resume to get AI-powered feedback, skill gap analysis, and tailored improvement tips.
        </p>
      </motion.div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {initialLoad ? (
        <Card className="flex flex-col items-center justify-center p-12 gap-4">
          <LoadingSpinner size="lg" color="violet" />
          <p className="text-gray-400">Loading your profile...</p>
        </Card>
      ) : (
        <>
          {!analysis && (
            <UploadZone onUpload={handleUpload} loading={loading} />
          )}

          {loading && (
            <Card className="flex flex-col items-center justify-center p-12 gap-4">
              <LoadingSpinner size="lg" color="violet" />
              <p className="text-gray-400 animate-pulse">Our AI is analyzing your resume...</p>
            </Card>
          )}

          {analysis && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Latest Analysis</h2>
                <Button variant="secondary" onClick={() => setAnalysis(null)}>
                  Upload New Resume
                </Button>
              </div>
              <AnalysisResult analysis={analysis} />
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
