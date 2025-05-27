// src/components/projectCard/ProjectCard.jsx
import React, { useState } from 'react';
import API from '../../services/api';

export default function ProjectCard({
  /* -------- props from Home.jsx -------- */
  title,
  description,
  role_details: roleDetails,
  accepting_applications: accepting,
  status,
  image,
  leaderName: leader,          // just a label for the UI

  project_id,                  // numeric
  leaderId,                    // numeric user_id
  createdById,                 // numeric user_id
  meId,                        // numeric user_id

  onUpdate,                    // callback to Home.jsx
  onDelete,
}) {
  /* ---------- viewer state ---------- */
  const [showDesc, setShowDesc] = useState(false);
  const [showRole, setShowRole] = useState(false);

  /* ---------- edit modal state ---------- */
  const [showEdit,   setShowEdit]   = useState(false);
  const [titleEd,    setTitleEd]    = useState(title);
  const [descEd,     setDescEd]     = useState(description);
  const [roleEd,     setRoleEd]     = useState(roleDetails);
  const [statusEd,   setStatusEd]   = useState(status);
  const [acceptingEd,setAcceptingEd]= useState(accepting);

  /* ---------- helpers ---------- */
  const isOwner  = meId && (meId === leaderId || meId === createdById);
  const isActive = status === 'ACTIVE';

  const badgeCls = isActive
    ? 'bg-blue-100 text-blue-600'
    : 'bg-gray-100 text-gray-600';

  const overlay  = 'fixed inset-0 bg-white z-50 p-6 sm:p-12 overflow-auto';

  /* ---------- handlers ---------- */
  const handleDelete = async () => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await API.delete(`/projects/${project_id}/`);     // <— back-ticks
      onDelete(project_id);                            // remove from list
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleSave = async () => {
    const fd = new FormData();
    fd.append('title', titleEd);
    fd.append('description', descEd);
    fd.append('role_details', roleEd);
    fd.append('status', statusEd);
    fd.append('accepting_applications', acceptingEd);

    try {
      const { data } = await API.patch(
        `/projects/${project_id}/`,                    // <— back-ticks
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      onUpdate(data);          // replace card in Home.jsx
      setShowEdit(false);      // close modal
    } catch (err) {
      alert('Update failed');
    }
  };

  /* ---------- JSX ---------- */
  return (
    <>
      {/* -------- CARD -------- */}
      <div className="bg-white h-80 rounded-2xl shadow hover:shadow-lg transition overflow-hidden flex flex-col max-w-sm">
        {image && <img src={image} alt={title} className="h-40 w-full object-cover" />}

        <div className="p-5 space-y-2 flex flex-col flex-1">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>

          {leader && (
            <p className="text-xs text-gray-500">
              Led by <span className="font-medium">{leader}</span>
            </p>
          )}

          <p className="text-sm text-gray-600 line-clamp-2 flex-1">
            {description}
          </p>

          <div className="flex flex-wrap gap-3 text-sm">
            <button onClick={() => setShowDesc(true)} className="text-blue-600 hover:underline">
              View Full Description →
            </button>
            {accepting && (
              <button onClick={() => setShowRole(true)} className="text-blue-600 hover:underline">
                View Role Details →
              </button>
            )}
          </div>

          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${badgeCls}`}>
            {isActive ? 'Active' : 'Completed'}
          </span>

          {/* owner-only actions */}
          {isOwner && (
            <div className="flex gap-2 mt-2">
              <button onClick={() => setShowEdit(true)} className="text-xs text-blue-600 hover:underline">
                Edit
              </button>
              <button onClick={handleDelete} className="text-xs text-red-600 hover:underline">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* -------- DESCRIPTION OVERLAY -------- */}
      {showDesc && (
        <div className={overlay}>
          <button onClick={() => setShowDesc(false)} className="text-gray-500 hover:text-gray-800 mb-4">
            ← Back
          </button>
          <h2 className="text-2xl font-bold mb-4">Description</h2>
          <p className="whitespace-pre-wrap">{description}</p>
        </div>
      )}

      {/* -------- ROLE OVERLAY -------- */}
      {showRole && (
        <div className={overlay}>
          <button onClick={() => setShowRole(false)} className="text-gray-500 hover:text-gray-800 mb-4">
            ← Back
          </button>
          <h2 className="text-2xl font-bold mb-4">Role Details</h2>
          <p className="whitespace-pre-wrap">
            {roleDetails || 'No details provided.'}
          </p>
        </div>
      )}

      {/* -------- EDIT OVERLAY -------- */}
      {showEdit && (
        <div className={overlay}>
          <button onClick={() => setShowEdit(false)} className="text-gray-500 hover:text-gray-800 mb-4">
            ← Back
          </button>
          <h2 className="text-2xl font-bold mb-4">Edit Project</h2>

          <div className="space-y-4">
            <input
              className="w-full border px-3 py-2 rounded"
              value={titleEd}
              onChange={(e) => setTitleEd(e.target.value)}
            />
            <textarea
              className="w-full border px-3 py-2 rounded"
              rows={3}
              value={descEd}
              onChange={(e) => setDescEd(e.target.value)}
            />
            <textarea
              className="w-full border px-3 py-2 rounded"
              rows={3}
              value={roleEd}
              onChange={(e) => setRoleEd(e.target.value)}
              disabled={!acceptingEd}
              placeholder="Role Details"
            />
            <select
              className="w-full border px-3 py-2 rounded"
              value={statusEd}
              onChange={(e) => setStatusEd(e.target.value)}
            >
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <select
              className="w-full border px-3 py-2 rounded"
              value={String(acceptingEd)}
              onChange={(e) => setAcceptingEd(e.target.value === 'true')}
              disabled={statusEd === 'COMPLETED'}
            >
              <option value="true">Accepting applicants</option>
              <option value="false">Closed</option>
            </select>

            <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded">
              Save
            </button>
          </div>
        </div>
      )}
    </>
  );
}
