import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../services/api';
import DashboardLayout from '../DashboardLayout';

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
    const fetchInitialData = async () => {
      try {
        const { data: userData } = await API.get('/whoami/');
        setMe(userData);
        setForm(f => ({ ...f, sender: userData.user_id }));

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
      .then(({ data }) => setForm(data))
      .catch(() => setError('Failed to load invitation'))
      .finally(() => setLoading(false));
  }, [invitationId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const updatedForm = {
      ...form,
      sender: parseInt(form.sender),
      receiver: parseInt(form.receiver),
      project_invitation: form.project_invitation ? parseInt(form.project_invitation) : null,
      paper_invitation: form.paper_invitation ? parseInt(form.paper_invitation) : null,
    };

    try {
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
    <DashboardLayout>
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-2xl mx-auto bg-white p-8 shadow-lg rounded-2xl">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">
            {invitationId ? 'Edit Invitation' : 'Create Invitation'}
          </h1>

          {error && <div className="mb-4 text-red-600 font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sender</label>
              <select
                name="sender"
                className="w-full border-gray-300 rounded-md shadow-sm"
                value={form.sender}
                onChange={handleChange}
                disabled={invitationId !== undefined}
              >
                <option value="">Select sender</option>
                {users.map(user => (
                  <option key={user.user_id} value={user.user_id}>{user.username}</option>
                ))}
              </select>
              {invitationId && <p className="text-xs text-gray-400 mt-1">Sender cannot be changed.</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receiver</label>
              <select
                name="receiver"
                className="w-full border-gray-300 rounded-md shadow-sm"
                value={form.receiver}
                onChange={handleChange}
              >
                <option value="">Select receiver</option>
                {users.filter(u => u.user_id !== parseInt(form.sender)).map(user => (
                  <option key={user.user_id} value={user.user_id}>{user.username}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project (Optional)</label>
              <select
                name="project_invitation"
                className="w-full border-gray-300 rounded-md shadow-sm"
                value={form.project_invitation}
                onChange={handleChange}
              >
                <option value="">No Project</option>
                {projects.map(project => (
                  <option key={project.project_id} value={project.project_id}>{project.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paper (Optional)</label>
              <select
                name="paper_invitation"
                className="w-full border-gray-300 rounded-md shadow-sm"
                value={form.paper_invitation}
                onChange={handleChange}
              >
                <option value="">No Paper</option>
                {papers.map(paper => (
                  <option key={paper.paper_id} value={paper.paper_id}>{paper.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                className="w-full border-gray-300 rounded-md shadow-sm"
                value={form.status}
                onChange={handleChange}
              >
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                name="message"
                className="w-full border-gray-300 rounded-md shadow-sm"
                rows="3"
                value={form.message}
                onChange={handleChange}
                placeholder="Optional message for the invitation"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm"
              >
                {invitationId ? 'Save Changes' : 'Create Invitation'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/invitations')}
                className="inline-flex items-center px-5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md"
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