// src/components/home/Tutorial/CreateTutorial.jsx
import React, { useState } from 'react';
import { BookOpen, FilePlus } from 'lucide-react'; // Using BookOpen for tutorial icon
import API from '../../../services/api';

const CreateTutorial = ({ onCreate }) => {
  const [title, setTitle] = useState('');
  const [filePath, setFilePath] = useState(null); // Matches backend 'filePath'
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!title || !filePath) {
      alert('Please provide a title and upload a file for the tutorial.');
      return;
    }

    if (!(filePath instanceof File)) {
      alert('Invalid file selected. Please choose a valid file.');
      return;
    }
    if (filePath.size === 0) {
      alert('Uploaded file is empty. Please upload a valid file.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('filePath', filePath); // Matches backend 'filePath'

    setLoading(true);
    try {
      // Assuming the API endpoint for tutorials is '/tutorials/'
      const { data } = await API.post('/tutorials/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (onCreate) onCreate(data);

      setTitle('');
      setFilePath(null);
      alert('Tutorial created successfully!');
    } catch (err) {
      console.error('Failed to submit tutorial:', err.response?.data || err.message);

      if (err.response && err.response.data) {
        let errorMessages = '';
        const data = err.response.data;

        for (const field in data) {
          const value = data[field];
          if (Array.isArray(value)) {
            errorMessages += `${field}: ${value.join(', ')}\n`;
          } else if (typeof value === 'string') {
            errorMessages += `${field}: ${value}\n`;
          } else {
            errorMessages += `${field}: ${JSON.stringify(value)}\n`;
          }
        }

        alert(`Failed to create tutorial:\n${errorMessages}`);
      } else {
        alert('Failed to create tutorial. Please check the console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-3 rounded-xl shadow-md mb-4 border border-gray-200">
      <h2 className="text-base font-semibold mb-2 text-gray-800 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-purple-500" />
        Create New Tutorial
      </h2>

      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tutorial Title"
          className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />

        <div className="flex items-center gap-2">
          <FilePlus className="w-4 h-4 text-gray-500" />
          <input
            type="file"
            name="filePath" // Matches backend 'filePath'
            accept=".pdf,.doc,.docx,.txt" // Adjust accepted file types as needed
            required
            onChange={(e) => setFilePath(e.target.files[0])}
            className="block w-full text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:border file:border-gray-300 file:rounded-md"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          {loading ? 'Creating...' : 'Create Tutorial'}
        </button>
      </form>
    </div>
  );
};

export default CreateTutorial;
