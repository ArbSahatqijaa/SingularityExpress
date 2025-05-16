import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../services/api';
import DashboardLayout from '../DashboardLayout';
import DataTable from '../DashboardTable';  

export default function FriendshipForm() {
  const { friendshipId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    id: null,          // ← hold the Friendship PK
    from_user: '',
    to_user: '',
    status: 'PENDING',
  });

  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1) load current user & all users
  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => {
        setMe(data);
        setForm(f => ({
          ...f,
          from_user: data.user_id,  // your CustomUser PK field
        }));
        return API.get('/users/');
      })
      .then(({ data }) => setUsers(data))
      .catch(() => {
        setMe(null);
        setUsers([]);
      });
  }, []);

  // 2) if editing, load the friendship
  useEffect(() => {
    if (!friendshipId) return;
    setLoading(true);

    API.get(`/friendships/${friendshipId}/`)
      .then(({ data }) => {
        setForm({
          id:         data.id,         // ← pick up the Friendship id
          from_user:  data.from_user,
          to_user:    data.to_user,
          status:     data.status,
        });
      })
      .catch(() => setError('Failed to load friendship'))
      .finally(() => setLoading(false));
  }, [friendshipId]);

  // form inputs
  const handleChange = e => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  // submit new or patched
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // build payload
    const payload = {
      from_user: parseInt(form.from_user, 10),
      to_user:   parseInt(form.to_user,   10),
      status:    form.status,
    };

    try {
      if (form.id) {
        // EDIT existing
        await API.patch(`/friendships/${form.id}/`, payload);
      } else {
        // CREATE new
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
     <div className="py-4" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
  <div className="container">
    <h1 className="mb-4 text-primary">
      {isEditing ? 'Edit Friendship' : 'Send Friend Request'}
    </h1>

    {error && <div className="alert alert-danger">{error}</div>}

    <div className="card shadow-sm border-0">
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <h5 className="text-secondary mb-3">Friendship Details</h5>

          {/* FROM USER */}
          <div className="mb-4">
            <label className="form-label fw-semibold">From User</label>
            <select
              name="from_user"
              className="form-select"
              value={form.from_user}
              onChange={handleChange}
              required
              disabled={isEditing}
            >
              <option value="">Select a user</option>
              {users.map(user => (
                <option key={user.user_id} value={user.user_id}>
                  {user.username}
                </option>
              ))}
            </select>
            {isEditing && (
              <small className="text-muted d-block mt-1">
                From user cannot be changed when editing.
              </small>
            )}
          </div>

          {/* TO USER */}
          <div className="mb-4">
            <label className="form-label fw-semibold">To User</label>
            <select
              name="to_user"
              className="form-select"
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
              <small className="text-muted d-block mt-1">
                To user cannot be changed when editing.
              </small>
            )}
          </div>

          {/* STATUS */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Status</label>
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

          {/* ACTIONS */}
          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {isEditing ? 'Save Changes' : 'Send Friend Request'}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
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

    </DashboardLayout>
  );
}
