import React, { useEffect, useState } from "react";
import API from "../../../services/api";

export default function PaperMembersModal({ paperId, isOwner, onClose }) {
  const [members, setMembers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setBusy(true);
    API.get('/user_papers/', { params: { paper: paperId } })
      .then(({ data }) => setMembers(data))
      .catch(() => setError('Could not load members'))
      .finally(() => setBusy(false));
  }, [paperId]);

  const patchMember = async (rowId, payload) => {
    try {
      await API.patch(`/user_papers/${rowId}/`, payload);
      setMembers(list =>
        list.map(m => m.id === rowId ? { ...m, ...payload } : m)
      );
    } catch {
      alert('Update failed');
    }
  };

  const removeMember = async (rowId) => {
    if (!window.confirm('Remove this user from paper?')) return;
    try {
      await API.delete(`/user_papers/${rowId}/`);
      setMembers(list => list.filter(m => m.id !== rowId));
    } catch {
      alert('Delete failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 p-6 sm:p-12 overflow-auto">
      <button onClick={onClose} className="text-gray-500 mb-4">← Back</button>
      <h2 className="text-2xl font-bold mb-6">Paper Members</h2>

      {busy && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!busy && !error && members.length === 0 && (
        <p className="text-gray-500">No members yet.</p>
      )}

      <ul className="space-y-4">
        {members.map(m => (
          <li key={m.id} className="border p-4 rounded-lg flex flex-col gap-1">
            <span className="font-medium">
              {m.user.full_name || m.user.username || `User #${m.user.user_id}`}
            </span>

            <span className="text-sm text-gray-600">Role: {m.role}</span>

            {isOwner && (
              <div className="flex gap-4 text-sm mt-2">
                <button
                  onClick={() => {
                    const newRole = prompt('New role:', m.role);
                    if (newRole && newRole.trim()) patchMember(m.id, { role: newRole.trim() });
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Change role
                </button>

                <button
                  onClick={() => removeMember(m.id)}
                  className="text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
