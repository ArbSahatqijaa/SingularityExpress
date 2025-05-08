import React, { useEffect, useState } from 'react';
import { useNavigate }                from 'react-router-dom';
import API                            from '../../../../services/api';

export default function UserPaperPage() {
  const navigate      = useNavigate();
  const [userPapers, setUserPapers] = useState([]);
  const [me,         setMe]         = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

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

  if (loading) return <div>Loading assignments…</div>;
  if (error)   return <div className="text-danger">{error}</div>;

  return (
    <div className="container py-4">
      <h1 className="mb-4 text-primary">Manage Paper Assignments</h1>

      <button
        className="btn btn-success mb-3"
        onClick={() => navigate('/dashboard/user_papers/new')}
      >
        Add Assignment
      </button>

      {userPapers.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-hover shadow-sm">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Paper</th>
                <th>Role</th>
                <th>Joined At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userPapers.map(up => (
                <tr key={up.id}>
                  <td>{up.id}</td>
                  <td>{up.user.username}</td>
                  <td>{up.paper.title}</td>
                  <td>{up.role}</td>
                  <td>{new Date(up.joined_at).toLocaleString()}</td>
                  <td>
                    {canManage(up) ? (
                      <>
                        <button
                          className="btn btn-sm btn-outline-warning me-1"
                          onClick={() => handleEdit(up)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(up)}
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
        <p className="text-muted">No assignments found</p>
      )}
    </div>
  );
}
