import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import { FileText, User, BadgeCheck, XCircle } from 'lucide-react';

export default function ApplicantsModal({ projectId, onClose }) {
  const [apps, setApps] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setBusy(true);
    API.get('/applications/', { params: { project_id: projectId } })
      .then(({ data }) => setApps(data))
      .catch(() => setError('Could not load applications'))
      .finally(() => setBusy(false));
  }, [projectId]);

  const updateStatus = async (appId, newStatus, role = '') => {
    try {
      await API.patch(`/applications/${appId}/`, { status: newStatus, project: projectId });

      if (newStatus === 'ACCEPTED') {
        await API.post('/user_projects/', {
          user_id: apps.find(a => a.application_id === appId).applicant,
          project_id: projectId,
          role
        });
      }

      setApps(list =>
        list.map(a =>
          a.application_id === appId ? { ...a, status: newStatus } : a
        )
      );
    } catch {
      alert('Update failed');
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-50/80 backdrop-blur-sm z-50 p-6 sm:p-12 overflow-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <motion.button 
            whileHover={{ x: -5 }}
            onClick={onClose} 
            className="text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors duration-200"
          >
            ← Back
          </motion.button>

          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-gray-900 mb-8"
          >
            Project Applications
          </motion.h2>

          {busy && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-600"
            >
              Loading applications…
            </motion.p>
          )}
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 font-medium"
            >
              {error}
            </motion.p>
          )}

          {!busy && !error && apps.length === 0 && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 italic"
            >
              No applications submitted yet.
            </motion.p>
          )}

          <motion.ul 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {apps.map((app, index) => (
              <motion.li
                key={app.application_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-xl shadow border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 text-gray-800"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-semibold">Applicant #{app.applicant}</span>
                  </motion.div>
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full transition-colors duration-200
                      ${app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : ''}
                      ${app.status === 'REJECTED' ? 'bg-red-100 text-red-800' : ''}`}
                  >
                    {app.status}
                  </motion.span>
                </div>

                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-gray-600 mb-2 italic"
                >
                  Role: {app.role_applied_for || '—'}
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-gray-700 whitespace-pre-wrap mb-4"
                >
                  {app.message || 'No message provided.'}
                </motion.p>

                <div className="flex items-center justify-between">
                  {app.status === 'PENDING' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex gap-4"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const role = prompt('Assign role for this user?', 'Member');
                          if (role !== null) updateStatus(app.application_id, 'ACCEPTED', role);
                        }}
                        className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors duration-200"
                      >
                        <BadgeCheck className="w-4 h-4" /> Accept
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateStatus(app.application_id, 'REJECTED')}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors duration-200"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </motion.button>
                    </motion.div>
                  )}

                  {app.cv && (
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={app.cv}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors duration-200"
                    >
                      <FileText className="w-4 h-4" /> View CV
                    </motion.a>
                  )}
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}