'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import RoleSelector from '@/components/interview/RoleSelector';
import Button from '@/components/ui/Button';

const ROLES = [
  { id: 'frontend', title: 'Frontend Developer', icon: '🎨', description: 'React, Vue, CSS, UI/UX' },
  { id: 'backend', title: 'Backend Developer', icon: '⚙️', description: 'Node.js, APIs, Databases' },
  { id: 'fullstack', title: 'Full Stack Developer', icon: '🌐', description: 'Frontend + Backend' },
  { id: 'aiml', title: 'AI/ML Engineer', icon: '🤖', description: 'Python, Models, Data' },
  { id: 'data', title: 'Data Scientist', icon: '📊', description: 'Analytics, Stats, SQL' },
  { id: 'devops', title: 'DevOps Engineer', icon: '🚀', description: 'CI/CD, Cloud, Docker' },
];

const CATEGORIES = {
  frontend: ['React', 'Next.js', 'JavaScript', 'CSS/Tailwind', 'System Design'],
  backend: ['Node.js', 'Python', 'Java', 'Databases', 'System Design', 'API Design'],
  fullstack: ['React', 'Node.js', 'System Design', 'Databases', 'Web Architecture'],
  aiml: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Python'],
  data: ['SQL', 'Data Analysis', 'Statistics', 'Python/Pandas', 'Data Visualization'],
  devops: ['AWS/GCP', 'Docker/Kubernetes', 'CI/CD pipelines', 'Linux', 'Networking']
};

export default function InterviewSetupPage() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const availableCategories = role ? CATEGORIES[role.id] : [];

  const handleStart = async () => {
    if (!role || !category) return;
    
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/interview/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: role.title,
          category,
          difficulty
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start interview');

      router.push(`/dashboard/interview/session?sessionId=${data.sessionId}`);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">AI Mock Interview</h1>
        <p className="text-gray-400">
          Customize your practice session. Our AI will generate tailored technical questions.
        </p>
      </motion.div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20">
          {error}
        </div>
      )}

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-white/10 text-gray-300 flex items-center justify-center text-sm border border-white/10">1</span>
            Select Target Role
          </h2>
          <RoleSelector 
            roles={ROLES} 
            selectedRole={role?.id} 
            onSelect={(roleId) => { 
              setRole(ROLES.find(r => r.id === roleId)); 
              setCategory(''); 
            }} 
          />
        </section>

        {role && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-white/10 text-gray-300 flex items-center justify-center text-sm border border-white/10">2</span>
                Choose Focus Area
              </h2>
              <div className="flex flex-wrap gap-3">
                {availableCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-xl border transition-all ${
                      category === cat 
                        ? 'bg-violet-500/20 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-white/10 text-gray-300 flex items-center justify-center text-sm border border-white/10">3</span>
                Select Difficulty
              </h2>
              <div className="flex gap-4">
                {['easy', 'medium', 'hard'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`px-6 py-2 rounded-xl capitalize transition-all border ${
                      difficulty === diff
                        ? diff === 'easy' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : diff === 'medium' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                          : 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-gray-300'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <Button 
                size="lg" 
                className="w-full sm:w-auto"
                disabled={!category || loading}
                loading={loading}
                onClick={handleStart}
              >
                {loading ? 'Generating Interview...' : 'Start Mock Interview'}
              </Button>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
