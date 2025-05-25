import React, { useState } from 'react';
import { ChevronDown, Users, ImagePlus } from 'lucide-react';
import API from '../../services/api';

const CreateProjectPost = ({ onCreate }) => {
  const [title, setTitle] = useState('');
  const [filePath, setFilePath] = useState(null)
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [role_details, setRole_details] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!title || !description || !filePath || !role_details) return;

    const fd = new FormData();

    fd.append('title',      title);
    fd.append('description', description);
    fd.append('role_details', role_details);
    fd.append('visibility', 'PUBLIC');
    fd.append('status', 'ACTIVE');
    fd.append('file_path', filePath);
    if (image) fd.append('image', image);

    try {
      const {data} = await API.post('/projects/', fd, {
        headers: {'Content-Type': 'multipart/form-data'}
      });
    onCreate(data);
    setTitle('');
    setDescription('');
    setRole_details('');
    setFilePath(null);
    setImage(null);
    setExpanded(false);
    }
    catch (err) {
      console.error('Post failed', err.response?.data)
    }
  };

  return (
    <div className="bg-white p-3 rounded-xl shadow-md mb-4 border border-gray-200">
      <h2 className="text-base font-semibold mb-2 text-gray-800 flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
        </svg>
        Start a Project
      </h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Project Title"
          className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Project Description"
          className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
        <textarea
          value={role_details}
          onChange={(e) => setRole_details(e.target.value)}
          placeholder="Role Details"
          className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />

       <div className="flex flex-col gap-1">
  <label className="text-sm text-gray-600">Choose Project File</label>
  <div className="flex items-center gap-2">
    <ImagePlus className="w-4 h-4 text-gray-500" />
    <input
      type="file"
      name="file_path"
      accept="*/*"
      required
      onChange={(e) => setFilePath(e.target.files[0])}
      className="block w-full text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:border file:border-gray-300 file:rounded-md"
    />
  </div>
</div>

<div className="flex flex-col gap-1">
  <label className="text-sm text-gray-600">Choose Project Image</label>
  <div className="flex items-center gap-2">
    <ImagePlus className="w-4 h-4 text-gray-500" />
    <input
      type="file"
      accept="image/*"
      onChange={(e) => setImage(e.target.files[0])}
      className="block w-full text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:border file:border-gray-300 file:rounded-md file:bg-gray-50 file:text-sm"
    />
  </div>
</div>

        

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          Post Project
        </button>
      </form>
    </div>
  );
};

export default CreateProjectPost;
