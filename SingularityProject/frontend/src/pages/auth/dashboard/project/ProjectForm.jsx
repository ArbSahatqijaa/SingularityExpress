import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../services/api';

export default function ProjectForm() {
  const { projectID } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    visibility: 'PUBLIC',
    status: 'ACTIVE',
    file_path: null,
    leader: '',
    created_by: '',
    supervisor: '',
    start_date: '',
    end_date: '',
  });

  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch user info and all users for leader selection
    API.get('/whoami/')
      .then(({ data }) => {
        setMe(data);
        setForm(f => ({
          ...f,
          leader: data.id, // Set leader to current user by default
          created_by: data.id, // Set created_by to current user
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
    if (!projectID) return;
    setLoading(true);
    API.get(`/projects/${projectID}/`)
      .then(({ data }) => {
        setForm({
          ...data,
          file_path: null, // Keep this empty so the file does not get replaced unintentionally
        });
      })
      .catch(() => setError('Failed to load project'))
      .finally(() => setLoading(false));
  }, [projectID]);

  const handleChange = e => {
    const { name, value, type, checked, files } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    try {
      // Sigurohuni që lideri dhe created_by janë integer para se t'i dërgoni
      const updatedForm = {
        ...form,
        leader: parseInt(form.leader), 
        created_by: me?.user_id, 
      };
  
      const isFileUpload = form.file_path !== null;
  
      if (isFileUpload) {
        const fd = new FormData();
  
        Object.entries(updatedForm).forEach(([key, value]) => {
          if (value !== null && value !== '') {
            fd.append(key, value);
          }
        });
  
        if (projectID) {
          await API.patch(`/projects/${projectID}/`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          await API.post('/projects/', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      } else {
       
        if (projectID) {
          await API.patch(`/projects/${projectID}/`, updatedForm);
        } else {
          await API.post('/projects/', updatedForm);
        }
      }
  
      navigate('/dashboard/projects');
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
        <h1 className="mb-4">{projectID ? 'Edit Project' : 'New Project'}</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <h5 className="text-secondary mb-3">Project Details</h5>

              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Project Name</label>
                  <input
                    name="title"
                    type="text"
                    required
                    className="form-control"
                    value={form.title}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Supervisor</label>
                  <input
                    name="supervisor"
                    type="text"
                    className="form-control"
                    value={form.supervisor}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  rows="4"
                  className="form-control"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Start Date</label>
                  <input
                    name="start_date"
                    type="date"
                    className="form-control"
                    value={form.start_date}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">End Date</label>
                  <input
                    name="end_date"
                    type="date"
                    className="form-control"
                    value={form.end_date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label">Visibility</label>
                <select
                  name="visibility"
                  className="form-select"
                  value={form.visibility}
                  onChange={handleChange}
                >
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label">Leader</label>
                <select
                  name="leader"
                  className="form-select"
                  value={form.leader}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a leader</option>
                  {users.map(user => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label">Project File</label>
                <input
                  name="file_path"
                  type="file"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {projectID ? 'Save Changes' : 'Create Project'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/dashboard/projects')}
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
