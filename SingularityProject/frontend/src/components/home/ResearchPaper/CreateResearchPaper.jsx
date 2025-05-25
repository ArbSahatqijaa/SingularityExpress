import React, { useState } from 'react';
import { ChevronDown, FileText, FilePlus } from 'lucide-react'; // Removed User icon as 'authors' field is removed
import API from '../../../services/api';

const CreateResearchPaper = ({ onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // Corresponds to backend 'description'
  const [role_details, setRole_details] = useState('');
  const [file_path, setFile_path] = useState(null); // Corresponds to backend 'file_path'
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!title || !description || !file_path || !role_details) {
      alert('Please fill in all required fields (Title, Description, role_details) and upload a PDF file.');
      return;
    }

    // Additional check for the file_path object itself
    if (!(file_path instanceof File)) {
        alert('Invalid file selected. Please choose a valid PDF file.');
        return;
    }
    if (file_path.size === 0) {
        alert('Uploaded file is empty. Please upload a valid file.');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('role_details', role_details);
    formData.append('file_path', file_path);

    setLoading(true);
    try {
      const { data } = await API.post('/papers/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (onCreate) onCreate(data);

      setTitle('');
      setDescription('');
      setRole_details('');
      setFile_path(null);
      setExpanded(false);
      alert('Research paper submitted successfully!');
    } catch (err) {
      console.error('Failed to submit:', err.response?.data || err.message);
      if (err.response && err.response.data) {
          let errorMessages = '';
          for (const field in err.response.data) {
              errorMessages += `${field}: ${err.response.data[field].join(', ')}\n`;
          }
          alert(`Failed to submit paper:\n${errorMessages}`);
      } else {
          alert('Failed to submit paper. Please check the console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-3 rounded-xl shadow-md mb-4 border border-gray-200">
      <h2 className="text-base font-semibold mb-2 text-gray-800 flex items-center gap-2">
        <FileText className="w-4 h-4 text-blue-500" />
        Submit Research Paper
      </h2>

      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Paper Title"
          className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (Abstract)"
          className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          required
        />

        <div className="flex items-center gap-2">
          <FilePlus className="w-4 h-4 text-gray-500" />
          <input
            type="file"
            name="file_path"
            accept="application/pdf"
            required
            onChange={(e) => setFile_path(e.target.files[0])}
            className="block w-full text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:border file:border-gray-300 file:rounded-md"
          />
        </div>
        <textarea
          value={role_details}
          onChange={(e) => setRole_details(e.target.value)}
          placeholder="Role Details"
          className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
        

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          {loading ? 'Submitting...' : 'Submit Paper'}
        </button>
      </form>
    </div>
  );
};

export default CreateResearchPaper;