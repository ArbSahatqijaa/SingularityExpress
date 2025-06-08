import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../services/api';
import DashboardLayout from '../DashboardLayout';

export default function TutorialPage() {
  const [Tutorial, setTutorial] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        const { data } = await API.get('/tutorials/');
        setTutorial(data);
      } catch (err) {
        setError('Failed to load Tutorial');
      } finally {
        setLoading(false);
      }
    };
    fetchTutorial();
  }, []);

  const canManage = target =>
    me?.is_superuser || (!target.is_staff && !target.is_superuser);

  const handleDelete = async TutorialID => {
    if (!canManage(Tutorial.find(u => u.tutorial_id === TutorialID))) {
      return alert("You don't have permission to delete this Tutorial");
    }
    if (!window.confirm('Delete this Tutorial?')) return;
    await API.delete(`/tutorials/${TutorialID}/`);
    setTutorial(Tutorial.filter(u => u.tutorial_id !== TutorialID));
  };

  const handleEdit = tutorialID => {
    if (!canManage(Tutorial.find(u => u.tutorial_id === tutorialID))) {
      return alert("You don't have permission to edit this tutorial");
    }
    navigate(`/dashboard/tutorials/edit/${tutorialID}`);
  };

  if (loading)
    return <div className="text-center py-10 text-gray-500">Loading Tutorial...</div>;
  if (error)
    return <div className="text-center py-10 text-red-600">{error}</div>;

  return (
    <DashboardLayout>
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Manage Tutorials</h1>
              <p className="text-sm text-gray-500 mt-1">View and manage uploaded tutorials</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/tutorials/new')}
              className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-md"
            >
              + New Tutorial
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">ID</th>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">Title</th>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">File Path</th>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">Created By</th>
                    <th className="px-6 py-4 text-center font-medium tracking-wide text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Tutorial.map(u => (
                    <tr key={u.tutorial_id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-900">{u.tutorial_id}</td>
                      <td className="px-6 py-4">{u.title}</td>
                      <td className="px-6 py-4 break-words">{u.filePath}</td>
                      <td className="px-6 py-4">{u.created_by?.username}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleEdit(u.tutorial_id)}
                            className="px-3 py-1.5 text-xs bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-md shadow-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(u.tutorial_id)}
                            className="px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md shadow-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}