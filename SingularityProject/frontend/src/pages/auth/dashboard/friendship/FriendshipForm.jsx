import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../services/api';

export default function FriendshipForm() {
  const { friendshipId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    from_user: '',
    to_user: '',
    status: 'PENDING',
  });

  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch user info and all users for selection
    API.get('/whoami/')
      .then(({ data }) => {
        setMe(data);
        setForm(f => ({
          ...f,
          from_user: data.id, // Set from_user to current user by default
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
        setForm({
          ...data,
        });
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

    try {
      // Make sure from_user and to_user are integers
      const updatedForm = {
        ...form,
        from_user: parseInt(form.from_user),
        to_user: parseInt(form.to_user),
      };

      if (friendshipId) {
        await API.patch(`/friendships/${friendshipId}/`, updatedForm);
      } else {
        await API.post('/friendships/', updatedForm);
      }

      navigate('/dashboard/friendships');
    } catch (err) {
      console.error('Submit error:', err.response?.data);
      setError('Save failed: ' + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <div className="container">
        <h1 className="mb-4">{friendshipId ? 'Edit Friendship' : 'Send Friend Request'}</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <h5 className="text-secondary mb-3">Friendship Details</h5>

              <div className="mb-4">
                <label className="form-label">From User</label>
                <select
                  name="from_user"
                  className="form-select"
                  value={form.from_user}
                  onChange={handleChange}
                  required
                  disabled={friendshipId !== undefined}
                >
                  <option value="">Select a user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>
                {friendshipId && <p className="text-muted small mt-1">From user cannot be changed for existing friendships</p>}
              </div>

              <div className="mb-4">
                <label className="form-label">To User</label>
                <select
                  name="to_user"
                  className="form-select"
                  value={form.to_user}
                  onChange={handleChange}
                  required
                  disabled={friendshipId !== undefined}
                >
                  <option value="">Select a user</option>
                  {users.filter(user => user.id !== parseInt(form.from_user)).map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>
                {friendshipId && <p className="text-muted small mt-1">To user cannot be changed for existing friendships</p>}
              </div>

              <div className="mb-4">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-select"
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

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {friendshipId ? 'Save Changes' : 'Send Friend Request'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/dashboard/friendships')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 