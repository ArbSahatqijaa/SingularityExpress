import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../services/api';

export default function ProjectsPage() {
  const [projects, setProjects]     = useState([]);
  const [me, setMe]           = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const navigate              = useNavigate();


  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  // fetch all projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await API.get('/projects/');
        setProjects(data);
      } catch (err) {
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);


  const canManage = target =>
    me?.is_superuser || (!target.is_staff && !target.is_superuser);

  const handleDelete = async projectID => {
    if (!canManage(projects.find(u => u.project_id === projectID))) {
      return alert("You don't have permission to delete this project");
    }
    if (!window.confirm('Delete this project?')) return;
    await API.delete(`/projects/${projectID}/`);
    setProjects(projects.filter(u => u.project_id !== projectID));
  };

  const handleEdit = projectID => {
    if (!canManage(projects.find(u => u.project_id === projectID))) {
      return alert("You don't have permission to edit this project");
    }
    navigate(`/dashboard/projects/edit/${projectID}`);
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
            <th>Description</th>
            <th>Visibility</th>
            <th>Status</th>
            <th>File Path</th>
            <th>Leader</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(u => (
            <tr key={u.project_id}>
              <td>{u.project_id}</td>
              <td>{u.description}</td>
              <td>{u.visibility}</td>
              <td>
                <span
                  className={`badge ${
                    u.status === 'active' ? 'bg-success' : 'bg-secondary'
                  }`}
                >
                  {u.status}
                </span>
              </td>
              <td>{u.file_path}</td>
              <td>{u.leader}</td>
              <td>
                {canManage(u) ? (
                  <>
                    <button
                      className="btn btn-sm btn-outline-warning me-1"
                      onClick={() => handleEdit(u.project_id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(u.project_id)}
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
    <p className="text-muted">No projects available</p>
  )}
</div>
  );
}