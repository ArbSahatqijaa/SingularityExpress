import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../services/api';
import DashboardLayout from '../DashboardLayout';

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
          title: data.title,
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
      if (TutorialID) {
        await API.patch(`/tutorials/${TutorialID}/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await API.post('/tutorials/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      navigate('/dashboard/tutorials');
    } catch (err) {
      setError('Save failed: ' + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  const isEditing = Boolean(TutorialID);

  return (
    <DashboardLayout>
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-2xl mx-auto bg-white shadow rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Edit Tutorial' : 'New Tutorial'}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {isEditing ? 'Update tutorial file and title.' : 'Upload a new tutorial document.'}
          </p>

          {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File Upload</label>
              <input
                type="file"
                name="filePath"
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm"
                disabled={loading}
              >
                {isEditing ? 'Save Changes' : 'Create Tutorial'}
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-sm font-semibold rounded-lg shadow-sm"
                onClick={() => navigate('/dashboard/tutorials')}
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
