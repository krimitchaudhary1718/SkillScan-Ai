'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { icon: '🌐', label: 'Home Page', href: '/' },
  { icon: '🏠', label: 'Dashboard', href: '/dashboard' },
  { icon: '📄', label: 'Resume', href: '/dashboard/resume' },
  { icon: '🎯', label: 'Interview', href: '/dashboard/interview' },
  { icon: '📚', label: 'History', href: '/dashboard/history' },
];

const sidebarVariants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { x: '-100%', opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
};

export default function Sidebar({ isOpen, onToggle }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [imgError, setImgError] = useState(false);

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-950/50 backdrop-blur-xl">
      <div className="px-6 py-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)] group-hover:shadow-[0_0_20px_rgba(124,58,237,0.6)] transition-all">
            <span className="text-lg">🧠</span>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">SkillScan AI</h1>
            <p className="text-[10px] text-violet-400 tracking-widest uppercase font-semibold">Interview Platform</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (onToggle && window.innerWidth < 1024) onToggle();
              }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200 group relative
                ${active ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}
              `}
            >
              {active && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-white/10 rounded-xl border border-white/10 -z-10 shadow-[inset_0_0_20px_rgba(124,58,237,0.15)]"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              {active && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-violet-500 rounded-r-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
              )}
              <span className="text-lg relative z-10 opacity-80 group-hover:opacity-100 transition-opacity">{item.icon}</span>
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10 space-y-3 bg-white/5">
        {session?.user ? (
          <>
            <div className="flex items-center gap-3 px-2">
              <div className="relative">
                {session.user.image && !imgError ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-9 h-9 rounded-full ring-2 ring-violet-500/50 object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-violet-500/50">
                    {(session.user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-gray-900 shadow-[0_0_5px_rgba(52,211,153,0.6)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{session.user.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Sign Out
            </button>
          </>
        ) : (
          <div className="space-y-2 px-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                <div className="h-2.5 w-32 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 z-40 bg-gray-950 border-r border-white/10 flex-col">
        <SidebarContent />
      </aside>

      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-gray-900 border border-white/10 text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer shadow-lg"
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          {isOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />}
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onToggle} className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.aside variants={sidebarVariants} initial="hidden" animate="visible" exit="exit" className="lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50 bg-gray-950 border-r border-white/10 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
