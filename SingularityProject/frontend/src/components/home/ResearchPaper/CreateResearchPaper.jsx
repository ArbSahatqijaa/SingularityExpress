// src/components/paper/CreateResearchPaper.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FilePlus } from 'lucide-react';
import API from '../../../services/api';

export default function CreateResearchPaper({ onCreate }) {
  /* ─────────── state ─────────── */
  const [title, setTitle]               = useState('');
  const [description, setDescription]   = useState('');
  const [roleDetails, setRoleDetails]   = useState('');
  const [visibility, setVisibility]     = useState('PUBLIC');
  const [status, setStatus]             = useState('ACTIVE');
  const [accepting, setAccepting]       = useState(true);
  const [filePath, setFilePath]         = useState(null);
  const [busy, setBusy]                 = useState(false);

  const fileInputRef = useRef(null);   // to reset after submit

  /* auto-disable accepting when completed */
  useEffect(() => {
    if (status === 'COMPLETED') {
      setAccepting(false);
      setRoleDetails('');
    }
  }, [status]);

  /* ─────────── submit ─────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !filePath)
      return alert('Title, description and PDF are required.');
    if (accepting && !roleDetails.trim())
      return alert('Role details required when accepting applicants.');

    const fd = new FormData();
    fd.append('role_details',           roleDetails);
    fd.append('title',                  title);
    fd.append('description',            description);
    fd.append('visibility',             visibility);
    fd.append('status',                 status);
    fd.append('accepting_applications', accepting);
    fd.append('file_path',              filePath);

    setBusy(true);
    try {
      const { data } = await API.post('/papers/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onCreate?.(data);

      /* reset */
      setTitle(''); setDescription(''); setRoleDetails('');
      setVisibility('PUBLIC'); setStatus('ACTIVE'); setAccepting(true);
      setFilePath(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Paper create failed:', err.response?.data);
      alert('Could not create paper – see console.');
    } finally { setBusy(false); }
  };

  /* ─────────── UI ─────────── */
  return (
    <div className="bg-white p-3 rounded-xl shadow-md mb-4 border border-gray-200 max-w-md mx-auto">
      <h2 className="text-base font-semibold mb-2 text-gray-800 flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
        </svg>
        Post Research Paper
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        {/* Title */}
        <input
          className="w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-blue-500"
          placeholder="Paper Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Description */}
        <textarea
          className="w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-blue-500"
          placeholder="Paper Description (Abstract)"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {/* Role details */}
        {accepting && (
          <textarea
            className="w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Role Details"
            rows={2}
            value={roleDetails}
            onChange={(e) => setRoleDetails(e.target.value)}
            required
          />
        )}

        {/* Visibility */}
        <select
          className="w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-blue-500"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
        >
          <option value="PUBLIC">Public</option>
          <option value="PRIVATE">Private</option>
        </select>

        {/* Status */}
        <select
          className="w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-blue-500"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ACTIVE">Active Paper</option>
          <option value="COMPLETED">Completed Paper</option>
        </select>

        {/* Accepting toggle */}
        <select
          className="w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-blue-500"
          value={String(accepting)}
          onChange={(e) => setAccepting(e.target.value === 'true')}
          disabled={status === 'COMPLETED'}
        >
          <option value="true">Allow Applicants</option>
          <option value="false">No Applicants</option>
        </select>

        {/* PDF file – visible input */}
        <div className="flex items-center gap-2">
          <FilePlus className="w-4 h-4 text-gray-500" />
          <input
            type="file"
            accept="application/pdf"
            required
            ref={fileInputRef}
            onChange={(e) => setFilePath(e.target.files[0])}
            className="block w-full text-sm text-gray-700 file:mr-3 file:py-1 file:px-3
                       file:border file:border-gray-300 file:rounded-md
                       file:bg-gray-50 file:text-gray-700"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-1.5 rounded-lg
                     font-medium hover:opacity-90 transition disabled:opacity-60"
        >
          {busy ? 'Posting…' : 'Post Paper'}
        </button>
      </form>
    </div>
  );
}
