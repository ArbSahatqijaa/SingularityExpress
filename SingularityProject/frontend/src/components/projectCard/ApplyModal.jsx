// src/components/projectCard/ApplyModal.jsx
import React, { useState } from 'react';
import API from '../../services/api';
import { Paperclip, Loader2 } from 'lucide-react';

export default function ApplyModal({ projectId, onClose, onSuccess }) {
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [cv, setCv] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role.trim()) return alert('Please specify your desired role.');

    setBusy(true);
    const fd = new FormData();
    fd.append('project', projectId);
    fd.append('role_applied_for', role);
    fd.append('message', message);
    if (cv) fd.append('cv', cv);

    try {
      await API.post('/applications/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess?.();
      onClose();
    } catch {
      alert('Application failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 p-6 sm:p-12 overflow-auto flex justify-center items-start sm:items-center">
      <div className="bg-white shadow-xl rounded-2xl max-w-xl w-full p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Apply to Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">✕ Close</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role you're applying for</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Frontend Developer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message to the project leader</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Optional message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Attach CV (PDF or DOCX)</label>
            <div className="relative border border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition">
              <label className="flex items-center gap-2 text-blue-600 cursor-pointer">
                <Paperclip className="w-5 h-5" />
                {cv ? <span className="truncate">{cv.name}</span> : <span>Click to upload</span>}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setCv(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={busy}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-60"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {busy ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
