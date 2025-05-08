import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../services/api';

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

  // fetch all invitations
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

  if (loading) return <div>Loading invitations...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div className="container py-4">
      <h1 className="mb-4 text-primary">Manage Invitations</h1>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          className="btn btn-success"
          onClick={() => navigate('/dashboard/invitations/new')}
        >
          Create New Invitation
        </button>
      </div>

      {invitations.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-hover table-bordered align-middle shadow-sm">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Sender</th>
                <th>Receiver</th>
                <th>Project</th>
                <th>Paper</th>
                <th>Status</th>
                <th>Message</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map(i => (
                <tr key={i.invitation_id}>
                  <td>{i.invitation_id}</td>
                  <td>{i.sender}</td>
                  <td>{i.receiver}</td>
                  <td>{i.project_invitation || '-'}</td>
                  <td>{i.paper_invitation || '-'}</td>
                  <td>
                    <span
                      className={`badge ${
                        i.status === 'ACCEPTED' ? 'bg-success' : 
                        i.status === 'PENDING' ? 'bg-warning' : 'bg-danger'
                      }`}
                    >
                      {i.status}
                    </span>
                  </td>
                  <td>{i.message}</td>
                  <td>{new Date(i.created_at).toLocaleString()}</td>
                  <td>
                    {canManage(i) ? (
                      <>
                        <button
                          className="btn btn-sm btn-outline-warning me-1"
                          onClick={() => handleEdit(i.invitation_id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(i.invitation_id)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className="text-muted">–</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted">No invitations available</p>
      )}
    </div>
  );
} 