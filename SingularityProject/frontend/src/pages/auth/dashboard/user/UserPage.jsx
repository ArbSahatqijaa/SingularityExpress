import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../services/api';
import DashboardLayout from '../DashboardLayout';

export default function UsersPage() {
  const [users, setUsers]     = useState([]);
  const [me, setMe]           = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const navigate              = useNavigate();

  // fetch current user
  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  // fetch all users
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

  // only allow edits/deletes if:
  //  • I'm superuser → I can manage anyone
  //  • OR target is neither staff nor superuser
  const canManage = target =>
    me?.is_superuser || (!target.is_staff && !target.is_superuser);

  const handleDelete = async userId => {
    if (!canManage(users.find(u => u.user_id === userId))) {
      return alert("You don't have permission to delete this account");
    }
    if (!window.confirm('Delete this user?')) return;
    await API.delete(`/users/${userId}/`);
    setUsers(users.filter(u => u.user_id !== userId));
  };

  const handleEdit = userId => {
    if (!canManage(users.find(u => u.user_id === userId))) {
      return alert("You don't have permission to edit this account");
    }
    navigate(`/dashboard/users/edit/${userId}`);
  };

  if (loading) return <div>Loading users...</div>;
  if (error)   return <div className="text-danger">{error}</div>;

  return (
    <DashboardLayout>
  <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
    <button
      onClick={() => navigate('/dashboard/users/new')}
      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all duration-150 shadow-sm"
    >
      + Create New User
    </button>
  </div>

  {users.length > 0 ? (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <tr>
            <th className="px-6 py-4">ID</th>
            <th className="px-6 py-4">Username</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">First Name</th>
            <th className="px-6 py-4">Last Name</th>
            <th className="px-6 py-4">Staff</th>
            <th className="px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((u) => (
            <tr
              key={u.user_id}
              className="hover:bg-gray-50 transition-colors duration-100"
            >
              <td className="px-6 py-4 font-medium">{u.user_id}</td>
              <td className="px-6 py-4">{u.username}</td>
              <td className="px-6 py-4">{u.email}</td>
              <td className="px-6 py-4">{u.first_name}</td>
              <td className="px-6 py-4">{u.last_name}</td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.is_staff
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {u.is_staff ? 'Yes' : 'No'}
                </span>
              </td>
              <td className="px-6 py-4 text-center space-x-2">
                {canManage(u) ? (
                  <>
                    <button
                      onClick={() => handleEdit(u.user_id)}
                      className="inline-flex items-center px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded-md text-xs font-medium shadow-sm transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(u.user_id)}
                      className="inline-flex items-center px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs font-medium shadow-sm transition"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <span className="text-gray-400 text-sm">–</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="text-gray-500">No users available</p>
  )}
</div>
  
</DashboardLayout>

  );
}
