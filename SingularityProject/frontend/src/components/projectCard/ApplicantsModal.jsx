import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { FileText, User, BadgeCheck, XCircle } from 'lucide-react';

export default function ApplicantsModal({ projectId, onClose }) {
  const [apps, setApps] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setBusy(true);
    API.get('/applications/', { params: { project_id: projectId } })
      .then(({ data }) => setApps(data))
      .catch(() => setError('Could not load applications'))
      .finally(() => setBusy(false));
  }, [projectId]);

  const updateStatus = async (appId, newStatus, role = '') => {
    try {
      await API.patch(`/applications/${appId}/`, { status: newStatus, project: projectId });

      if (newStatus === 'ACCEPTED') {
        await API.post('/user_projects/', {
          user_id: apps.find(a => a.application_id === appId).applicant,
          project_id: projectId,
          role
        });
      }

      setApps(list =>
        list.map(a =>
          a.application_id === appId ? { ...a, status: newStatus } : a
        )
      );
    } catch {
      alert('Update failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 p-6 sm:p-12 overflow-auto">
      <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 mb-6">← Back</button>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Project Applications</h2>

      {busy && <p className="text-gray-600">Loading applications…</p>}
      {error && <p className="text-red-600 font-medium">{error}</p>}

      {!busy && !error && apps.length === 0 && (
        <p className="text-gray-500 italic">No applications submitted yet.</p>
      )}

      <ul className="space-y-6">
        {apps.map(app => (
          <li key={app.application_id} className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-gray-800">
                <User className="w-5 h-5" />
                <span className="font-semibold">Applicant #{app.applicant}</span>
              </div>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full
                ${app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : ''}
                ${app.status === 'REJECTED' ? 'bg-red-100 text-red-800' : ''}`}
              >
                {app.status}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-2 italic">Role: {app.role_applied_for || '—'}</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap mb-4">{app.message || 'No message provided.'}</p>

            <div className="flex items-center justify-between">
              {app.status === 'PENDING' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      const role = prompt('Assign role for this user?', 'Member');
                      if (role !== null) updateStatus(app.application_id, 'ACCEPTED', role);
                    }}
                    className="inline-flex items-center gap-1 text-green-600 hover:underline"
                  >
                    <BadgeCheck className="w-4 h-4" /> Accept
                  </button>

                  <button
                    onClick={() => updateStatus(app.application_id, 'REJECTED')}
                    className="inline-flex items-center gap-1 text-red-600 hover:underline"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}

              {app.cv && (
                <a
                  href={app.cv}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <FileText className="w-4 h-4" /> View CV
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}