import React, { useEffect, useState } from 'react';
import API from '../../../services/api';

/**
 * Lists all applications for a given paper.
 * Owner can accept / reject just like project flow.
 */
export default function PaperApplicantsModal({ paperId, onClose }) {
  const [apps,  setApps]  = useState([]);
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState('');

  /* fetch once */
  useEffect(() => {
    setBusy(true);
    API.get('/applications/', { params:{ paper_id: paperId } })
      .then(({data})=>setApps(data))
      .catch(()=>setError('Could not load applications'))
      .finally(()=>setBusy(false));
  }, [paperId]);

  /* accept / reject helpers */
  const updateStatus = async (appId, newStatus, role='') => {
    try {
      // 1) patch application status
      await API.patch(`/applications/${appId}/`, { status: newStatus, paper: paperId });

      // 2) if accepted – immediately add to UserPaper table
      if (newStatus === 'ACCEPTED') {
        await API.post('/user_papers/', {
          user_id:  apps.find(a=>a.application_id===appId).applicant,
          paper_id: paperId,
          role
        });
      }

      // 3) refresh list in UI
      setApps(list =>
        list.map(a =>
          a.application_id === appId ? { ...a, status:newStatus } : a));
    } catch {
      alert('Update failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 p-6 sm:p-12 overflow-auto">
      <button onClick={onClose} className="text-gray-500 mb-4">← Back</button>
      <h2 className="text-2xl font-bold mb-6">Applications</h2>

      {busy && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!busy && !error && apps.length === 0 && (
        <p className="text-gray-500">No applications yet.</p>
      )}

      <ul className="space-y-6">
        {apps.map(app => (
          <li key={app.application_id} className="border p-4 rounded-lg">
            <p className="font-medium mb-1">
              Applicant&nbsp;#{app.applicant} –&nbsp;
              <span className="italic">{app.role_applied_for || 'no role'}</span>
            </p>
            <p className="mb-2 whitespace-pre-wrap">{app.message || '—'}</p>

            <div className="flex items-center gap-4 text-sm">
              <span className={`px-2 py-0.5 rounded-full
                     ${app.status==='PENDING'  && 'bg-yellow-100 text-yellow-800'}
                     ${app.status==='ACCEPTED' && 'bg-green-100  text-green-800'}
                     ${app.status==='REJECTED' && 'bg-red-100    text-red-800'}`}>
                {app.status}
              </span>

              {app.status === 'PENDING' && (
                <>
                  <button
                    onClick={()=> {
                      const role = prompt('Assign role for this user?','Co-author');
                      if (role !== null) updateStatus(app.application_id,'ACCEPTED',role);
                    }}
                    className="text-green-600 hover:underline"
                  >Accept</button>

                  <button
                    onClick={()=>updateStatus(app.application_id,'REJECTED')}
                    className="text-red-600 hover:underline"
                  >Reject</button>
                </>
              )}

              {app.cv && (
                <a href={app.cv} className="ml-auto text-blue-600 hover:underline"
                   target="_blank" rel="noopener noreferrer">
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
