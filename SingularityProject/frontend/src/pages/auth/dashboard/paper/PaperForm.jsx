import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../services/api';
import DashboardLayout from '../DashboardLayout';

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
    <DashboardLayout>
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            {paperId ? 'Edit Paper' : 'New Paper'}
          </h1>
          {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-xl shadow">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                name="title"
                type="text"
                required
                value={form.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                name="description"
                type="text"
                required
                value={form.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Visibility</label>
                <select
                  name="visibility"
                  value={form.visibility}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  name="accepting_applications"
                  checked={form.accepting_applications}
                  onChange={e =>
                    setForm(f => ({ ...f, accepting_applications: e.target.checked }))
                  }
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <span>Accepting Applications</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Role Details</label>
              <textarea
                name="role_details"
                rows="3"
                value={form.role_details}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Paper File (PDF)</label>
              <input
                name="file_path"
                type="file"
                accept="application/pdf"
                onChange={handleChange}
                className="mt-1 block w-full text-sm text-gray-700"
              />
            </div>

            <div className="flex justify-start gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm"
              >
                {paperId ? 'Save Changes' : 'Create Paper'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/papers')}
                className="inline-flex items-center px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-md shadow-sm"
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
