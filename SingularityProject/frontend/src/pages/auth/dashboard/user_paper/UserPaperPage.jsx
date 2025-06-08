import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../services/api';
import DashboardLayout from '../DashboardLayout';

export default function UserPaperPage() {
  const navigate = useNavigate();
  const [userPapers, setUserPapers] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    if (!me) return;
    API.get('/user_papers/')
      .then(({ data }) => setUserPapers(data))
      .catch(() => setError('Failed to load assignments'))
      .finally(() => setLoading(false));
  }, [me]);

  const canManage = up =>
    me?.is_superuser ||
    me?.is_staff ||
    me.user_id === up.user.user_id;

  const handleEdit = up => {
    navigate(`/dashboard/user_papers/edit/${up.id}`);
  };

  const handleDelete = async up => {
    if (!canManage(up)) {
      alert("You don't have permission to delete this assignment");
      return;
    }
    if (!window.confirm('Remove this assignment?')) return;
    await API.delete(`/user_papers/${up.id}/`);
    setUserPapers(cur => cur.filter(x => x.id !== up.id));
  };

  if (loading)
    return <div className="text-center py-10 text-gray-500">Loading assignments…</div>;
  if (error)
    return <div className="text-center py-10 text-red-600">{error}</div>;

  return (
    <DashboardLayout>
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Manage Paper Assignments</h1>
              <p className="text-sm text-gray-500 mt-1">Assign users to papers and manage their roles</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/user_papers/new')}
              className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-md"
            >
              + Add Assignment
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">ID</th>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">User</th>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">Paper</th>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">Role</th>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">Joined At</th>
                    <th className="px-6 py-4 text-center font-medium tracking-wide text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {userPapers.map(up => (
                    <tr key={up.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-900">{up.id}</td>
                      <td className="px-6 py-4">{up.user.username}</td>
                      <td className="px-6 py-4">{up.paper.title}</td>
                      <td className="px-6 py-4">{up.role}</td>
                      <td className="px-6 py-4">{new Date(up.joined_at).toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleEdit(up)}
                            className="px-3 py-1.5 text-xs bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-md shadow-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(up)}
                            className="px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md shadow-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}