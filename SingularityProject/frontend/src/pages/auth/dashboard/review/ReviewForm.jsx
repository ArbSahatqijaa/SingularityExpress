import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../services/api';
import DashboardLayout from '../DashboardLayout';

export default function ReviewForm() {
  const { ReviewID } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [papers, setPapers] = useState([]);

  const [form, setForm] = useState({
    paper_reviewed: '',
    project_reviewed: '',
    rating: '',
    comment: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ReviewID) return;
    setLoading(true);
    API.get(`/reviews/${ReviewID}/`)
      .then(({ data }) => {
        setForm({
          paper_reviewed: data.paper_reviewed || '',
          project_reviewed: data.project_reviewed || '',
          rating: data.rating || '',
          comment: data.comment || '',
        });
      })
      .catch(() => setError('Failed to load review'))
      .finally(() => setLoading(false));
  }, [ReviewID]);

  useEffect(() => {
    setLoading(true);
    API.get(`/projects`)
      .then(({ data }) => setProjects(data))
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    API.get(`/papers`)
      .then(({ data }) => setPapers(data))
      .catch(() => setError('Failed to load papers'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!form.project_reviewed && !form.paper_reviewed) {
      setError('Please select at least one: either a project or a paper to review.');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form };
      if (ReviewID) {
        await API.patch(`/reviews/${ReviewID}/`, payload);
      } else {
        await API.post('/reviews/', payload);
      }
      navigate('/dashboard/reviews');
    } catch (err) {
      setError('Save failed: ' + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  if (loading && ReviewID) return <div className="text-center py-5">Loading…</div>;

  return (
    <DashboardLayout>
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-2xl mx-auto bg-white shadow rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {ReviewID ? 'Edit Review' : 'New Review'}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {ReviewID ? 'Update your review and rating.' : 'Submit a new project or paper review.'}
          </p>

          {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
              <input
                name="rating"
                type="number"
                step="0.1"
                min="1"
                max="5"
                required
                className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                value={form.rating}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
              <input
                name="comment"
                type="text"
                required
                className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                value={form.comment}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                name="project_reviewed"
                className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                value={form.project_reviewed}
                onChange={handleChange}
              >
                <option value="">-- Select Project --</option>
                {projects.map(project => (
                  <option key={project.project_id} value={project.project_id}>
                    {project.title || `Project #${project.project_id}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paper</label>
              <select
                name="paper_reviewed"
                className="w-full rounded-lg border-gray-300 shadow-sm text-sm"
                value={form.paper_reviewed}
                onChange={handleChange}
              >
                <option value="">-- Select Paper --</option>
                {papers.map(paper => (
                  <option key={paper.paper_id} value={paper.paper_id}>
                    {paper.title || `Paper #${paper.paper_id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm"
                disabled={loading}
              >
                {ReviewID ? 'Save Changes' : 'Create Review'}
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-sm font-semibold rounded-lg shadow-sm"
                onClick={() => navigate('/dashboard/reviews')}
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
