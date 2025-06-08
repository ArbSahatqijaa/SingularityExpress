import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../services/api';
import DashboardLayout from '../DashboardLayout';

export default function ProjectForm() {
  const { projectID } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    visibility: 'PUBLIC',
    status: 'ACTIVE',
    file_path: null,
    image: null,
    leader: '',
    role_details: '',
    accepting_applications: false,
  });

  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => {
        setMe(data);
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

  useEffect(() => {
    if (!projectID) return;
    setLoading(true);

    API.get(`/projects/${projectID}/`)
      .then(({ data }) => {
        setForm({
          title: data.title,
          description: data.description,
          visibility: data.visibility,
          status: data.status,
          file_path: null,
          image: null,
          leader: data.leader,
          role_details: data.role_details || '',
          accepting_applications: data.accepting_applications || false,
        });
      })
      .catch(() => setError('Failed to load project'))
      .finally(() => setLoading(false));
  }, [projectID]);

  const handleChange = e => {
    const { name, value, type, files } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'file' ? files[0] : value,
    }));
  };

  const canReassignLeader = () =>
    me && (me.is_superuser || me.is_staff || (projectID && me.user_id === parseInt(form.leader)));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        visibility: form.visibility,
        status: form.status,
        leader: parseInt(form.leader),
        role_details: form.role_details,
        accepting_applications: form.accepting_applications,
      };

      const useFD = !projectID || form.file_path || form.image;
      if (useFD) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v != null) fd.append(k, v);
        });
        fd.append('file_path', form.file_path);
        if (form.image) fd.append('image', form.image);

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
        await API.patch(`/projects/${projectID}/`, payload);
      }

      navigate('/dashboard/projects');
    } catch (err) {
      console.error('Submit error:', err.response?.data);
      setError('Save failed: ' + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  if (loading && projectID) return <div className="text-center py-10 text-gray-500">Loading…</div>;

  return (
    <DashboardLayout>
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-2xl mx-auto bg-white shadow rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {projectID ? 'Edit Project' : 'New Project'}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {projectID ? 'Update project details and files.' : 'Create and configure a new project.'}
          </p>

          {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
              <input
                name="title"
                type="text"
                required
                className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                rows="3"
                required
                className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                <select
                  name="visibility"
                  className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                  value={form.visibility}
                  onChange={handleChange}
                >
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leader</label>
              <select
                name="leader"
                className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
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
                <p className="text-xs text-gray-400 mt-1">
                  Only the current leader, staff or superuser can reassign.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project File</label>
              <input
                name="file_path"
                type="file"
                className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                onChange={handleChange}
                required={!projectID}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image (optional)</label>
              <input
                name="image"
                type="file"
                className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Details</label>
              <textarea
                name="role_details"
                rows="3"
                className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                value={form.role_details}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                name="accepting_applications"
                type="checkbox"
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                id="accepting_applications"
                checked={form.accepting_applications}
                onChange={e =>
                  setForm(f => ({ ...f, accepting_applications: e.target.checked }))
                }
              />
              <label className="text-sm text-gray-700" htmlFor="accepting_applications">
                Accepting Applications
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm"
                disabled={loading}
              >
                {projectID ? 'Save Changes' : 'Create Project'}
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-sm font-semibold rounded-lg shadow-sm"
                onClick={() => navigate('/dashboard/projects')}
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