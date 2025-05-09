import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../../services/api';

export default function PaperProjectPage() {
  const navigate = useNavigate();
  const [paperProjects, setPaperProjects] = useState([]);
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
    API.get('/paper_projects/')
      .then(({ data }) => setPaperProjects(data))
      .catch(() => setError('Failed to load paper-project links'))
      .finally(() => setLoading(false));
  }, [me]);

  const canManage = pp =>
    me?.is_superuser || me?.is_staff || me.user_id === pp.added_by.user_id;

  const handleEdit = pp => {
    navigate(`/dashboard/paper_projects/edit/${pp.id}`);
  };

  const handleDelete = async pp => {
    if (!canManage(pp)) {
      alert("You don't have permission to delete this link");
      return;
    }
    if (!window.confirm('Remove this paper-project link?')) return;
    await API.delete(`/paper_projects/${pp.id}/`);
    setPaperProjects(cur => cur.filter(x => x.id !== pp.id));
  };

  if (loading) return <div>Loading paper-project links…</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div className="container py-4">
      <h1 className="mb-4 text-primary">Manage Paper-Project Links</h1>

      <button
        className="btn btn-success mb-3"
        onClick={() => navigate('/dashboard/paper_projects/new')}
      >
        Add Link
      </button>

      {paperProjects.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-hover shadow-sm">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Paper</th>
                <th>Project</th>
                <th>Added By</th>
                <th>Added At</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paperProjects.map(pp => (
                <tr key={pp.id}>
                  <td>{pp.id}</td>
                  <td>{pp.paper.title}</td>
                  <td>{pp.project.title}</td>
                  <td>{pp.added_by.username}</td>
                  <td>{new Date(pp.added_at).toLocaleString()}</td>
                  <td>{pp.notes || '—'}</td>
                  <td>
                    {canManage(pp) ? (
                      <>
                        <button
                          className="btn btn-sm btn-outline-warning me-1"
                          onClick={() => handleEdit(pp)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(pp)}
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
        <p className="text-muted">No paper-project links found</p>
      )}
    </div>
  );
}
