'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * UsersTable — Admin users management table.
 *
 * Responsive: glassmorphism table on desktop, card layout on mobile.
 * Includes search input, sortable columns, and pagination.
 *
 * @param {Array}    users       – array of user objects
 * @param {boolean}  loading     – show skeleton state
 * @param {Function} onSearch    – callback(searchTerm)
 * @param {object}   pagination  – { page, totalPages, onPageChange }
 */

// Role badge styling
function RoleBadge({ role }) {
  const isAdmin = role === 'admin';
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        isAdmin
          ? 'bg-violet-500/15 text-violet-300 border-violet-500/30'
          : 'bg-white/10 text-gray-400 border-white/10'
      }`}
    >
      {isAdmin ? '👑 Admin' : 'User'}
    </span>
  );
}

// Skeleton row for loading state
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-16 rounded bg-white/10" />
        </td>
      ))}
    </tr>
  );
}

// Skeleton card for mobile loading
function SkeletonCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/10" />
        <div className="space-y-1.5">
          <div className="h-4 w-24 rounded bg-white/10" />
          <div className="h-3 w-32 rounded bg-white/10" />
        </div>
      </div>
      <div className="h-3 w-20 rounded bg-white/10" />
    </div>
  );
}

export default function UsersTable({
  users = [],
  loading = false,
  onSearch,
  pagination = {},
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  // Handle search input
  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  // Toggle column sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // Sort indicator
  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1 text-violet-400">
        {sortDir === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  // Sortable header button
  const SortableHeader = ({ field, children, className = '' }) => (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      {children}
      <SortIcon field={field} />
    </th>
  );

  // Client-side sort (works in tandem with server sort if needed)
  const sortedUsers = [...users].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-4">
      {/* ── Search bar ── */}
      <div className="relative max-w-md">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search users by name or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
        />
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <SortableHeader field="name">Name</SortableHeader>
              <SortableHeader field="email">Email</SortableHeader>
              <SortableHeader field="role">Role</SortableHeader>
              <SortableHeader field="resumeCount">Resumes</SortableHeader>
              <SortableHeader field="interviewCount">Interviews</SortableHeader>
              <SortableHeader field="totalScore">Avg Score</SortableHeader>
              <SortableHeader field="createdAt">Joined</SortableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : sortedUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              sortedUsers.map((user) => (
                <motion.tr
                  key={user._id || user.email}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-white/[0.03] transition-colors"
                >
                  {/* Avatar + Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <span className="text-sm font-medium text-white truncate max-w-[160px]">
                        {user.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-400 truncate max-w-[200px]">
                    {user.email}
                  </td>

                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-300 text-center">
                    {user.resumeCount ?? 0}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-300 text-center">
                    {user.interviewCount ?? 0}
                  </td>

                  <td className="px-4 py-3 text-sm text-center">
                    <span className={`font-semibold ${
                      (user.interviewCount > 0 && user.totalScore / user.interviewCount >= 70)
                        ? 'text-emerald-400'
                        : 'text-gray-300'
                    }`}>
                      {user.interviewCount > 0
                        ? `${Math.round(user.totalScore / user.interviewCount)}%`
                        : '—'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-500">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ── */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : sortedUsers.length === 0 ? (
          <p className="text-center py-8 text-gray-500 text-sm">No users found.</p>
        ) : (
          sortedUsers.map((user) => (
            <motion.div
              key={user._id || user.email}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <RoleBadge role={user.role} />
              </div>

              <div className="flex gap-4 text-xs text-gray-400">
                <span>📄 {user.resumeCount ?? 0} resumes</span>
                <span>🎯 {user.interviewCount ?? 0} interviews</span>
                <span>
                  📊{' '}
                  {user.interviewCount > 0
                    ? `${Math.round(user.totalScore / user.interviewCount)}%`
                    : '—'}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => pagination.onPageChange?.(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-3 py-1.5 rounded-lg text-sm bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-400 px-3">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => pagination.onPageChange?.(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-3 py-1.5 rounded-lg text-sm bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
