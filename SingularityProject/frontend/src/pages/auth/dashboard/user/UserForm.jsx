import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../services/api';
import DashboardLayout from '../DashboardLayout';

export default function UserForm() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    is_staff: false,
    academic_title: '',
    profession: '',
    avatar: null,
    cover: null,
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
          username: data.username,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          password: '',
          is_staff: data.is_staff,
          academic_title: data.academic_title || '',
          profession: data.profession || '',
          avatar: null,
          cover: null,
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
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
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
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await API.post('/users/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      navigate('/dashboard/users');
    } catch (err) {
      setError('Save failed: ' + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  if (loading && userId) return <div className="text-center py-10 text-gray-500">Loading…</div>;

  return (
    <DashboardLayout>
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-3xl mx-auto bg-white shadow rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {userId ? 'Edit User' : 'Create New User'}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {userId ? 'Update user details and access.' : 'Add a new user to the system.'}
          </p>

          {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  name="username"
                  type="text"
                  required
                  className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                  value={form.username}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  name="first_name"
                  type="text"
                  required
                  className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                  value={form.first_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  name="last_name"
                  type="text"
                  required
                  className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                  value={form.last_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {userId && '(leave blank to keep)'}
                </label>
                <input
                  name="password"
                  type="password"
                  className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  name="is_staff"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  checked={form.is_staff}
                  onChange={handleChange}
                  disabled={!canEditStaff}
                />
                <label className="text-sm text-gray-700">
                  Staff user? {!canEditStaff && <span className="text-gray-400">(not allowed)</span>}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Title</label>
                <select
                  name="academic_title"
                  value={form.academic_title}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                >
                  <option value="">Select Title</option>
                  <option value="None">None</option>
                  <option value="Student">Student</option>
                  <option value="Bachelor">Bachelor</option>
                  <option value="Master">Master</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                <input
                  name="profession"
                  type="text"
                  className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                  value={form.profession}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar</label>
                <input
                  name="avatar"
                  type="file"
                  accept="image/*"
                  className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                <input
                  name="cover"
                  type="file"
                  accept="image/*"
                  className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm"
                disabled={loading}
              >
                {userId ? 'Save Changes' : 'Create User'}
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-sm font-semibold rounded-lg shadow-sm"
                onClick={() => navigate('/dashboard/users')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
