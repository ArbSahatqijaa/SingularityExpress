// src/components/CreateProjectPost.jsx
import React, { useState, useEffect } from 'react';
import { ImagePlus } from 'lucide-react';
import API from '../../services/api';

const CreateProjectPost = ({ onCreate }) => {
  const [title, setTitle]                 = useState('');
  const [description, setDescription]     = useState('');
  const [roleDetails, setRoleDetails]     = useState('');
  const [visibility, setVisibility]       = useState('PUBLIC');
  const [status, setStatus]               = useState('ACTIVE');
  const [accepting, setAccepting]         = useState(true);
  const [filePath, setFilePath]           = useState(null);
  const [image, setImage]                 = useState(null);

  /* ---------------- handle status / accepting ---------------- */
  useEffect(() => {
    if (status === 'COMPLETED' && accepting) setAccepting(false);
  }, [status]);

  /* ---------------- submit ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !filePath) return;
    if (accepting && !roleDetails.trim())   return;

    const fd = new FormData();

    /* append role_details FIRST (text -> backend) */
    fd.append('role_details', roleDetails);       // 1️⃣ now first
    fd.append('title',        title);
    fd.append('description',  description);
    fd.append('visibility',   visibility);
    fd.append('status',       status);
    fd.append('accepting_applications', accepting);

    /* files always last */
    fd.append('file_path', filePath);
    if (image) fd.append('image', image);

    try {
      const { data } = await API.post('/projects/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onCreate(data);                                   // optimistic add
      /* reset */
      setTitle('');
      setDescription('');
      setRoleDetails('');
      setVisibility('PUBLIC');
      setStatus('ACTIVE');
      setAccepting(true);
      setFilePath(null);
      setImage(null);
    } catch (err) {
      console.error('Project create failed:', err.response?.data);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="bg-white p-3 rounded-xl shadow-md mb-4 border border-gray-200">
      <h2 className="text-base font-semibold mb-2 text-gray-800 flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
        </svg>
        Start a Project
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        <input
          className="w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-blue-500"
          placeholder="Project Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-blue-500"
          placeholder="Project Description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {accepting && (
          <textarea
            className="w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Role Details"
            rows={2}
            value={roleDetails}
            onChange={(e) => setRoleDetails(e.target.value)}
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
          <option value="ACTIVE">Active Project</option>
          <option value="COMPLETED">Completed Project</option>
        </select>

        {/* Accepting? */}
        <select
          className="w-full px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-blue-500"
          value={String(accepting)}
          onChange={(e) => setAccepting(e.target.value === 'true')}
          disabled={status === 'COMPLETED'}
        >
          <option value="true">Allow Applicants</option>
          <option value="false">No Applicants</option>
        </select>

        {/* Project file */}
        <label className="flex items-center gap-2 cursor-pointer">
          <ImagePlus className="w-4 h-4 text-gray-500" />
          <span>Choose Project File</span>
          <input
            type="file"
            accept="*/*"
            required
            onChange={(e) => setFilePath(e.target.files[0])}
            className="hidden"
          />
        </label>

        {/* Image file */}
        <label className="flex items-center gap-2 cursor-pointer">
          <ImagePlus className="w-4 h-4 text-gray-500" />
          <span>Choose Project Image (optional)</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="hidden"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-1.5 rounded-lg font-medium hover:opacity-90 transition"
        >
          Post Project
        </button>
      </form>
    </div>
  );
};

export default CreateProjectPost;
