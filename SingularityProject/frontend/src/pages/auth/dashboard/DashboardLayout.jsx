import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Users', path: '/dashboard/users' },
    { name: 'Friendships', path: '/dashboard/friendships' },
    { name: 'Projects', path: '/dashboard/projects' },
    { name: 'Papers', path: '/dashboard/papers' },
    { name: 'Tutorials', path: '/dashboard/tutorials' },
    { name: 'Reviews', path: '/dashboard/reviews' },
    { name: 'Invitations', path: '/dashboard/invitations' },
    { name: 'Roles', path: '/dashboard/required_roles' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-indigo-700 tracking-tight">Admin Panel</span>
            <span className="text-sm text-gray-500 hidden sm:inline">Singularity Express</span>
          </div>
          <button
            onClick={() => navigate('/Dashboard')}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
          >
            ← Return to Dashboard
          </button>
        </div>

        <nav className="border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-2 overflow-x-auto no-scrollbar">
            <div className="flex gap-3 sm:gap-4">
              {navItems.map(({ name, path }) => {
                const isActive = location.pathname === path;
                return (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className={`whitespace-nowrap px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
