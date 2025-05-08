import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../services/api';

export default function InvitationForm() {
  const { invitationId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    sender: '',
    receiver: '',
    project_invitation: '',
    paper_invitation: '',
    status: 'PENDING',
    message: '',
  });

  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch user info and all required data for form
    const fetchInitialData = async () => {
      try {
        // Fetch current user
        const { data: userData } = await API.get('/whoami/');
        setMe(userData);
        setForm(f => ({
          ...f,
          sender: userData.id, // Set sender to current user by default
        }));

        // Fetch all users, projects, and papers
        const [usersRes, projectsRes, papersRes] = await Promise.all([
          API.get('/users/'),
          API.get('/projects/'),
          API.get('/papers/'),
        ]);

        setUsers(usersRes.data);
        setProjects(projectsRes.data);
        setPapers(papersRes.data);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load required data');
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!invitationId) return;
    setLoading(true);
    API.get(`/invitations/${invitationId}/`)
      .then(({ data }) => {
        setForm({
          ...data,
        });
      })
      .catch(() => setError('Failed to load invitation'))
      .finally(() => setLoading(false));
  }, [invitationId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Process form data for submission
      const updatedForm = {
        ...form,
        sender: parseInt(form.sender),
        receiver: parseInt(form.receiver),
        project_invitation: form.project_invitation ? parseInt(form.project_invitation) : null,
        paper_invitation: form.paper_invitation ? parseInt(form.paper_invitation) : null,
      };

      if (invitationId) {
        await API.patch(`/invitations/${invitationId}/`, updatedForm);
      } else {
        await API.post('/invitations/', updatedForm);
      }

      navigate('/dashboard/invitations');
    } catch (err) {
      console.error('Submit error:', err.response?.data);
      setError('Save failed: ' + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4" style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <div className="container">
        <h1 className="mb-4">{invitationId ? 'Edit Invitation' : 'Create Invitation'}</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <h5 className="text-secondary mb-3">Invitation Details</h5>

              <div className="mb-4">
                <label className="form-label">Sender</label>
                <select
                  name="sender"
                  className="form-select"
                  value={form.sender}
                  onChange={handleChange}
                  required
                  disabled={invitationId !== undefined}
                >
                  <option value="">Select a sender</option>
                  {users.map(user => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.username}
                    </option>
                  ))}
                </select>
                {invitationId && <p className="text-muted small mt-1">Sender cannot be changed for existing invitations</p>}
              </div>

              <div className="mb-4">
                <label className="form-label">Receiver</label>
                <select
                  name="receiver"
                  className="form-select"
                  value={form.receiver}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a receiver</option>
                  {users.filter(user => user.user_id !== parseInt(form.sender)).map(user => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label">Project (Optional)</label>
                <select
                  name="project_invitation"
                  className="form-select"
                  value={form.project_invitation}
                  onChange={handleChange}
                >
                  <option value="">No Project</option>
                  {projects.map(project => (
                    <option key={project.project_id} value={project.project_id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label">Paper (Optional)</label>
                <select
                  name="paper_invitation"
                  className="form-select"
                  value={form.paper_invitation}
                  onChange={handleChange}
                >
                  <option value="">No Paper</option>
                  {papers.map(paper => (
                    <option key={paper.paper_id} value={paper.paper_id}>
                      {paper.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={form.status}
                  onChange={handleChange}
                  required
                >
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label">Message</label>
                <textarea
                  name="message"
                  className="form-control"
                  value={form.message}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Optional message for the invitation"
                />
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {invitationId ? 'Save Changes' : 'Create Invitation'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/dashboard/invitations')}
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