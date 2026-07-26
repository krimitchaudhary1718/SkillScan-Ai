'use client';

import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer } from 'recharts';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-gray-900 border border-white/10 rounded-lg px-4 py-3 shadow-xl">
      <p className="text-sm font-medium text-white">{payload[0]?.payload?.name}</p>
      <p className="text-xs text-gray-400 mt-1">
        Proficiency: <span className="text-violet-400 font-semibold">{payload[0]?.value}%</span>
      </p>
    </div>
  );
}

function CustomLabel({ payload, x, y, cx, cy }) {
  const offsetX = x > cx ? 8 : x < cx ? -8 : 0;
  const offsetY = y > cy ? 12 : y < cy ? -8 : 0;

  return (
    <text
      x={x + offsetX}
      y={y + offsetY}
      fill="#9ca3af"
      fontSize={11}
      fontWeight={500}
      textAnchor={x > cx ? 'start' : x < cx ? 'end' : 'middle'}
      dominantBaseline="central"
    >
      {payload.value}
    </text>
  );
}

export default function SkillChart({ skills = [] }) {
  if (!skills || skills.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl"
      >
        <h3 className="text-lg font-semibold text-white mb-2">Skills Overview</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-4">🎯</div>
          <p className="text-gray-400 text-sm max-w-xs">
            Upload your resume to see your skills breakdown here. AI will analyze and map your proficiency levels.
          </p>
        </div>
      </motion.div>
    );
  }

  const chartData = skills.map((skill) => ({
    name: skill.name,
    level: Math.min(100, Math.max(0, skill.level)),
    fullMark: 100,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Skills Overview</h3>

      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="name" tick={<CustomLabel />} stroke="rgba(255,255,255,0.2)" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
            
            <Radar
              name="Proficiency"
              dataKey="level"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#colorUv)"
              fillOpacity={0.4}
              dot={{ r: 4, fill: '#a78bfa', stroke: '#8b5cf6', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#c4b5fd', stroke: '#8b5cf6', strokeWidth: 2, className: 'drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]' }}
            />
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.1}/>
              </linearGradient>
            </defs>

            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-center gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_5px_#8b5cf6]" />
          <span>Your Proficiency</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
          <span>Full Mark (100%)</span>
        </div>
      </div>
    </motion.div>
  );
}
