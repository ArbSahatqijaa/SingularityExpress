import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../services/api';
import DashboardLayout from '../DashboardLayout';

export default function InvitationPage() {
  const [invitations, setInvitations] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const { data } = await API.get('/invitations/');
        setInvitations(data);
      } catch (err) {
        setError('Failed to load invitations');
      } finally {
        setLoading(false);
      }
    };
    fetchInvitations();
  }, []);

  const canManage = target =>
    me?.is_superuser || me?.id === target.sender || me?.id === target.receiver;

  const handleDelete = async invitationId => {
    if (!canManage(invitations.find(i => i.invitation_id === invitationId))) {
      return alert("You don't have permission to delete this invitation");
    }
    if (!window.confirm('Delete this invitation?')) return;
    await API.delete(`/invitations/${invitationId}/`);
    setInvitations(invitations.filter(i => i.invitation_id !== invitationId));
  };

  const handleEdit = invitationId => {
    if (!canManage(invitations.find(i => i.invitation_id === invitationId))) {
      return alert("You don't have permission to edit this invitation");
    }
    navigate(`/dashboard/invitations/edit/${invitationId}`);
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Loading invitations...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;

  return (
    <DashboardLayout>
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Manage Invitations</h1>
              <p className="text-sm text-gray-500 mt-1">Review, edit or delete project/paper invites</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/invitations/new')}
              className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-md"
            >
              + New Invitation
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-medium text-gray-600">ID</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Sender</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Receiver</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Project</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Paper</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Status</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Message</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Created At</th>
                    <th className="px-6 py-4 text-center font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invitations.map(i => (
                    <tr key={i.invitation_id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-900">{i.invitation_id}</td>
                      <td className="px-6 py-4">{i.sender}</td>
                      <td className="px-6 py-4">{i.receiver}</td>
                      <td className="px-6 py-4">{i.project_invitation || '-'}</td>
                      <td className="px-6 py-4">{i.paper_invitation || '-'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${
                            i.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                            i.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-700'}`}
                        >
                          {i.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{i.message}</td>
                      <td className="px-6 py-4">{new Date(i.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        {canManage(i) ? (
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleEdit(i.invitation_id)}
                              className="px-3 py-1.5 text-xs bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-md shadow-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(i.invitation_id)}
                              className="px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md shadow-sm"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">–</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}