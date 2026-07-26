'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionCard from '@/components/interview/QuestionCard';
import AnswerInput from '@/components/interview/AnswerInput';
import FeedbackCard from '@/components/interview/FeedbackCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

function SessionContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      router.push('/dashboard/interview');
      return;
    }

    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/interview/session?sessionId=${sessionId}`);
        const data = await res.json();
        
        if (res.ok && data.session) {
          setSession(data.session);
          setCurrentQuestionIndex(data.session.answers?.length || 0);
        } else {
          setError(data.error || 'Session not found');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load session');
      } finally {
        setTimeout(() => setLoading(false), 1500); // give it a moment
      }
    };

    fetchSession();
  }, [sessionId, router]);

  const handleSubmit = async () => {
    if (!answer.trim() || evaluating) return;
    
    setEvaluating(true);
    setError(null);

    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionIndex: currentQuestionIndex,
          answer
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Evaluation failed');

      setCurrentFeedback(data.evaluation);
      
      const updatedAnswers = [...(session.answers || [])];
      updatedAnswers[currentQuestionIndex] = {
        answer,
        evaluation: data.evaluation,
        score: data.evaluation.score
      };
      
      setSession({
        ...session,
        answers: updatedAnswers,
        status: currentQuestionIndex >= session.questions.length - 1 ? 'completed' : 'in-progress'
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = () => {
    setAnswer('');
    setCurrentFeedback(null);
    setCurrentQuestionIndex(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <LoadingSpinner size="lg" color="violet" />
        <p className="text-gray-400">Loading your interview session...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <Card className="text-center p-12 max-w-lg mx-auto mt-12">
        <div className="text-red-400 mb-4">{error || 'Session not found'}</div>
        <Button onClick={() => router.push('/dashboard/interview')}>Back to Setup</Button>
      </Card>
    );
  }

  const isCompleted = session.status === 'completed' || currentQuestionIndex >= session.questions.length;
  
  if (isCompleted) {
    const avg = session.overallScore || Math.round(session.answers.reduce((acc, a) => acc + a.score, 0) / session.answers.length);
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto text-center py-12 space-y-8"
      >
        <div className="w-32 h-32 mx-auto rounded-full bg-white/5 border border-white/10 p-1 flex items-center justify-center">
          <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]">
            <span className="text-4xl font-bold bg-gradient-to-br from-violet-600 to-indigo-600 text-transparent bg-clip-text">{avg}%</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white">Interview Completed!</h1>
        <p className="text-gray-400 text-lg">
          You completed {session.questions.length} questions for {session.role} ({session.category}).
        </p>
        
        <div className="flex justify-center gap-4 pt-8">
          <Button onClick={() => router.push('/dashboard/history')}>View Full History</Button>
          <Button variant="secondary" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </motion.div>
    );
  }

  const currentQ = session.questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">
          Question {currentQuestionIndex + 1} of {session.questions.length}
        </span>
        <span className="text-gray-300 text-sm font-medium">
          {session.category} • {session.difficulty}
        </span>
      </div>
      
      <div className="w-full bg-gray-800 rounded-full h-2 mb-8 border border-white/5">
        <div 
          className="bg-gradient-to-r from-violet-600 to-indigo-600 h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(124,58,237,0.5)]"
          style={{ width: `${((currentQuestionIndex) / session.questions.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        {!currentFeedback ? (
          <motion.div
            key={`q-${currentQuestionIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <QuestionCard 
              question={currentQ.question}
              topic={currentQ.topic}
              timeEstimate={currentQ.timeEstimate}
            />
            
            <AnswerInput
              value={answer}
              onChange={setAnswer}
              onSubmit={handleSubmit}
              loading={evaluating}
            />
          </motion.div>
        ) : (
          <motion.div
            key={`f-${currentQuestionIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <FeedbackCard evaluation={currentFeedback} />
            
            <div className="flex justify-end pt-4">
              <Button size="lg" onClick={handleNext}>
                {currentQuestionIndex < session.questions.length - 1 ? 'Next Question →' : 'Finish Interview ✓'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>}>
      <SessionContent />
    </Suspense>
  );
}
