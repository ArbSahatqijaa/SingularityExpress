// src/components/home/Tutorial/Tutorials.jsx
import React, { useEffect, useState } from 'react';
import { BookOpen, Download } from 'lucide-react';
import API from '../../../services/api'; // Axios instance

const TutorialCard = () => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const response = await API.get('/tutorials/');
        setTutorials(response.data);
      } catch (error) {
        console.error('Failed to fetch tutorials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorials();
  }, []);

  if (loading) return <p>Loading tutorials...</p>;
  if (!tutorials.length) return <p>No tutorials found.</p>;

  // Backend base URL - adjust to your backend address
  const baseURL = 'http://localhost:8000';

  return (
    <div className="space-y-4">
      {tutorials.map(({ tutorial_id, title, filePath, created_by }) => {
        // Fix fileUrl for relative paths
        const fileUrl = filePath && !filePath.startsWith('http') ? baseURL + filePath : filePath;

        return (
          <div
            key={tutorial_id}
            className="bg-white p-4 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              {title}
            </h3>
            {created_by && (
              <p className="text-gray-600 text-xs mb-3">
                <span className="font-medium">Created by:</span> {created_by}
              </p>
            )}
            <div className="flex justify-end gap-3">
              {fileUrl ? (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 bg-purple-500 text-white text-xs font-medium rounded-md hover:bg-purple-600 transition-colors duration-200"
                >
                  <Download className="w-4 h-4 mr-1" />
                  View/Download File
                </a>
              ) : (
                <span className="text-gray-400 text-xs italic">No file available</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TutorialCard;
