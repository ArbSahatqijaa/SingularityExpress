  /* src/components/paper/ResearchPaperCard.jsx */
  import React, { useState, lazy, Suspense } from 'react';
  import API from '../../../services/api';
  import { FaEye, FaClipboardList, FaFilePdf, FaCommentAlt, FaUserPlus, FaUsers, FaEdit, FaTrashAlt, FaHeart, FaSave } from 'react-icons/fa';

  const ApplyModal = lazy(() => import('./PaperApplyModal'));
  const ApplicantsModal = lazy(() => import('./PaperApplicantsModal'));
  const MembersModal = lazy(() => import('./PaperMembersModal'));
  const PaperReviewModal = lazy(() => import('./PaperReviewModal'));

  export default function ResearchPaperCard({
    paper_id,
    title,
    description = '',
    role_details: roleDetails = '',
    accepting_applications: accepting,
    status,
    authors = [],
    file_path: pdfUrl,
    visibility,  
    created_by,
    my_role = '',
    meId,
    onUpdate,
    onDelete,
  }) {
    const [showDesc, setShowDesc] = useState(false);
    const [showRole, setShowRole] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showApply, setShowApply] = useState(false);
    const [showReviews, setShowReviews] = useState(false);
    const [showApplicants, setShowApplicants] = useState(false);
    const [showMembers, setShowMembers] = useState(false);

    const [titleEd, setTitleEd] = useState(title);
    const [descEd, setDescEd] = useState(description);
    const [roleEd, setRoleEd] = useState(roleDetails);
    const [statusEd, setStatusEd] = useState(status);
    const [acceptingEd, setAcceptingEd] = useState(accepting);

    const me = Number(meId);
    const ownerId = Number(created_by);
    const isAuthor = my_role === 'AUTHOR';
    const isOwner = isAuthor || (me && me === ownerId);
    const isMember = isOwner || !!my_role;
    const isLive = status === 'ACTIVE';

    const badgeCls = isLive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600';
    const overlay = 'fixed inset-0 bg-white z-[999] p-6 sm:p-12 overflow-auto';

    const handleDelete = async () => {
      if (!window.confirm('Delete this paper?')) return;
      try {
        await API.delete(`/papers/${paper_id}/`);
        onDelete?.(paper_id);
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
        const { data } = await API.patch(`/papers/${paper_id}/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        onUpdate?.(data);
        setShowEdit(false);
      } catch {
        alert('Update failed');
      }
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 mb-6 max-w-5xl mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
              {authors.length > 0 && (
                <p className="text-sm text-gray-600">
                  By <span className="font-medium text-gray-800">{authors.slice(0, 2).join(', ')}{authors.length > 2 && ' …'}</span>
                </p>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeCls}`}>{isLive ? 'Active' : 'Completed'}</span>
          </div>

          <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">{description || '—'}</p>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 text-sm mt-4">
            {description && (
              <button onClick={() => setShowDesc(true)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
                <FaEye /> Full Description
              </button>
            )}
            {roleDetails && (
              <button onClick={() => setShowRole(true)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
                <FaClipboardList /> Role Details
              </button>
            )}
           {pdfUrl && (
  (visibility?.toUpperCase() === 'PUBLIC' ||
   (visibility?.toUpperCase() === 'PRIVATE' && (isMember || isOwner))) && (
    <a
      href={pdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
    >
      <FaFilePdf /> View PDF
    </a>
  )
)}

            <button onClick={() => setShowReviews(true)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
              <FaCommentAlt /> Reviews
            </button>
          </div>

          <div className="flex flex-wrap justify-between items-center mt-4 gap-4">
            <div className="flex gap-2 text-sm">
              {!isOwner && accepting && isLive && !isMember && (
                <button onClick={() => setShowApply(true)} className="flex items-center gap-2 px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white">
                  <FaUserPlus /> Apply
                </button>
              )}
              {isOwner && (
                <>
                  <button onClick={() => setShowApplicants(true)} className="flex items-center gap-2 px-4 py-1 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-700">
                    <FaFilePdf /> Applicants
                  </button>
                  <button onClick={() => setShowMembers(true)} className="flex items-center gap-2 px-4 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-800">
                    <FaUsers /> Members
                  </button>
                  <button onClick={() => setShowEdit(true)} className="flex items-center gap-2 px-4 py-1 rounded bg-yellow-100 hover:bg-yellow-200 text-yellow-700">
                    <FaEdit /> Edit
                  </button>
                  <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700">
                    <FaTrashAlt /> Delete
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-4 text-gray-600 text-sm">
              <button className="flex items-center gap-1 hover:text-gray-800"><FaSave /> Save</button>
              <button className="flex items-center gap-1 hover:text-red-500"><FaHeart /> Like</button>
              <button className="flex items-center gap-1 hover:text-gray-800"><FaCommentAlt /> Comment</button>
            </div>
          </div>
        </div>

        {showDesc && <div className={overlay}><button onClick={() => setShowDesc(false)} className="text-gray-500 mb-4">← Back</button><h2 className="text-3xl font-bold mb-4 text-gray-800">Paper Description</h2><p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{description}</p></div>}

        {showRole && <div className={overlay}><button onClick={() => setShowRole(false)} className="text-gray-500 mb-4">← Back</button><h2 className="text-3xl font-bold mb-4 text-gray-800">Role Details</h2><p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{roleDetails}</p></div>}

        {showEdit && <div className={overlay}><button onClick={() => setShowEdit(false)} className="text-gray-500 mb-4">← Back</button><h2 className="text-2xl font-bold mb-4">Edit Paper</h2><div className="space-y-4"><input className="w-full border p-3 rounded" value={titleEd} onChange={(e) => setTitleEd(e.target.value)} /><textarea className="w-full border p-3 rounded" rows={4} value={descEd} onChange={(e) => setDescEd(e.target.value)} /><textarea className="w-full border p-3 rounded" rows={4} value={roleEd} onChange={(e) => setRoleEd(e.target.value)} disabled={!acceptingEd} placeholder="Role Details" /><select className="w-full border p-3 rounded" value={statusEd} onChange={(e) => setStatusEd(e.target.value)}><option value="ACTIVE">Active</option><option value="COMPLETED">Completed</option></select><select className="w-full border p-3 rounded" value={String(acceptingEd)} onChange={(e) => setAcceptingEd(e.target.value === 'true')} disabled={statusEd === 'COMPLETED'}><option value="true">Accepting applicants</option><option value="false">Closed</option></select><button onClick={handleSave} className="bg-blue-600 text-white px-5 py-3 rounded font-medium">Save</button></div></div>}

        {showApply && <Suspense fallback={null}><ApplyModal paperId={paper_id} onClose={() => setShowApply(false)} onSuccess={() => alert('Application sent!')} /></Suspense>}
        {showApplicants && <Suspense fallback={null}><ApplicantsModal paperId={paper_id} onClose={() => setShowApplicants(false)} /></Suspense>}
        {showMembers && <Suspense fallback={null}><MembersModal paperId={paper_id} isOwner={isOwner} onClose={() => setShowMembers(false)} /></Suspense>}
        {showReviews && <Suspense fallback={null}><PaperReviewModal paperId={paper_id} onClose={() => setShowReviews(false)} /></Suspense>}
      </div>
    );
  }