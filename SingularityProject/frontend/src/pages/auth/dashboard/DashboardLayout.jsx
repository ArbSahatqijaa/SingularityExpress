import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar or Topbar can go here if needed */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Admin Dashboard</h1>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-blue-500 hover:underline"
        >
          Return to Homepage
        </button>
      </header>

      <nav className="flex flex-wrap gap-2 bg-white px-4 py-2 shadow">
        {[
          { name: 'Users', path: '/dashboard/users' },
          { name: 'Friendships', path: '/dashboard/friendships' },
          { name: 'Projects', path: '/dashboard/projects' },
          { name: 'Papers', path: '/dashboard/papers' },
          { name: 'Tutorials', path: '/dashboard/tutorials' },
          { name: 'Reviews', path: '/dashboard/reviews' },
          { name: 'Invitations', path: '/dashboard/invitations' },
          { name: 'Roles', path: '/dashboard/required_roles' },
        ].map(({ name, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="text-sm px-3 py-1 bg-blue-100 rounded hover:bg-blue-200"
          >
            {name}
          </button>
        ))}
      </nav>

      <main className="p-6">{children}</main>
    </div>
  );
}
