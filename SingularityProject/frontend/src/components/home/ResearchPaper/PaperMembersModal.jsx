import React, { useEffect, useState } from "react";
import API from "../../../services/api";
import { ArrowLeft, User, Edit2, Trash2 } from "lucide-react";

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
    if (!window.confirm('Remove this user from the paper?')) return;
    try {
      await API.delete(`/user_papers/${rowId}/`);
      setMembers(list => list.filter(m => m.id !== rowId));
    } catch {
      alert('Delete failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white p-6 sm:p-10 overflow-y-auto shadow-xl rounded-lg">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onClose}
          className="text-gray-500 mb-6 flex items-center gap-2 hover:text-black transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h2 className="text-3xl font-semibold text-gray-800 mb-8">Paper Members</h2>

        {busy && <p>Loading…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!busy && !error && members.length === 0 && (
          <p className="text-gray-500">No members have joined this paper yet.</p>
        )}

        <ul className="space-y-6">
          {members.map((m) => (
            <li
              key={m.id}
              className="border p-5 rounded-xl bg-gray-50 shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
            >
              <div>
                <div className="flex items-center gap-2 text-lg font-medium text-gray-800">
                  <User className="w-5 h-5 text-blue-600" />
                  {m.user.full_name || m.user.username || `User #${m.user.user_id}`}
                </div>
                <p className="text-sm text-gray-600 mt-1">Role: <span className="font-medium">{m.role}</span></p>
              </div>

              {isOwner && (
                <div className="flex items-center gap-4 text-sm mt-1 sm:mt-0">
                  <button
                    onClick={() => {
                      const newRole = prompt('New role:', m.role);
                      if (newRole && newRole.trim()) patchMember(m.id, { role: newRole.trim() });
                    }}
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <Edit2 className="w-4 h-4" /> Change Role
                  </button>

                  <button
                    onClick={() => removeMember(m.id)}
                    className="flex items-center gap-1 text-red-600 hover:underline"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
