import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../services/api';

export default function FriendshipPage() {
  const [friendships, setFriendships] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // load current user
  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  // fetch all friendships
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

  // allow superuser, staff, or participants to manage
  const canManage = f =>
    me?.is_superuser ||
    me?.is_staff ||
    me?.user_id === f.from_user ||
    me?.user_id === f.to_user;

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

  if (loading) return <div>Loading friendships...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div className="container py-4">
      <h1 className="mb-4 text-primary">Manage Friendships</h1>

      <div className="mb-3">
        <button
          className="btn btn-success"
          onClick={() => navigate('/dashboard/friendships/new')}
        >
          Send Friend Request
        </button>
      </div>

      {friendships.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-hover table-bordered align-middle shadow-sm">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>From User</th>
                <th>To User</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Responded At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {friendships.map(f => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{f.from_user}</td>
                  <td>{f.to_user}</td>
                  <td>
                    <span
                      className={`badge ${
                        f.status === 'ACCEPTED' ? 'bg-success' :
                        f.status === 'PENDING'  ? 'bg-warning' :
                        f.status === 'REJECTED' ? 'bg-danger'  :
                                                   'bg-secondary'
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td>{new Date(f.created_at).toLocaleString()}</td>
                  <td>{new Date(f.updated_at).toLocaleString()}</td>
                  <td>
                    {f.responded_at
                      ? new Date(f.responded_at).toLocaleString()
                      : '-'}
                  </td>
                  <td>
                    {canManage(f) ? (
                      <>
                        <button
                          className="btn btn-sm btn-outline-warning me-1"
                          onClick={() => handleEdit(f.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(f.id)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className="text-muted">–</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted">No friendships available</p>
      )}
    </div>
  );
}
