'use client';

/**
 * Dashboard Layout
 * ================
 * Wraps all /dashboard/* pages with:
 *  - Sidebar navigation (fixed left on desktop, drawer on mobile)
 *  - Main content area with proper margin offsets
 *  - Mobile sidebar toggle state management
 *
 * The sidebar is hidden below lg breakpoint and shown via
 * a hamburger menu that triggers a Framer Motion slide-in drawer.
 */

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';

export default function DashboardLayout({ children }) {
  // Controls mobile sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Sidebar with mobile toggle support */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Main content area */}
      <main
        className={`
          min-h-screen transition-all duration-300
          lg:ml-64 ml-0
          p-4 sm:p-6 lg:p-8
          pt-16 lg:pt-8
        `}
      >
        {/* Subtle top-left gradient glow for visual depth */}
        <div className="fixed top-0 left-64 right-0 h-px bg-gradient-to-r from-violet-600/20 via-purple-600/10 to-transparent pointer-events-none hidden lg:block" />

        {children}
      </main>
    </div>
  );
}
