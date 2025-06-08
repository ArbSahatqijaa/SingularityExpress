/* src/components/projectCard/ProjectCard.jsx */
import React, { useState, lazy, Suspense } from 'react';
import API from '../../services/api';
import { FaHeart, FaCommentAlt, FaSave, FaUsers, FaEdit, FaTrashAlt, FaFileAlt, FaUserPlus, FaEye, FaClipboardList } from 'react-icons/fa';

const ApplyModal = lazy(() => import('./ApplyModal'));
const ReviewModal = lazy(() => import('./ReviewModal'));
const ApplicantsModal = lazy(() => import('./ApplicantsModal'));
const MembersModal = lazy(() => import('./ProjectMembersModal'));

export default function ProjectCard({
  title,
  description,
  role_details: roleDetails,
  accepting_applications: accepting,
  status,
  visibility,
  image,
  leaderName,
  project_id,
  leaderId,
  createdById,
  meId,
  fileUrl,
  myRole = '',
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
  const isOwner = !!me && (me === Number(leaderId) || me === Number(createdById));
  const isActive = status === 'ACTIVE';
  const isMember = isOwner || !!myRole;

  const badgeCls = isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600';
  const overlay = 'fixed inset-0 bg-white z-[999] p-6 sm:p-12 overflow-auto';

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

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 mb-6 max-w-5xl mx-auto">
        <div className="flex flex-col gap-4">
          {image && (
            <img src={image} alt={title} className="w-full h-64 object-cover rounded-md" />
          )}

          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
              {leaderName && (
                <p className="text-sm text-gray-600">Led by <span className="font-medium text-gray-800">{leaderName}</span></p>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeCls}`}>{isActive ? 'Active' : 'Completed'}</span>
          </div>

          <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">{description}</p>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 text-sm mt-4">
            <button onClick={() => setShowDesc(true)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition font-medium">
              <FaEye className="text-base" /> Full Description
            </button>
            {accepting && (
              <button onClick={() => setShowRole(true)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition font-medium">
                <FaClipboardList className="text-base" /> Role Details
              </button>
            )}
            {fileUrl && (
              (visibility?.toUpperCase() === 'PUBLIC' ||
               (visibility?.toUpperCase() === 'PRIVATE' && (isMember || isOwner))) && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <FaFileAlt/>View PDF
                </a>
              )
            )}
            <button onClick={() => setShowReviews(true)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition font-medium">
              <FaCommentAlt className="text-base" /> Reviews
            </button>
          </div>

          <div className="flex flex-wrap justify-between items-center mt-4 gap-4">
            <div className="flex gap-2 text-sm">
              {isMember && <button onClick={() => setShowMembers(true)} className="flex items-center gap-2 px-4 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-800"><FaUsers /> Team</button>}
              {!isOwner && accepting && !isMember && <button onClick={() => setShowApply(true)} className="flex items-center gap-2 px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"><FaUserPlus /> Join</button>}
              {isOwner && accepting && <button onClick={() => setShowApplicants(true)} className="flex items-center gap-2 px-4 py-1 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-700"><FaFileAlt /> Applicants</button>}
              {isOwner && (
                <>
                  <button onClick={() => setShowEdit(true)} className="flex items-center gap-2 px-4 py-1 rounded bg-yellow-100 hover:bg-yellow-200 text-yellow-700"><FaEdit /> Edit</button>
                  <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700"><FaTrashAlt /> Delete</button>
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
      </div>

      {showDesc && (
        <div className={overlay}>
          <button onClick={() => setShowDesc(false)} className="text-gray-500 mb-4">← Back</button>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Project Description</h2>
          <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{description}</p>
        </div>
      )}

      {showRole && (
        <div className={overlay}>
          <button onClick={() => setShowRole(false)} className="text-gray-500 mb-4">← Back</button>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Team Role Details</h2>
          <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{roleDetails || 'No details provided.'}</p>
        </div>
      )}

      {showEdit && (
        <div className={overlay}>
          <button onClick={() => setShowEdit(false)} className="text-gray-500 mb-4">← Back</button>
          <h2 className="text-2xl font-bold mb-4">Edit Project</h2>
          <div className="space-y-4">
            <input className="w-full border p-3 rounded" value={titleEd} onChange={(e) => setTitleEd(e.target.value)} />
            <textarea className="w-full border p-3 rounded" rows={4} value={descEd} onChange={(e) => setDescEd(e.target.value)} />
            <textarea className="w-full border p-3 rounded" rows={4} value={roleEd} onChange={(e) => setRoleEd(e.target.value)} disabled={!acceptingEd} placeholder="Role Details" />
            <select className="w-full border p-3 rounded" value={statusEd} onChange={(e) => setStatusEd(e.target.value)}>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <select className="w-full border p-3 rounded" value={String(acceptingEd)} onChange={(e) => setAcceptingEd(e.target.value === 'true')} disabled={statusEd === 'COMPLETED'}>
              <option value="true">Accepting applicants</option>
              <option value="false">Closed</option>
            </select>
            <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded font-semibold">Save</button>
          </div>
        </div>
      )}

      {showApply && <Suspense fallback={null}><ApplyModal projectId={project_id} onClose={() => setShowApply(false)} onSuccess={() => alert('Application sent!')} /></Suspense>}
      {showApplicants && <Suspense fallback={null}><ApplicantsModal projectId={project_id} onClose={() => setShowApplicants(false)} /></Suspense>}
      {showMembers && <Suspense fallback={null}><MembersModal projectId={project_id} isOwner={isOwner} onClose={() => setShowMembers(false)} /></Suspense>}
      {showReviews && <Suspense fallback={null}><ReviewModal projectId={project_id} onClose={() => setShowReviews(false)} /></Suspense>}
    </>
  );
}
