'use client';

import { motion } from 'framer-motion';

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

export default function RoleSelector({ roles = [], selectedRole, onSelect }) {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {roles.map((role) => {
        const isSelected = selectedRole === role.id;

        return (
          <motion.button
            key={role.id}
            variants={cardVariants}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(role.id)}
            className={`
              relative text-left p-5 rounded-2xl border
              transition-all duration-300 cursor-pointer outline-none overflow-hidden group
              ${
                isSelected
                  ? 'bg-white/10 border-violet-500 ring-2 ring-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-xl'
              }
            `}
          >
            {isSelected && (
              <motion.div
                layoutId="role-indicator"
                className="absolute inset-0 rounded-2xl bg-violet-500/10 -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}

            <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">{role.icon}</span>

            <h3 className="text-white font-semibold text-lg mb-1">
              {role.title}
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed">
              {role.description}
            </p>

            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.8)]"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
