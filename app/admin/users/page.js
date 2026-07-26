'use client';

import { useState, useEffect } from 'react';
import UsersTable from '@/components/admin/UsersTable';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // We'd typically pass page, limit, and search query params here
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        if (data.users) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    // In a real app, this would trigger a debounced API call
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">View and manage platform users.</p>
        </div>
        
        <div className="w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search}
            onChange={handleSearch}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <LoadingSpinner color="violet" />
          </div>
        ) : (
          <UsersTable users={filteredUsers} />
        )}
      </div>
    </div>
  );
}
