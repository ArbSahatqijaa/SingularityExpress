import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../services/api';

export default function TutorialPage() {
  const [Tutorial, setTutorial]     = useState([]);
  const [me, setMe]           = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const navigate              = useNavigate();


  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  // fetch all Tutorial
  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        const { data } = await API.get('/tutorials/');
        setTutorial(data);
        console.log(data);
      } catch (err) {
        setError('Failed to load Tutorial');
      } finally {
        setLoading(false);
      }
    };
    fetchTutorial();
  }, []);


  const canManage = target =>
    me?.is_superuser || (!target.is_staff && !target.is_superuser);

  const handleDelete = async TutorialID => {
    if (!canManage(Tutorial.find(u => u.tutorial_id === TutorialID))) {
      return alert("You don't have permission to delete this Tutorial");
    }
    if (!window.confirm('Delete this Tutorial?')) return;
    await API.delete(`/tutorials/${TutorialID}/`);
    setTutorial(Tutorial.filter(u => u.tutorial_id !== TutorialID));
  };

  const handleEdit = tutorialID => {
    if (!canManage(Tutorial.find(u => u.tutorial_id === tutorialID))) {
      return alert("You don't have permission to edit this tutorial");
    }
    navigate(`/dashboard/tutorials/edit/${tutorialID}`);
  };

  if (loading) return <div>Loading Tutorial...</div>;
  if (error)   return <div className="text-danger">{error}</div>;

  return (
    <div className="container py-4">
  <h1 className="mb-4 text-primary">Manage Tutorial</h1>

  <div className="d-flex justify-content-between align-items-center mb-3">
    <button
      className="btn btn-success"
      onClick={() => navigate('/dashboard/tutorials/new')}
    >
     Create New tutorial
    </button>
  </div>

  {Tutorial.length > 0 ? (
    <div className="table-responsive">
      <table className="table table-hover table-bordered align-middle shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>File Path</th>
            <th>Created_by</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Tutorial.map(u => (
            <tr key={u.tutorial_id}>
              <td>{u.tutorial_id}</td>
              <td>{u.title}</td>
              <td>{u.filePath}</td>
              <td>{u.created_by}</td>
              <td>
                  <>
                    <button
                      className="btn btn-sm btn-outline-warning me-1"
                      onClick={() => handleEdit(u.tutorial_id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(u.tutorial_id)}
                    >
                      Delete
                    </button>
                  </>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="text-muted">No Tutorial available</p>
  )}
</div>
  );
}