// src/components/ResearchPaper/PaperApplyModal.jsx
import React, { useState } from 'react';
import API from '../../../services/api';
import {
  FileText,
  Loader2,
  Send,
  ArrowLeft,
  Paperclip
} from 'lucide-react';

export default function PaperApplyModal({ paperId, onClose, onSuccess }) {
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [cv, setCv] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role.trim()) return alert('Please specify the role you are applying for.');
    setBusy(true);

    const fd = new FormData();
    fd.append('paper', paperId);
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
    <div className="fixed inset-0 z-50 bg-white p-6 sm:p-10 overflow-y-auto shadow-xl rounded-lg">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onClose}
          className="text-gray-500 mb-4 flex items-center gap-2 hover:text-black transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          Apply to Join Research Paper
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-200">
          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desired Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Co-author, Research Assistant"
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Optional Message
            </label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the authors why you're a good fit for this paper..."
              className="w-full px-4 py-2 rounded-md border border-gray-300 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* CV Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload CV <span className="text-xs text-gray-500">(PDF, DOCX)</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-100 text-sm font-medium text-gray-600">
                <Paperclip className="w-4 h-4" />
                Upload File
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setCv(e.target.files[0])}
                  className="hidden"
                />
              </label>
              {cv && (
                <span className="flex items-center gap-1 text-green-700 text-sm truncate max-w-[200px]">
                  <FileText className="w-4 h-4" />
                  {cv.name}
                </span>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={busy}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
