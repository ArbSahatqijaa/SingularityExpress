import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../services/api';

export default function RequiredrolesForm() {
  const { RequiredrolesID } = useParams();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [papers, setPapers] = useState([]);
  const [contentTypes, setContentTypes] = useState({});
  const [roleChoices, setRoleChoices] = useState([]);

  const [form, setForm] = useState({
    content_type: '',
    object_id: '',
    role: '',
    quantity: 1,
    required_profession: '',
    active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load available content types, projects, and papers
  useEffect(() => {
    API.get('/projects/').then(({ data }) => setProjects(data)).catch(() => {});
    API.get('/papers/').then(({ data }) => setPapers(data)).catch(() => {});
    API.get('/allowed_content_types/')
      .then(({ data }) => setContentTypes(data))
      .catch(() => setError('Failed to load content types'));
    API.get('/role_choices/')
      .then(({ data }) => setRoleChoices(data))
      .catch(() => setError('Failed to load role choices'));
  }, []);

  // Load required role if editing
  useEffect(() => {
    if (!RequiredrolesID || Object.keys(contentTypes).length === 0) return;
  
    setLoading(true);
    API.get(`/required_roles/${RequiredrolesID}/`)
      .then(({ data }) => {
        const contentTypeId = Object.entries(contentTypes).find(
          ([label]) => label.toLowerCase() === data.content_type.toLowerCase()
        )?.[1];
  
        setForm({
          content_type: contentTypeId || '',
          object_id: data.object_id,
          role: data.role,
          quantity: data.quantity,
          required_profession: data.required_profession || '',
          active: data.active,
        });
      })
      .catch((err) => {
        setError('Failed to load required role');
        console.log('Error fetching required role:', err);
      })
      .finally(() => setLoading(false));
  }, [RequiredrolesID, contentTypes]);

  const handleChange = e => {
    const { name, value } = e.target;

    // Parse specific fields to integer
    const parsedValue =
      ['content_type', 'object_id', 'quantity'].includes(name) ? parseInt(value, 10) : value;

    // Reset object_id when content_type changes
    if (name === 'content_type') {
      setForm(f => ({
        ...f,
        content_type: parsedValue,
        object_id: '',  // Reset object_id
      }));
      return;
    }

    setForm(f => ({
      ...f,
      [name]: parsedValue,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };

      // Ensure that content_type is mapped to its corresponding model
      payload.content_type = Object.keys(contentTypes).find(
        key => contentTypes[key] === form.content_type
      ); // Convert ID back to model name (Project, Paper)

      if (RequiredrolesID) {
        await API.patch(`/required_roles/${RequiredrolesID}/`, payload);
      } else {
        await API.post('/required_roles/', payload);
      }
      navigate('/dashboard/required_roles');
    } catch (err) {
      setError('Save failed: ' + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  if (loading && RequiredrolesID) return <div className="text-center py-5">Loading…</div>;

  return (
    <div className="py-4" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <div className="container">
        <h1 className="mb-4">{RequiredrolesID ? 'Edit Required Role' : 'New Required Role'}</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <h5 className="text-secondary mb-3">Role Details</h5>

              <div className="mb-3">
                <label className="form-label">Content Type</label>
                  <select
    className="form-select"
    name="content_type"
    value={form.content_type}
    onChange={handleChange}
    required
  >
    <option value="">Select Type</option>
    {Object.entries(contentTypes).map(([label, id]) => (
      <option key={id} value={id}>{label}</option>
    ))}
  </select> 
              </div>

              <div className="mb-3">
                <label className="form-label">Associated Object</label>
                <select
  className="form-select"
  name="object_id"
  value={form.object_id}
  onChange={handleChange}
  required
>
  <option value="">Select Project or Paper</option>
  {form.content_type === contentTypes.Project &&
    projects.map(p => (
      <option key={p.project_id} value={p.project_id}>{p.title}</option>
    ))}
  {form.content_type === contentTypes.Paper &&
    papers.map(p => (
      <option key={p.paper_id} value={p.paper_id}>{p.title}</option>
    ))}
</select>
              </div>

              <div className="mb-3">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Role</option>
                  {roleChoices.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Required Profession (optional)</label>
                <input
                  type="text"
                  name="required_profession"
                  value={form.required_profession}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-check mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                  id="activeCheck"
                />
                <label className="form-check-label" htmlFor="activeCheck">Active</label>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {RequiredrolesID ? 'Save Changes' : 'Create Role'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/dashboard/required_roles')}
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
