// src/components/projectCard/ApplyModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import { Paperclip, Loader2 } from 'lucide-react';

export default function ApplyModal({ projectId, onClose, onSuccess }) {
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [cv, setCv] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role.trim()) return alert('Please specify your desired role.');

    setBusy(true);
    const fd = new FormData();
    fd.append('project', projectId);
    fd.append('role_applied_for', role);
    fd.append('message', message);
    if (cv) fd.append('cv', cv);

    try {
      await API.post('/applications/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess?.();
      onClose();
    } catch {
      alert('Application failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-50/80 backdrop-blur-sm z-50 p-6 sm:p-12 overflow-auto flex justify-center items-start sm:items-center"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white shadow-xl rounded-2xl max-w-xl w-full p-8 space-y-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold text-gray-800"
            >
              Apply to Project
            </motion.h2>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 text-sm transition-colors duration-200"
            >
              ✕ Close
            </motion.button>
          </div>

          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit} 
            className="space-y-5"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">Role you're applying for</label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                placeholder="e.g. Frontend Developer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">Message to the project leader</label>
              <motion.textarea
                whileFocus={{ scale: 1.02 }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                rows={4}
                placeholder="Optional message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">Attach CV (PDF or DOCX)</label>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="relative border border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-all duration-200"
              >
                <motion.label 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 text-blue-600 cursor-pointer"
                >
                  <Paperclip className="w-5 h-5" />
                  {cv ? (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="truncate"
                    >
                      {cv.name}
                    </motion.span>
                  ) : (
                    <span>Click to upload</span>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setCv(e.target.files[0])}
                    className="hidden"
                  />
                </motion.label>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-end"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={busy}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-60 transition-colors duration-200"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                {busy ? 'Submitting…' : 'Submit Application'}
              </motion.button>
            </motion.div>
          </motion.form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
