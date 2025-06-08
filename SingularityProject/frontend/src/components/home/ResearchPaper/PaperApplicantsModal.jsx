// src/components/ResearchPaper/PaperApplicantsModal.jsx
import React, { useEffect, useState } from 'react';
import API from '../../../services/api';
import { FileText, User, X, CheckCircle, Loader2 } from 'lucide-react';

export default function PaperApplicantsModal({ paperId, onClose }) {
  const [apps, setApps] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setBusy(true);
    API.get('/applications/', { params: { paper_id: paperId } })
      .then(({ data }) => setApps(data))
      .catch(() => setError('Could not load applications'))
      .finally(() => setBusy(false));
  }, [paperId]);

  const updateStatus = async (appId, newStatus, role = '') => {
    try {
      await API.patch(`/applications/${appId}/`, { status: newStatus, paper: paperId });

      if (newStatus === 'ACCEPTED') {
        const selectedApp = apps.find(a => a.application_id === appId);
        await API.post('/user_papers/', {
          user_id: selectedApp?.applicant,
          paper_id: paperId,
          role,
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
    <div className="fixed inset-0 bg-white z-50 p-6 sm:p-10 overflow-y-auto">
      <button
        onClick={onClose}
        className="text-gray-600 mb-6 text-sm hover:text-black transition"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Paper Applications
      </h2>

      {busy && (
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="animate-spin w-5 h-5" />
          <span>Loading applications…</span>
        </div>
      )}

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {!busy && !error && apps.length === 0 && (
        <p className="text-gray-500">No applications submitted yet.</p>
      )}

      <ul className="space-y-6">
        {apps.map(app => (
          <li
            key={app.application_id}
            className="border border-gray-200 p-5 rounded-xl shadow-sm bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-800 font-semibold">
                <User className="w-5 h-5 text-blue-600" />
                Applicant #{app.applicant}
              </div>

              <span className={`text-xs font-semibold px-3 py-1 rounded-full
                ${app.status === 'PENDING' && 'bg-yellow-100 text-yellow-800'}
                ${app.status === 'ACCEPTED' && 'bg-green-100 text-green-800'}
                ${app.status === 'REJECTED' && 'bg-red-100 text-red-800'}`}>
                {app.status}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-600">
              <span className="font-medium">Role Applied:</span>{' '}
              <span className="italic">{app.role_applied_for || 'Not specified'}</span>
            </p>

            <p className="mt-3 text-gray-700 whitespace-pre-wrap">
              {app.message || <span className="italic text-gray-400">No message provided.</span>}
            </p>

            <div className="mt-4 flex items-center gap-4 text-sm">
              {app.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => {
                      const role = prompt('Assign role to this user:', 'Co-author');
                      if (role) updateStatus(app.application_id, 'ACCEPTED', role);
                    }}
                    className="flex items-center gap-1 text-green-600 hover:underline"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept
                  </button>

                  <button
                    onClick={() => updateStatus(app.application_id, 'REJECTED')}
                    className="flex items-center gap-1 text-red-600 hover:underline"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </>
              )}

              {app.cv && (
                <a
                  href={app.cv}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <FileText className="w-4 h-4" />
                  View CV
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
