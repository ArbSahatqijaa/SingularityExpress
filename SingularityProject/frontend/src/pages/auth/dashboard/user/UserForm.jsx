import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../services/api';
import DashboardLayout from '../DashboardLayout'; 

export default function UserForm() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username:       '',
    email:          '',
    first_name:     '',
    last_name:      '',
    password:       '',
    is_staff:       false,
    academic_title: '',
    profession:     '',
    avatar:         null,
    cover:          null
  });
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    API.get(`/users/${userId}/`)
      .then(({ data }) => {
        setForm({
          username:       data.username,
          email:          data.email,
          first_name:     data.first_name,
          last_name:      data.last_name,
          password:       '',
          is_staff:       data.is_staff,
          academic_title: data.academic_title || '',
          profession:     data.profession     || '',
          avatar:         null,
          cover:          null
        });
      })
      .catch(() => setError('Failed to load user'))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (me && form.is_staff && userId && !me.is_superuser) {
      navigate('/dashboard/users', { replace: true });
    }
  }, [me, form.is_staff, userId, navigate]);

  const handleChange = e => {
    const { name, value, type, checked, files } = e.target;
    setForm(f => ({
      ...f,
      [name]:
        type === 'checkbox' ? checked :
        type === 'file'     ? files[0] :
        value
    }));
  };

  const canEditStaff = me?.is_superuser;

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v === '' || v === null) return;
        if (k === 'password' && !v) return;
        if ((k === 'avatar' || k === 'cover') && !v) return;
        fd.append(k, v);
      });
      if (userId) {
        await API.patch(`/users/${userId}/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await API.post('/users/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate('/dashboard/users');
    } catch (err) {
      setError('Save failed: ' + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  if (loading && userId) return <div className="text-center py-5">Loading…</div>;

  return (
      <DashboardLayout>
    <div className="py-4" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <div className="container">
        <h1 className="mb-4">{userId ? 'Edit User' : 'New User'}</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <h5 className="text-secondary mb-3">Account Info</h5>
              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Username</label>
                  <input
                    name="username"
                    type="text"
                    required
                    className="form-control"
                    value={form.username}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <h5 className="text-secondary mb-3 border-top pt-4">Personal Details</h5>
              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <label className="form-label">First Name</label>
                  <input
                    name="first_name"
                    type="text"
                    required
                    className="form-control"
                    value={form.first_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Last Name</label>
                  <input
                    name="last_name"
                    type="text"
                    required
                    className="form-control"
                    value={form.last_name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <h5 className="text-secondary mb-3 border-top pt-4">Profile Images</h5>
              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Avatar</label>
                  <input
                    name="avatar"
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Cover</label>
                  <input
                    name="cover"
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <h5 className="text-secondary mb-3 border-top pt-4">Security</h5>
              <div className="mb-3">
                <label className="form-label">
                  Password {userId && '(leave blank to keep)'}
                </label>
                <input
                  name="password"
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
              <div className="form-check mb-4">
                <input
                  name="is_staff"
                  type="checkbox"
                  className="form-check-input"
                  checked={form.is_staff}
                  onChange={handleChange}
                  disabled={!canEditStaff}
                />
                <label className="form-check-label">
                  Is Staff?{!canEditStaff && ' (not allowed)'}
                </label>
              </div>

              <h5 className="text-secondary mb-3 border-top pt-4">Extra Info</h5>
              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Academic Title</label>
                  <select
                    name="academic_title"
                    value={form.academic_title}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Select Title</option>
                    <option value="Bachelor">Bachelor</option>
                    <option value="Master">Master</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Profession</label>
                  <input
                    name="profession"
                    type="text"
                    className="form-control"
                    value={form.profession}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {userId ? 'Save Changes' : 'Create User'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/dashboard/users')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
    
  );
}
