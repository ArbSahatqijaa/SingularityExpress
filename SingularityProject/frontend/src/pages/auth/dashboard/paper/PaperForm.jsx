import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../services/api';

export default function PaperForm() {
  const { paperId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    visibility: 'PUBLIC',
    status: 'ACTIVE',
    file_path: null,
    accepting_applications: true,
    role_details: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!paperId) return;
    setLoading(true);
    API.get(`/papers/${paperId}/`)
      .then(({ data }) => {
        setForm({
          title: data.title,
          description: data.description,
          visibility: data.visibility,
          status: data.status,
          file_path: null,
          accepting_applications: data.accepting_applications,
          role_details: data.role_details,
        });
      })
      .catch(() => setError('Failed to load paper'))
      .finally(() => setLoading(false));
  }, [paperId]);

  const handleChange = e => {
    const { name, value, type, files } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'file' ? files[0] : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v === '' || v === null) return;
        fd.append(k, v);
      });
      if (paperId) {
        await API.patch(`/papers/${paperId}/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await API.post('/papers/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      navigate('/dashboard/papers');
    } catch (err) {
      setError('Save failed: ' + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  if (loading && paperId) return <div className="text-center py-5">Loading…</div>;

  return (
    <div className="py-4" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <div className="container">
        <h1 className="mb-4">{paperId ? 'Edit Paper' : 'New Paper'}</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <h5 className="text-secondary mb-3">Paper Info</h5>
              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Title</label>
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
                  <label className="form-label">Description</label>
                  <input
                    name="description"
                    type="text"
                    required
                    className="form-control"
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <h5 className="text-secondary mb-3 border-top pt-4">Visibility and Status</h5>
              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Visibility</label>
                  <select
                    name="visibility"
                    value={form.visibility}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <h5 className="text-secondary mb-3 border-top pt-4">Application & Role Details</h5>

              <div className="form-check form-switch mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="accepting_applications"
                  checked={form.accepting_applications}
                  onChange={e =>
                    setForm(f => ({ ...f, accepting_applications: e.target.checked }))
                  }
                  id="acceptingApplicationsSwitch"
                />
                <label className="form-check-label" htmlFor="acceptingApplicationsSwitch">
                  Accepting Applications
                </label>
              </div>

              <div className="mb-4">
                <label className="form-label">Role Details</label>
                <textarea
                  name="role_details"
                  className="form-control"
                  rows="3"
                  value={form.role_details}
                  onChange={handleChange}
                />
              </div>

              <h5 className="text-secondary mb-3 border-top pt-4">File Upload</h5>
              <div className="mb-4">
                <label className="form-label">Paper File</label>
                <input
                  name="file_path"
                  type="file"
                  accept="application/pdf"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {paperId ? 'Save Changes' : 'Create Paper'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/dashboard/papers')}
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
