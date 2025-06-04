/* src/components/projectCard/ProjectCard.jsx */
import React, { useState, lazy, Suspense } from 'react';
import API from '../../services/api';

/* lazy-load the heavy modals so normal cards stay lightweight */
const ApplyModal      = lazy(() => import('./ApplyModal'));
const ApplicantsModal = lazy(() => import('./ApplicantsModal'));
const MembersModal = lazy(() => import('./ProjectMembersModal'))
export default function ProjectCard({
  /* -------- data props from Home.jsx -------- */
  title,
  description,
  role_details: roleDetails,
  accepting_applications: accepting,
  status,
  image,
  leaderName,

  project_id,
  leaderId,
  createdById,
  meId,
  fileUrl,                 /* <-- correct prop name */
  myRole = '',

  onUpdate,
  onDelete,
}) {
  /* ───────────── local state ───────────── */
  const [showDesc,       setShowDesc]       = useState(false);
  const [showRole,       setShowRole]       = useState(false);
  const [showEdit,       setShowEdit]       = useState(false);
  const [showApply,      setShowApply]      = useState(false);
  const [showApplicants, setShowApplicants] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  /* editable copies (Edit modal) */
  const [titleEd,    setTitleEd]    = useState(title);
  const [descEd,     setDescEd]     = useState(description);
  const [roleEd,     setRoleEd]     = useState(roleDetails);
  const [statusEd,   setStatusEd]   = useState(status);
  const [acceptingEd,setAcceptingEd]= useState(accepting);

  /* ───────────── helpers ───────────── */
  const me        = Number(meId);
  const isOwner   = !!me && (me === Number(leaderId) || me === Number(createdById));
  const isActive  = status === 'ACTIVE';
  const isMember = isOwner || !!myRole;

  const badgeCls  = isActive
      ? 'bg-blue-100 text-blue-600'
      : 'bg-gray-100 text-gray-600';

  const overlay = 'fixed inset-0 bg-white z-[999] p-6 sm:p-12 overflow-auto';

  /* ───────────── CRUD handlers ───────────── */
  const handleDelete = async () => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await API.delete(`/projects/${project_id}/`);
      onDelete(project_id);
    } catch {
      alert('Delete failed');
    }
  };

  const handleSave = async () => {
    const fd = new FormData();
    fd.append('title', titleEd);
    fd.append('description', descEd);
    fd.append('role_details', roleEd);
    fd.append('status', statusEd);
    fd.set('accepting_applications', String(acceptingEd));

    try {
      const { data } = await API.patch(`/projects/${project_id}/`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUpdate(data);
      setShowEdit(false);
    } catch {
      alert('Update failed');
    }
  };

  /* ───────────── JSX ───────────── */
  return (
    <>
      {/* CARD */}
      <div className="bg-white min-h-80 rounded-2xl shadow hover:shadow-lg transition flex flex-col max-w-sm overflow-visible">
        {image && (
          <img src={image} alt={title} className="h-40 w-full object-cover" />
        )}

        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          {leaderName && (
            <p className="text-xs text-gray-500">
              Led by <span className="font-medium">{leaderName}</span>
            </p>
          )}

          <p className="text-sm text-gray-600 line-clamp-2 my-2 flex-grow">
            {description}
          </p>

          {/* quick links */}
          <div className="flex flex-wrap gap-3 text-sm mb-3">
            <button
              onClick={() => setShowDesc(true)}
              className="text-blue-600 hover:underline"
            >
              View Full Description →
            </button>
            {accepting && (
              <button
                onClick={() => setShowRole(true)}
                className="text-blue-600 hover:underline"
              >
                View Role Details →
              </button>
            )}

            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                View Project File →
              </a>
            )}
          </div>

          {/* footer */}
          <div className="mt-auto pt-3 border-t flex items-center justify-between gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeCls}`}
            >
              {isActive ? 'Active' : 'Completed'}
            </span>

            <div className="flex items-center gap-3 text-xs font-medium">
              
              {isMember && (
                <button onClick={() => setShowMembers(true)}
                className='text-indigo-600 hover:underline'
              >
                Members
              </button>)
              }
              
              
              {!isOwner && accepting && !isMember && (
                <button
                  onClick={() => setShowApply(true)}
                  className="text-indigo-600 hover:underline"
                >
                  Apply
                </button>
              )}

              {isOwner && accepting && (
                <button
                  onClick={() => setShowApplicants(true)}
                  className="text-indigo-600 hover:underline"
                >
                  Applicants
                </button>
              )}

              {isOwner && (
                <>
                  <button
                    onClick={() => setShowEdit(true)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>

                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DESCRIPTION overlay */}
      {showDesc && (
        <div className={overlay}>
          <button
            onClick={() => setShowDesc(false)}
            className="text-gray-500 mb-4"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold mb-4">Description</h2>
          <p className="whitespace-pre-wrap">{description}</p>
        </div>
      )}

      {/* ROLE overlay */}
      {showRole && (
        <div className={overlay}>
          <button
            onClick={() => setShowRole(false)}
            className="text-gray-500 mb-4"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold mb-4">Role Details</h2>
          <p className="whitespace-pre-wrap">
            {roleDetails || 'No details provided.'}
          </p>
        </div>
      )}

      {/* EDIT overlay */}
      {showEdit && (
        <div className={overlay}>
          <button
            onClick={() => setShowEdit(false)}
            className="text-gray-500 mb-4"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold mb-4">Edit Project</h2>

          <div className="space-y-4">
            <input
              className="w-full border p-2 rounded"
              value={titleEd}
              onChange={(e) => setTitleEd(e.target.value)}
            />

            <textarea
              className="w-full border p-2 rounded"
              rows={3}
              value={descEd}
              onChange={(e) => setDescEd(e.target.value)}
            />

            <textarea
              className="w-full border p-2 rounded"
              rows={3}
              value={roleEd}
              onChange={(e) => setRoleEd(e.target.value)}
              disabled={!acceptingEd}
              placeholder="Role Details"
            />

            <select
              className="w-full border p-2 rounded"
              value={statusEd}
              onChange={(e) => setStatusEd(e.target.value)}
            >
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <select
              className="w-full border p-2 rounded"
              value={String(acceptingEd)}
              onChange={(e) => setAcceptingEd(e.target.value === 'true')}
              disabled={statusEd === 'COMPLETED'}
            >
              <option value="true">Accepting applicants</option>
              <option value="false">Closed</option>
            </select>

            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* APPLY modal */}
      {showApply && (
        <Suspense fallback={null}>
          <ApplyModal
            projectId={project_id}
            onClose={() => setShowApply(false)}
            onSuccess={() => alert('Application sent!')}
          />
        </Suspense>
      )}

      {/* APPLICANTS modal */}
      {showApplicants && (
        <Suspense fallback={null}>
          <ApplicantsModal
            projectId={project_id}
            onClose={() => setShowApplicants(false)}
          />
        </Suspense>
      )}
      {/* MEMBERS modal */}
      {showMembers && (
        <Suspense fallback={null}>
          <MembersModal
            projectId={project_id}
            isOwner={isOwner}          /* leader can edit / remove */
            onClose={() => setShowMembers(false)}
          />
        </Suspense>
      )}

    </>
  );
}
