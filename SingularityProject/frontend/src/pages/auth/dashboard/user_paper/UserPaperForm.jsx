import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../services/api';
import DashboardLayout from '../DashboardLayout';

export default function UserPaperForm() {
  const { userPaperId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    id: null,
    user_id: '',
    paper_id: '',
    role: 'VIEWER'
  });
  const [users, setUsers] = useState([]);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => {
        setForm(f => ({ ...f, user_id: data.user_id }));
        return Promise.all([API.get('/users/'), API.get('/papers/')]);
      })
      .then(([uRes, pRes]) => {
        setUsers(uRes.data);
        setPapers(pRes.data);
      })
      .catch(() => setError('Failed to load users or papers'));
  }, []);

  useEffect(() => {
    if (!userPaperId) return;
    setLoading(true);
    API.get(`/user_papers/${userPaperId}/`)
      .then(({ data }) => {
        setForm({
          id: data.id,
          user_id: data.user.user_id,
          paper_id: data.paper.paper_id,
          role: data.role
        });
      })
      .catch(() => setError('Failed to load assignment'))
      .finally(() => setLoading(false));
  }, [userPaperId]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = userPaperId
      ? { role: form.role }
      : {
          user_id: parseInt(form.user_id, 10),
          paper_id: parseInt(form.paper_id, 10),
          role: form.role
        };

    try {
      if (userPaperId) {
        await API.patch(`/user_papers/${form.id}/`, payload);
      } else {
        await API.post('/user_papers/', payload);
      }
      navigate('/dashboard/user_papers');
    } catch (err) {
      setError('Save failed: ' + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  if (loading && userPaperId) return <div className="text-center py-10 text-gray-500">Loading…</div>;

  return (
    <DashboardLayout>
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-2xl mx-auto bg-white shadow rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {userPaperId ? 'Edit Paper Assignment' : 'New Paper Assignment'}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {userPaperId ? 'Update paper assignment role.' : 'Assign a user to a paper with a specific role.'}
          </p>

          {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {form.id != null && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignment ID</label>
                <input className="w-full rounded-lg border-gray-300 shadow-sm text-sm" value={form.id} readOnly />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
              <select
                name="user_id"
                className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                value={form.user_id}
                onChange={handleChange}
                required
                disabled={Boolean(userPaperId)}
              >
                <option value="">Select User</option>
                {users.map(u => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.username}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paper</label>
              <select
                name="paper_id"
                className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                value={form.paper_id}
                onChange={handleChange}
                required
                disabled={Boolean(userPaperId)}
              >
                <option value="">Select Paper</option>
                {papers.map(p => (
                  <option key={p.paper_id} value={p.paper_id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <textarea
                name="role"
                rows="3"
                required
                className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                value={form.role}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm"
                disabled={loading}
              >
                {userPaperId ? 'Save Changes' : 'Create Assignment'}
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-sm font-semibold rounded-lg shadow-sm"
                onClick={() => navigate('/dashboard/user_papers')}
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
