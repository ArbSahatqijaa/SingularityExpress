import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../services/api';

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

  // Custom validation
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
    <div className="py-4" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <div className="container">
        <h1 className="mb-4">{ReviewID ? 'Edit Review' : 'New Review'}</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <h5 className="text-secondary mb-3">Review Info</h5>
              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Rating</label>
                  <input
                    name="rating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    required
                    className="form-control"
                    value={form.rating}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Comment</label>
                  <input
                    name="comment"
                    type="text"
                    required
                    className="form-control"
                    value={form.comment}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Project</label>
                  <select
                    name="project_reviewed"
                    className="form-control"
                    value={form.project_reviewed}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Project --</option>
                    {projects.map(project => (
                      <option key={project.project_id} value={project.project_id}>
                        {project.title || project.name || `Project #${project.project_id}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Paper</label>
                  <select
                    name="paper_reviewed"
                    className="form-control"
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
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {ReviewID ? 'Save Changes' : 'Create Review'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/dashboard/reviews')}
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
