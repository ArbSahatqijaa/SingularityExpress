import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../services/api';
import DashboardLayout from '../DashboardLayout';

export default function PaperProjectForm() {
  const { paperProjectId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    id: null,
    paper_id: '',
    project_id: '',
    notes: '',
    added_by: '',
  });

  const [papers, setPapers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => {
        setForm(f => ({ ...f, added_by: data.user_id }));
        return Promise.all([API.get('/papers/'), API.get('/projects/')]);
      })
      .then(([pRes, projRes]) => {
        setPapers(pRes.data);
        setProjects(projRes.data);
      })
      .catch(() => setError('Failed to load papers or projects'));
  }, []);

  useEffect(() => {
    if (!paperProjectId) return;
    setLoading(true);
    API.get(`/paper_projects/${paperProjectId}/`)
      .then(({ data }) => {
        setForm({
          id: data.id,
          paper_id: data.paper.paper_id,
          project_id: data.project.project_id,
          notes: data.notes || '',
          added_by: data.added_by,
        });
      })
      .catch(() => setError('Failed to load record'))
      .finally(() => setLoading(false));
  }, [paperProjectId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      paper_id: parseInt(form.paper_id, 10),
      project_id: parseInt(form.project_id, 10),
      notes: form.notes,
      added_by: form.added_by,
    };

    try {
      if (paperProjectId) {
        await API.patch(`/paper_projects/${form.id}/`, payload);
      } else {
        await API.post('/paper_projects/', payload);
      }
      navigate('/dashboard/paper_projects');
    } catch (err) {
      setError('Save failed: ' + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  if (loading && paperProjectId) {
    return <div className="text-center py-10 text-gray-500">Loading…</div>;
  }

  return (
    <DashboardLayout>
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
            {paperProjectId ? 'Edit Link' : 'New Paper-Project Link'}
          </h1>

          {error && <div className="mb-4 text-red-600 font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            {form.id != null && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                <input className="form-input w-full" value={form.id} readOnly />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paper</label>
              <select
                name="paper_id"
                className="form-select w-full"
                value={form.paper_id}
                onChange={handleChange}
                required
                disabled={Boolean(paperProjectId)}
              >
                <option value="">Select Paper</option>
                {papers.map(p => (
                  <option key={p.paper_id} value={p.paper_id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                name="project_id"
                className="form-select w-full"
                value={form.project_id}
                onChange={handleChange}
                required
                disabled={Boolean(paperProjectId)}
              >
                <option value="">Select Project</option>
                {projects.map(proj => (
                  <option key={proj.project_id} value={proj.project_id}>
                    {proj.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                name="notes"
                className="form-input w-full"
                value={form.notes}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow"
                disabled={loading}
              >
                {paperProjectId ? 'Save Changes' : 'Create Link'}
              </button>
              <button
                type="button"
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-sm font-medium rounded-lg"
                onClick={() => navigate('/dashboard/paper_projects')}
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
