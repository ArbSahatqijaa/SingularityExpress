import React, { useEffect, useState } from 'react';
import { useNavigate, useParams }     from 'react-router-dom';
import API                             from '../../../../services/api';

export default function ProjectForm() {
  const { projectID } = useParams();
  const navigate      = useNavigate();

  const [form, setForm] = useState({
    title:       '',
    description: '',
    visibility:  'PUBLIC',
    status:      'ACTIVE',
    file_path:   null,
    leader:      '',    // will default to me.user_id
  });
  const [me,      setMe]      = useState(null);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // 1️⃣ Fetch current user and list of all users (for leader dropdown)
  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => {
        setMe(data);
        // default leader on creation
        if (!projectID) {
          setForm(f => ({ ...f, leader: data.user_id }));
        }
        return API.get('/users/');
      })
      .then(({ data }) => setUsers(data))
      .catch(() => {
        setMe(null);
        setUsers([]);
      });
  }, [projectID]);

  // 2️⃣ If editing, load existing project
  useEffect(() => {
    if (!projectID) return;
    setLoading(true);

    API.get(`/projects/${projectID}/`)
      .then(({ data }) => {
        setForm({
          title:       data.title,
          description: data.description,
          visibility:  data.visibility,
          status:      data.status,
          file_path:   null,          // leave blank so file isn’t overwritten
          leader:      data.leader,   // existing leader
        });
      })
      .catch(() => setError('Failed to load project'))
      .finally(() => setLoading(false));
  }, [projectID]);

  // 3️⃣ Handle form inputs
  const handleChange = e => {
    const { name, value, type, files } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  // 4️⃣ Only leader/staff/superuser may reassign leadership
  const canReassignLeader = () =>
    me && (
      me.is_superuser ||
      me.is_staff ||
      (projectID && me.user_id === parseInt(form.leader))
    );

  // 5️⃣ Submit (create or update)
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Ensure integers where needed
      const payload = {
        title:       form.title,
        description: form.description,
        visibility:  form.visibility,
        status:      form.status,
        leader:      parseInt(form.leader),
      };

      const isFile = !!form.file_path;
      if (isFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v != null) fd.append(k, v);
        });
        fd.append('file_path', form.file_path);

        if (projectID) {
          await API.patch(`/projects/${projectID}/`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          await API.post('/projects/', fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
      } else {
        if (projectID) {
          await API.patch(`/projects/${projectID}/`, payload);
        } else {
          await API.post('/projects/', payload);
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

  if (loading && projectID) {
    return <div className="text-center py-5">Loading…</div>;
  }

  return (
    <div className="py-4" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <div className="container">
        <h1 className="mb-4">{projectID ? 'Edit Project' : 'New Project'}</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Title & Description */}
              <div className="mb-3">
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
              <div className="mb-4">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  required
                  className="form-control"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              {/* Visibility & Status */}
              <div className="row mb-4">
                <div className="col">
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
                <div className="col">
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
              </div>

              {/* Leader */}
              <div className="mb-4">
                <label className="form-label">Leader</label>
                <select
                  name="leader"
                  className="form-select"
                  value={form.leader}
                  onChange={handleChange}
                  disabled={!canReassignLeader()}
                  required
                >
                  <option value="">Select leader</option>
                  {users.map(u => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.username}
                    </option>
                  ))}
                </select>
                {!canReassignLeader() && (
                  <div className="form-text text-muted">
                    Only the current leader, staff or superuser can reassign.
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label className="form-label">Project File</label>
                <input
                  name="file_path"
                  type="file"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>

              {/* Actions */}
              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
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
