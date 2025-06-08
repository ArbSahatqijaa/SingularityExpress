  // src/components/home/Tutorial/Tutorials.jsx
  import React, { useEffect, useState } from 'react';
  import { BookOpen, Download, Heart, MessageCircle, Save } from 'lucide-react';
  import API from '../../../services/api'; // Axios instance

  const TutorialCard = ({ meId }) => {
    const [tutorials, setTutorials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchTutorials = async () => {
        try {
          const response = await API.get('/tutorials/');
          setTutorials(response.data);
          console.log("tutorials: ", response.data);
        } catch (error) {
          console.error('Failed to fetch tutorials:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchTutorials();
    }, []);

    const handleDelete = async (id) => {
      if (!window.confirm('Are you sure you want to delete this tutorial?')) return;

      try {
        await API.delete(`/tutorials/${id}/`);
        setTutorials(prev => prev.filter(t => t.tutorial_id !== id));
      } catch (error) {
        console.error('Error deleting tutorial:', error);
        alert('Failed to delete tutorial.');
      }
    };


    if (loading) return <p>Loading tutorials...</p>;
    if (!tutorials.length) return <p>No tutorials found.</p>;

    const baseURL = 'http://localhost:8000';

    return (
      <div className="space-y-6">
        {tutorials.map(({ tutorial_id, title, filePath, created_by }) => {
          const fileUrl = filePath && !filePath.startsWith('http') ? baseURL + filePath : filePath;

          return (
            <div
              key={tutorial_id}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 mb-6 max-w-5xl mx-auto"
            >
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                      {title}
                    </h3>
                    {created_by && (
  <p className="text-sm text-gray-600">
    <span className="font-medium text-gray-800">Created by:</span> {created_by.username}
  </p>
)}
                  </div>
                </div>

                <div className="flex justify-between items-center flex-wrap gap-4">
                  {fileUrl ? (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium"
                    >
                      <Download className="w-4 h-4" /> View / Download File
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm italic">No file available</span>
                  )}

                  <div className="flex gap-4 text-gray-600 text-sm">
                    {created_by.user_id === meId && (
                      <button
                        onClick={() => handleDelete(tutorial_id)}
                        className="flex items-center gap-2 px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
                        type="button"
                      >
                        Remove
                      </button>
                    )}
                    
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  export default TutorialCard;