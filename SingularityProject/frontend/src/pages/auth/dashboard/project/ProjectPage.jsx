// src/pages/auth/dashboard/project/ProjectsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate }            from 'react-router-dom';
import API                        from '../../../../services/api';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [me,       setMe]       = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const navigate               = useNavigate();

  // 1️⃣ Load current user
  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  // 2️⃣ Load all projects
  useEffect(() => {
    API.get('/projects/')
      .then(({ data }) => setProjects(data))
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  // 3️⃣ Permission check: leader | staff | superuser
  const canManage = project =>
    me &&
    (me.is_superuser ||
     me.is_staff ||
     me.user_id === project.leader);

  const handleDelete = async projectId => {
    const project = projects.find(p => p.project_id === projectId);
    if (!canManage(project)) {
      return alert("You don't have permission to delete this project");
    }
    if (!window.confirm('Delete this project?')) return;
    await API.delete(`/projects/${projectId}/`);
    setProjects(projects.filter(p => p.project_id !== projectId));
  };

  const handleEdit = projectId => {
    const project = projects.find(p => p.project_id === projectId);
    if (!canManage(project)) {
      return alert("You don't have permission to edit this project");
    }
    navigate(`/dashboard/projects/edit/${projectId}`);
  };

  if (loading) return <div>Loading projects...</div>;
  if (error)   return <div className="text-danger">{error}</div>;

  return (
    <div className="container py-4">
      <h1 className="mb-4 text-primary">Manage Projects</h1>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          className="btn btn-success"
          onClick={() => navigate('/dashboard/projects/new')}
        >
          Create New Project
        </button>
      </div>

      {projects.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-hover table-bordered align-middle shadow-sm">
            <thead className="table-dark">
  <tr>
    <th>ID</th>
    <th>Title</th>
    <th>Description</th>
    <th>Visibility</th>
    <th>Status</th>
    <th>Accepting Applications</th> {/* ✅ NEW */}
    <th>Role Details</th>            {/* ✅ NEW */}
    <th>File</th>
    <th>Image</th>
    <th>Leader</th>
    <th>Created By</th>
    <th>Actions</th>
  </tr>
</thead>
            <tbody>
              {projects.map(p => {
                // build URLs if needed
                const fileUrl = p.file_path
                ? (p.file_path.startsWith('http')
                ? p.file_path
                : API.defaults.baseURL + p.file_path)
                : null;

                const imgUrl   = p.image
                  ? (p.image.startsWith('http')
                      ? p.image
                      : API.defaults.baseURL + p.image)
                  : null;

                return (
                  <tr key={p.project_id}>
  <td>{p.project_id}</td>
  <td>{p.title}</td>
  <td>{p.description}</td>
  <td>{p.visibility}</td>
  <td>
    <span
      className={`badge ${p.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}
    >
      {p.status}
    </span>
  </td>
  <td>
    {p.accepting_applications ? (
      <span className="badge bg-success">Yes</span>
    ) : (
      <span className="badge bg-danger">No</span>
    )}
  </td>
  <td style={{ whiteSpace: 'pre-wrap' }}>
    {p.role_details || <span className="text-muted">–</span>}
  </td>
  <td>
    {fileUrl ? (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer">
        Download
      </a>
    ) : (
      <span className="text-muted">–</span>
    )}
  </td>
  <td>
    {imgUrl ? (
      <img
        src={imgUrl}
        alt={p.title}
        className="rounded"
        style={{ width: 60, height: 60, objectFit: 'cover' }}
      />
    ) : (
      <span className="text-muted">–</span>
    )}
  </td>
  <td>{p.leader}</td>
  <td>{p.created_by_info.username}</td>
  <td>
    {canManage(p) ? (
      <>
        <button
          className="btn btn-sm btn-outline-warning me-1"
          onClick={() => handleEdit(p.project_id)}
        >
          Edit
        </button>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => handleDelete(p.project_id)}
        >
          Delete
        </button>
      </>
    ) : (
      <span className="text-muted">–</span>
    )}
  </td>
</tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted">No projects available</p>
      )}
    </div>
  );
}
