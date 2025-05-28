// src/components/projectCard/ApplyModal.jsx
import React, { useState } from 'react';
import API             from '../../services/api';

export default function ApplyModal({ projectId, onClose, onSuccess }) {
  const [role,    setRole]    = useState('');
  const [message, setMessage] = useState('');
  const [cv,      setCv]      = useState(null);
  const [busy,    setBusy]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role.trim()) return alert('Tell the leader what role you want!');
    setBusy(true);

    const fd = new FormData();
    fd.append('project', projectId);          // FK
    fd.append('role_applied_for', role);
    fd.append('message', message);
    if (cv) fd.append('cv', cv);

    try {
      await API.post('/applications/', fd, {
        headers:{'Content-Type':'multipart/form-data'}
      });
      onSuccess?.();          // parent can refetch if it wants
      onClose();
    } catch (err) {
      alert('Application failed - please try again');
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 p-6 sm:p-12 overflow-auto">
      <button onClick={onClose} className="text-gray-500 mb-4">← Back</button>
      <h2 className="text-2xl font-bold mb-6">Apply to project</h2>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <input
          className="w-full border p-2 rounded"
          placeholder="Role you’re interested in"
          value={role}
          onChange={(e)=>setRole(e.target.value)}
        />

        <textarea
          className="w-full border p-2 rounded"
          rows={4}
          placeholder="Optional message to the leader"
          value={message}
          onChange={(e)=>setMessage(e.target.value)}
        />

        <label className="block text-sm">
          <span className="mr-2">Attach CV (pdf / docx)</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e)=>setCv(e.target.files[0])}
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {busy ? 'Submitting…' : 'Submit application'}
        </button>
      </form>
    </div>
  );
}
