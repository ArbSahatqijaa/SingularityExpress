import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../services/api';

export default function RequiredrolesPage() {
  const [Requiredroles, setRequiredroles]     = useState([]);
  const [me, setMe]           = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const navigate              = useNavigate();


  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  // fetch all Requiredroles
  useEffect(() => {
    const fetchRequiredroles = async () => {
      try {
        const { data } = await API.get('/required_roles/');
        setRequiredroles(data);
        console.log(data);
      } catch (err) {
        setError('Failed to load Requiredroles');
      } finally {
        setLoading(false);
      }
    };
    fetchRequiredroles();
  }, []);


  const canManage = target =>
    me?.is_superuser || (!target.is_staff && !target.is_superuser);

  const handleDelete = async RequiredrolesID => {
    if (!canManage(Requiredroles.find(u => u.required_roles_id === RequiredrolesID))) {
      return alert("You don't have permission to delete this Requiredroles");
    }
    if (!window.confirm('Delete this Requiredroles?')) return;
    await API.delete(`/required_roles/${RequiredrolesID}/`);
    setRequiredroles(Requiredroles.filter(u => u.required_roles_id !== RequiredrolesID));
  };

  const handleEdit = RequiredrolesID => {
    if (!canManage(Requiredroles.find(u => u.required_roles_id === RequiredrolesID))) {
      return alert("You don't have permission to edit this Requiredroles");
    }
    navigate(`/dashboard/required_roles/edit/${RequiredrolesID}`);
  };

  if (loading) return <div>Loading Requiredroles...</div>;
  if (error)   return <div className="text-danger">{error}</div>;

  return (
    <div className="container py-4">
  <h1 className="mb-4 text-primary">Manage Requiredroles</h1>

  <div className="d-flex justify-content-between align-items-center mb-3">
    <button
      className="btn btn-success"
      onClick={() => navigate('/dashboard/required_roles/new')}
    >
     Create New Requiredroles
    </button>
  </div>

  {Requiredroles.length > 0 ? (
    <div className="table-responsive">
      <table className="table table-hover table-bordered align-middle shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>content_type</th>
            <th>object_id</th>
            <th>role</th>
            <th>quantity</th>
            <th>required_profession</th>
            <th>active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Requiredroles.map(u => (
            <tr key={u.required_roles_id}>
              <td>{u.required_roles_id}</td>
              <td>{u.content_type}</td>
              <td>{u.object_id}</td>
              <td>{u.role}</td>
              <td>{u.quantity}</td>
              <td>{u.required_profession}</td>
              <td>{u.active ? 'Active' : 'Inactive'}</td>
              <td>
                  <>
                    <button
                      className="btn btn-sm btn-outline-warning me-1"
                      onClick={() => handleEdit(u.required_roles_id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(u.required_roles_id)}
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
    <p className="text-muted">No Requiredroles available</p>
  )}
</div>
  );
}