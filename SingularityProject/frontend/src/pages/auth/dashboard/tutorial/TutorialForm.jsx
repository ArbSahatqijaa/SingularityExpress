import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../services/api';

export default function TutorialForm() {
  const { TutorialID } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    filePath: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!TutorialID) return;
    setLoading(true);
    API.get(`/tutorials/${TutorialID}/`)
      .then(({ data }) => {
        setForm({
          title:       data.title,
          filePath: data.filePath,
        });
      })
      .catch(() => setError('Failed to load Tutorial'))
      .finally(() => setLoading(false));
  }, [TutorialID]);

  const handleChange = e => {
    const { name, value, type, files } = e.target;
    setForm(f => ({
      ...f,
      [name]:
        type === 'file' ? files[0] : value
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
      if (TutorialID) {
        await API.patch(`/tutorials/${TutorialID    }/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await API.post('/tutorials/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate('/dashboard/tutorials');
    } catch (err) {
      setError('Save failed: ' + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  if (loading && TutorialID) return <div className="text-center py-5">Loading…</div>;

  return (
    <div className="py-4" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <div className="container">
        <h1 className="mb-4">{TutorialID ? 'Edit Tutorial' : 'New Tutorial'}</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <h5 className="text-secondary mb-3">Tutorial Info</h5>
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
                <div className="mb-4">
                <label className="form-label">File Path</label>
                <input
                  name="filePath"
                  type="file"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {TutorialID ? 'Save Changes' : 'Create Tutorial'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/dashboard/tutorials')}
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
