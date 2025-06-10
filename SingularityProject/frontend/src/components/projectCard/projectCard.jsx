/* src/components/projectCard/ProjectCard.jsx */
import React, { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import { FaHeart, FaCommentAlt, FaSave, FaUsers, FaEdit, FaTrashAlt, FaFileAlt, FaUserPlus, FaEye, FaClipboardList } from 'react-icons/fa';

const ApplyModal = lazy(() => import('./ApplyModal'));
const ReviewModal = lazy(() => import('./ReviewModal'));
const ApplicantsModal = lazy(() => import('./ApplicantsModal'));
const MembersModal = lazy(() => import('./ProjectMembersModal'));

const defaultProjectImage = "/default_images/default-project.svg";

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

  // Add image URL handling
  const getImageUrl = (img) => {
    if (!img) return defaultProjectImage;
    
    // If it's already a full URL (starts with http), use it as is
    if (img.startsWith('http')) return img;
    
    // If it's a relative path starting with /media/, use it as is
    if (img.startsWith('/media/')) return img;
    
    // If it's a relative path without /media/, add it
    if (img.startsWith('/')) {
      return `/media${img}`;
    }
    
    // If it's just a filename, add /media/project-images/
    return `/media/project-images/${img}`;
  };

  // Add error handling for image loading
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = defaultProjectImage;
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5 }}
        className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 mb-6 max-w-5xl mx-auto border border-gray-100"
      >
        <div className="flex flex-col gap-4">
          <motion.img 
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            src={getImageUrl(image)}
            onError={handleImageError}
            alt={title} 
            className="w-full h-64 object-cover rounded-md shadow-md" 
          />

          <div className="flex justify-between items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
              {leaderName && (
                <p className="text-sm text-gray-600">Led by <span className="font-medium text-gray-800">{leaderName}</span></p>
              )}
            </motion.div>
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeCls}`}
            >
              {isActive ? 'Active' : 'Completed'}
            </motion.span>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-700 leading-relaxed text-sm whitespace-pre-line"
          >
            {description}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 text-sm mt-4"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDesc(true)} 
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition font-medium"
            >
              <FaEye className="text-base" /> Full Description
            </motion.button>
            {accepting && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRole(true)} 
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition font-medium"
              >
                <FaClipboardList className="text-base" /> Role Details
              </motion.button>
            )}
            {fileUrl && (
              (visibility?.toUpperCase() === 'PUBLIC' ||
               (visibility?.toUpperCase() === 'PRIVATE' && (isMember || isOwner))) && (
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <FaFileAlt/>Download File
                </motion.a>
              )
            )}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowReviews(true)} 
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition font-medium"
            >
              <FaCommentAlt className="text-base" /> Reviews
            </motion.button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-between items-center mt-4 gap-4"
          >
            <div className="flex gap-2 text-sm">
              {isMember && (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMembers(true)} 
                  className="flex items-center gap-2 px-4 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors duration-200"
                >
                  <FaUsers /> Team
                </motion.button>
              )}
              {!isOwner && accepting && !isMember && (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowApply(true)} 
                  className="flex items-center gap-2 px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                >
                  <FaUserPlus /> Join
                </motion.button>
              )}
              {isOwner && accepting && (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowApplicants(true)} 
                  className="flex items-center gap-2 px-4 py-1 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-700 transition-colors duration-200"
                >
                  <FaFileAlt /> Applicants
                </motion.button>
              )}
              {isOwner && (
                <>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowEdit(true)} 
                    className="flex items-center gap-2 px-4 py-1 rounded bg-yellow-100 hover:bg-yellow-200 text-yellow-700 transition-colors duration-200"
                  >
                    <FaEdit /> Edit
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDelete} 
                    className="flex items-center gap-2 px-4 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 transition-colors duration-200"
                  >
                    <FaTrashAlt /> Delete
                  </motion.button>
                </>
              )}
            </div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-4 text-gray-600 text-sm"
            >
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 hover:text-gray-800 transition-colors duration-200"
              >
                <FaSave /> Save
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 hover:text-red-500 transition-colors duration-200"
              >
                <FaHeart /> Like
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 hover:text-gray-800 transition-colors duration-200"
              >
                <FaCommentAlt /> Comment
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDesc && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className={overlay}
          >
            <motion.button 
              whileHover={{ x: -5 }}
              onClick={() => setShowDesc(false)} 
              className="text-gray-500 mb-4 transition-colors duration-200 hover:text-gray-700"
            >
              ← Back
            </motion.button>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Project Description</h2>
            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{description}</p>
          </motion.div>
        )}

        {showRole && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className={overlay}
          >
            <motion.button 
              whileHover={{ x: -5 }}
              onClick={() => setShowRole(false)} 
              className="text-gray-500 mb-4 transition-colors duration-200 hover:text-gray-700"
            >
              ← Back
            </motion.button>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Team Role Details</h2>
            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{roleDetails || 'No details provided.'}</p>
          </motion.div>
        )}

        {showEdit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className={overlay}
          >
            <motion.button 
              whileHover={{ x: -5 }}
              onClick={() => setShowEdit(false)} 
              className="text-gray-500 mb-4 transition-colors duration-200 hover:text-gray-700"
            >
              ← Back
            </motion.button>
            <h2 className="text-2xl font-bold mb-4">Edit Project</h2>
            <div className="space-y-4">
              <motion.input 
                whileFocus={{ scale: 1.02 }}
                className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200" 
                value={titleEd} 
                onChange={(e) => setTitleEd(e.target.value)} 
              />
              <motion.textarea 
                whileFocus={{ scale: 1.02 }}
                className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200" 
                rows={4} 
                value={descEd} 
                onChange={(e) => setDescEd(e.target.value)} 
              />
              <motion.textarea 
                whileFocus={{ scale: 1.02 }}
                className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200" 
                rows={4} 
                value={roleEd} 
                onChange={(e) => setRoleEd(e.target.value)} 
                disabled={!acceptingEd} 
                placeholder="Role Details" 
              />
              <motion.select 
                whileFocus={{ scale: 1.02 }}
                className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200" 
                value={statusEd} 
                onChange={(e) => setStatusEd(e.target.value)}
              >
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
              </motion.select>
              <motion.select 
                whileFocus={{ scale: 1.02 }}
                className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200" 
                value={String(acceptingEd)} 
                onChange={(e) => setAcceptingEd(e.target.value === 'true')} 
                disabled={statusEd === 'COMPLETED'}
              >
                <option value="true">Accepting applicants</option>
                <option value="false">Closed</option>
              </motion.select>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave} 
                className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                Save
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showApply && <Suspense fallback={null}><ApplyModal projectId={project_id} onClose={() => setShowApply(false)} onSuccess={() => alert('Application sent!')} /></Suspense>}
      {showApplicants && <Suspense fallback={null}><ApplicantsModal projectId={project_id} onClose={() => setShowApplicants(false)} /></Suspense>}
      {showMembers && <Suspense fallback={null}><MembersModal projectId={project_id} isOwner={isOwner} onClose={() => setShowMembers(false)} /></Suspense>}
      {showReviews && <Suspense fallback={null}><ReviewModal projectId={project_id} onClose={() => setShowReviews(false)} /></Suspense>}
    </>
  );
}
