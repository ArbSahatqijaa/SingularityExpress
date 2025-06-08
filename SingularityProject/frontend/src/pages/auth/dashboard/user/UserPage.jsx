import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../services/api';
import DashboardLayout from '../DashboardLayout';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await API.get('/users/');
        setUsers(data);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const canManage = (target) =>
    me?.is_superuser || (!target.is_staff && !target.is_superuser);

  const handleDelete = async (userId) => {
    if (!canManage(users.find((u) => u.user_id === userId))) {
      return alert("You don't have permission to delete this account");
    }
    if (!window.confirm('Delete this user?')) return;
    await API.delete(`/users/${userId}/`);
    setUsers(users.filter((u) => u.user_id !== userId));
  };

  const handleEdit = (userId) => {
    if (!canManage(users.find((u) => u.user_id === userId))) {
      return alert("You don't have permission to edit this account");
    }
    navigate(`/dashboard/users/edit/${userId}`);
  };

  if (loading)
    return <div className="text-center py-10 text-gray-500">Loading users...</div>;
  if (error)
    return <div className="text-center py-10 text-red-600">{error}</div>;

  return (
    <DashboardLayout>
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-500 mt-1">View and control platform user access</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/users/new')}
              className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-md"
            >
              + New User
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">ID</th>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">Username</th>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">Email</th>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">First Name</th>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">Last Name</th>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">Staff</th>
                    <th className="px-6 py-4 text-center font-medium tracking-wide text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.user_id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-900">{u.user_id}</td>
                      <td className="px-6 py-4">{u.username}</td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">{u.first_name}</td>
                      <td className="px-6 py-4">{u.last_name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${u.is_staff ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{u.is_staff ? 'Yes' : 'No'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {canManage(u) ? (
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleEdit(u.user_id)}
                              className="px-3 py-1.5 text-xs bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-md shadow-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(u.user_id)}
                              className="px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md shadow-sm"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">–</span>
                        )}
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
