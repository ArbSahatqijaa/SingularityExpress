/* src/components/paper/ResearchPaperCard.jsx */
import React, { useState, lazy, Suspense } from 'react';
import API from '../../../services/api';

const ApplyModal      = lazy(() => import('./PaperApplyModal'));
const ApplicantsModal = lazy(() => import('./PaperApplicantsModal'));

export default function ResearchPaperCard({
  /* -------- required props -------- */
  paper_id,
  title,
  description = '',
  role_details: roleDetails = '',
  accepting_applications: accepting,
  status,
  authors = [],                 // array of strings (names)
  file_path: pdfUrl,

  created_by,                   // creator’s user_id (number or string)
  my_role = '',                 // '' | 'AUTHOR' …  (from UserPaper)
  meId,                         // current user_id

  onUpdate,
  onDelete,
}) {
  /* ─────────── overlay toggles ─────────── */
  const [showDesc,       setShowDesc]       = useState(false);
  const [showRole,       setShowRole]       = useState(false);
  const [showEdit,       setShowEdit]       = useState(false);
  const [showApply,      setShowApply]      = useState(false);
  const [showApplicants, setShowApplicants] = useState(false);

  /* ─────────── editable copies (Edit overlay) ─────────── */
  const [titleEd,    setTitleEd]    = useState(title);
  const [descEd,     setDescEd]     = useState(description);
  const [roleEd,     setRoleEd]     = useState(roleDetails);
  const [statusEd,   setStatusEd]   = useState(status);
  const [acceptingEd,setAcceptingEd]= useState(accepting);

  /* ─────────── helpers ─────────── */
  const me        = Number(meId);
  const ownerId   = Number(created_by);
  const isAuthor  = my_role === 'AUTHOR';
  const isOwner   = isAuthor || (me && me === ownerId);

  const isLive    = status === 'ACTIVE';
  const badgeCls  = isLive ? 'bg-blue-100 text-blue-600'
                           : 'bg-gray-100 text-gray-600';
  const overlay   = 'fixed inset-0 bg-white z-50 p-6 sm:p-12 overflow-auto';

  /* ─────────── CRUD ─────────── */
  const handleDelete = async () => {
    if (!window.confirm('Delete this paper?')) return;
    try {
      await API.delete(`/papers/${paper_id}/`);
      onDelete?.(paper_id);
    } catch { alert('Delete failed'); }
  };

  const handleSave = async () => {
    const fd = new FormData();
    fd.append('title',        titleEd);
    fd.append('description',  descEd);
    fd.append('role_details', roleEd);
    fd.append('status',       statusEd);
    fd.set   ('accepting_applications', String(acceptingEd));
    try {
      const { data } = await API.patch(`/papers/${paper_id}/`, fd, {
        headers:{'Content-Type':'multipart/form-data'},
      });
      onUpdate?.(data);
      setShowEdit(false);
    } catch { alert('Update failed'); }
  };

  /* ─────────── JSX ─────────── */
  return (
    <>
      {/* CARD */}
      <div className="bg-white rounded-2xl shadow hover:shadow-lg transition flex flex-col max-w-sm border">
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>

          {authors.length > 0 && (
            <p className="text-xs text-gray-500">
              By&nbsp;
              <span className="font-medium">
                {authors.slice(0,2).join(', ')}
                {authors.length > 2 && ' …'}
              </span>
            </p>
          )}

          <p className="text-sm text-gray-600 line-clamp-2 my-2 flex-grow">
            {description || '—'}
          </p>

          {/* quick links */}
          <div className="flex flex-wrap gap-3 text-sm mb-3">
            {description && (
              <button className="text-blue-600 hover:underline"
                      onClick={()=>setShowDesc(true)}>
                View Full Description →
              </button>
            )}
            {roleDetails && (
              <button className="text-blue-600 hover:underline"
                      onClick={()=>setShowRole(true)}>
                View Role Details →
              </button>
            )}
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
               className="text-indigo-600 hover:underline">
              View PDF →
            </a>
          </div>

          {/* footer */}
          <div className="mt-auto pt-3 border-t flex items-center justify-between gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeCls}`}>
              {isLive ? 'Active' : 'Completed'}
            </span>

            <div className="flex items-center gap-3 text-xs font-medium">
              {/* Apply only for outsiders, while paper is live & accepting */}
              {!isOwner && accepting && isLive && (
                <button className="text-indigo-600 hover:underline"
                        onClick={()=>setShowApply(true)}>
                  Apply
                </button>
              )}

              {/* Applicants visible to authors / creator */}
              {isOwner && (
                <button className="text-indigo-600 hover:underline"
                        onClick={()=>setShowApplicants(true)}>
                  Applicants
                </button>
              )}

              {/* Edit / Delete for authors / creator */}
              {isOwner && (
                <>
                  <button className="text-blue-600 hover:underline"
                          onClick={()=>setShowEdit(true)}>
                    Edit
                  </button>
                  <button className="text-red-600 hover:underline"
                          onClick={handleDelete}>
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description overlay */}
      {showDesc && (
        <div className={overlay}>
          <button onClick={()=>setShowDesc(false)}
                  className="text-gray-500 mb-4">← Back</button>
          <h2 className="text-2xl font-bold mb-4">Description</h2>
          <p className="whitespace-pre-wrap">{description}</p>
        </div>
      )}

      {/* Role overlay */}
      {showRole && (
        <div className={overlay}>
          <button onClick={()=>setShowRole(false)}
                  className="text-gray-500 mb-4">← Back</button>
          <h2 className="text-2xl font-bold mb-4">Role Details</h2>
          <p className="whitespace-pre-wrap">{roleDetails}</p>
        </div>
      )}

      {/* Edit overlay */}
      {showEdit && (
        <div className={overlay}>
          <button onClick={()=>setShowEdit(false)}
                  className="text-gray-500 mb-4">← Back</button>
          <h2 className="text-2xl font-bold mb-4">Edit Paper</h2>

          <div className="space-y-4">
            <input className="w-full border p-2 rounded"
                   value={titleEd}
                   onChange={(e)=>setTitleEd(e.target.value)} />

            <textarea className="w-full border p-2 rounded" rows={3}
                      value={descEd}
                      onChange={(e)=>setDescEd(e.target.value)} />

            <textarea className="w-full border p-2 rounded" rows={3}
                      value={roleEd}
                      onChange={(e)=>setRoleEd(e.target.value)}
                      disabled={!acceptingEd}
                      placeholder="Role Details" />

            <select className="w-full border p-2 rounded"
                    value={statusEd}
                    onChange={(e)=>setStatusEd(e.target.value)}>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <select className="w-full border p-2 rounded"
                    value={String(acceptingEd)}
                    onChange={(e)=>setAcceptingEd(e.target.value==='true')}
                    disabled={statusEd==='COMPLETED'}>
              <option value="true">Accepting applicants</option>
              <option value="false">Closed</option>
            </select>

            <button className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      )}

      {/* Apply modal */}
      {showApply && (
        <Suspense fallback={null}>
          <ApplyModal
            paperId={paper_id}
            onClose={()=>setShowApply(false)}
            onSuccess={()=>alert('Application sent!')}
          />
        </Suspense>
      )}

      {/* Applicants modal */}
      {showApplicants && (
        <Suspense fallback={null}>
          <ApplicantsModal
            paperId={paper_id}
            onClose={()=>setShowApplicants(false)}
          />
        </Suspense>
      )}
    </>
  );
}
