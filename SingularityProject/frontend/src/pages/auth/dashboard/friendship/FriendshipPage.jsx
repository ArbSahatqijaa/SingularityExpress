import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../services/api';
import DashboardLayout from '../DashboardLayout';

export default function FriendshipPage() {
  const [friendships, setFriendships] = useState([]);
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
    const fetchFriendships = async () => {
      try {
        const { data } = await API.get('/friendships/');
        setFriendships(data);
      } catch {
        setError('Failed to load friendships');
      } finally {
        setLoading(false);
      }
    };
    fetchFriendships();
  }, []);

  const canManage = f =>
    me?.is_superuser ||
    me?.is_staff ||
    me?.user_id === f.from_user.user_id ||
    me?.user_id === f.to_user_details.user_id;

  const handleDelete = async id => {
    const friendship = friendships.find(f => f.id === id);
    if (!canManage(friendship)) {
      return alert("You don't have permission to delete this friendship");
    }
    if (!window.confirm('Delete this friendship?')) return;
    await API.delete(`/friendships/${id}/`);
    setFriendships(friendships.filter(f => f.id !== id));
  };

  const handleEdit = id => {
    const friendship = friendships.find(f => f.id === id);
    if (!canManage(friendship)) {
      return alert("You don't have permission to edit this friendship");
    }
    navigate(`/dashboard/friendships/edit/${id}`);
  };

  if (loading)
    return <div className="text-center py-10 text-gray-500">Loading friendships…</div>;
  if (error)
    return <div className="text-center py-10 text-red-600">{error}</div>;

  return (
    <DashboardLayout>
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Friendships Overview</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and review user relationships in the system</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/friendships/new')}
              className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-md"
            >
              + Add Friendship
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-medium text-gray-600">ID</th>
                    <th className="px-6 py-4 font-medium text-gray-600">From User</th>
                    <th className="px-6 py-4 font-medium text-gray-600">To User</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Status</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Created At</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Updated At</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Responded At</th>
                    <th className="px-6 py-4 text-center font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {friendships.map(f => (
                    <tr key={f.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-900">{f.id}</td>
                      <td className="px-6 py-4">{f.from_user.username}</td>
                      <td className="px-6 py-4">{f.to_user_details.username}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${
                            f.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                            f.status === 'PENDING'  ? 'bg-yellow-100 text-yellow-800' :
                            f.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                       'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {f.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{new Date(f.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4">{new Date(f.updated_at).toLocaleString()}</td>
                      <td className="px-6 py-4">{f.responded_at ? new Date(f.responded_at).toLocaleString() : <span className="text-gray-400">–</span>}</td>
                      <td className="px-6 py-4 text-center">
                        {canManage(f) ? (
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleEdit(f.id)}
                              className="px-3 py-1.5 text-xs bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-md shadow-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(f.id)}
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