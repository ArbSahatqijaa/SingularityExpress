import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../services/api';
import DashboardLayout from '../DashboardLayout';

export default function FriendshipForm() {
  const { friendshipId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    id: null,
    from_user: '',
    to_user: '',
    status: 'PENDING',
  });

  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => {
        setMe(data);
        setForm(f => ({
          ...f,
          from_user: data.user_id,
        }));
        return API.get('/users/');
      })
      .then(({ data }) => setUsers(data))
      .catch(() => {
        setMe(null);
        setUsers([]);
      });
  }, []);

  useEffect(() => {
    if (!friendshipId) return;
    setLoading(true);

    API.get(`/friendships/${friendshipId}/`)
      .then(({ data }) => {
        setForm(f => ({
          ...f,
          id: data.id,
          to_user: data.to_user_details.user_id,
          status: data.status,
        }));
      })
      .catch(() => setError('Failed to load friendship'))
      .finally(() => setLoading(false));
  }, [friendshipId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      to_user: parseInt(form.to_user, 10),
      status: form.status,
    };

    try {
      if (form.id) {
        await API.patch(`/friendships/${form.id}/`, payload);
      } else {
        await API.post('/friendships/', payload);
      }
      navigate('/dashboard/friendships');
    } catch (err) {
      console.error('Submit error:', err.response?.data);
      setError('Save failed: ' + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  const isEditing = Boolean(form.id);

  return (
    <DashboardLayout>
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-2xl mx-auto bg-white shadow rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Edit Friendship' : 'Send Friend Request'}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {isEditing ? 'Update friendship status.' : 'Initiate a new friend request.'}
          </p>

          {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From User</label>
              <input
                type="text"
                className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                value={me?.username || ''}
                disabled
              />
              <p className="text-xs text-gray-400 mt-1">You (always the requester)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To User</label>
              <select
                name="to_user"
                className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                value={form.to_user}
                onChange={handleChange}
                required
                disabled={isEditing}
              >
                <option value="">Select a user</option>
                {users
                  .filter(u => u.user_id !== parseInt(form.from_user, 10))
                  .map(user => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.username}
                    </option>
                  ))}
              </select>
              {isEditing && (
                <p className="text-xs text-gray-400 mt-1">
                  To user cannot be changed when editing.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                value={form.status}
                onChange={handleChange}
                required
              >
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm"
                disabled={loading}
              >
                {isEditing ? 'Save Changes' : 'Send Friend Request'}
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-sm font-semibold rounded-lg shadow-sm"
                onClick={() => navigate('/dashboard/friendships')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
