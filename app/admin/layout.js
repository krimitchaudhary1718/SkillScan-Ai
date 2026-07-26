'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingSpinner size="lg" color="violet" />
      </div>
    );
  }

  // Double check admin role on client side
  if (status === 'unauthenticated' || (session?.user && session.user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center p-4">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-gray-400 mb-6">You need administrator privileges to access this area.</p>
        <Link 
          href="/dashboard"
          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const navItems = [
    { name: 'Overview', path: '/admin', icon: '📊' },
    { name: 'Users', path: '/admin/users', icon: '👥' },
    { name: 'Analytics', path: '/admin/analytics', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-gray-950/50 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link href="/admin">
            <h1 className="text-xl font-bold gradient-text">SkillScan Admin</h1>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link 
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <span>←</span>
            <span>Exit Admin</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
