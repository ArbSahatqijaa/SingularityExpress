import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { FaUser, FaUserEdit, FaTrashAlt } from "react-icons/fa";

export default function ProjectMembersModal({ projectId, isOwner, onClose }) {
  const [members, setMembers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setBusy(true);
    API.get("/user_projects/", { params: { project: projectId } })
      .then(({ data }) => setMembers(data))
      .catch(() => setError("Failed to load members"))
      .finally(() => setBusy(false));
  }, [projectId]);

  const patchMember = async (rowId, payload) => {
    try {
      await API.patch(`/user_projects/${rowId}/`, payload);
      setMembers(list =>
        list.map(m => (m.id === rowId ? { ...m, ...payload } : m))
      );
    } catch {
      alert("Update failed");
    }
  };

  const removeMember = async rowId => {
    if (!window.confirm("Remove this member from the project?")) return;
    try {
      await API.delete(`/user_projects/${rowId}/`);
      setMembers(list => list.filter(m => m.id !== rowId));
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 p-6 sm:p-10 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onClose}
          className="text-sm text-gray-500 mb-6 hover:underline"
        >
          ← Back to project
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Project Members
        </h2>

        {busy && <p className="text-gray-600 mb-4">Loading members…</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {!busy && !error && members.length === 0 && (
          <p className="text-gray-500 mb-4">No members yet.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {members.map(m => (
            <div
              key={m.id}
              className="bg-white border rounded-xl shadow-sm p-5 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="bg-gray-100 p-3 rounded-full">
                  <FaUser className="text-gray-500 w-5 h-5" />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {m.user.full_name || m.user.username || `User #${m.user.user_id}`}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Role: <span className="text-gray-800 font-medium">{m.role}</span>
                  </p>

                  {isOwner && (
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => {
                          const newRole = prompt("New role:", m.role);
                          if (newRole?.trim())
                            patchMember(m.id, { role: newRole.trim() });
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
                      >
                        <FaUserEdit className="w-4 h-4" />
                        Change Role
                      </button>

                      <button
                        onClick={() => removeMember(m.id)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                      >
                        <FaTrashAlt className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
