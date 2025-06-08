import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../services/api';
import DashboardLayout from '../DashboardLayout';

export default function PaperPage() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const { data } = await API.get('/papers/');
        setPapers(data);
      } catch (err) {
        setError('Failed to load papers');
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  const handleDelete = async paperId => {
    if (!window.confirm('Delete this paper?')) return;
    await API.delete(`/papers/${paperId}/`);
    setPapers(papers.filter(p => p.paper_id !== paperId));
  };

  const handleEdit = paperId => {
    navigate(`/dashboard/papers/edit/${paperId}`);
  };

  if (loading)
    return <div className="text-center py-10 text-gray-500">Loading papers...</div>;
  if (error)
    return <div className="text-center py-10 text-red-600">{error}</div>;

  return (
    <DashboardLayout>
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Paper Management</h1>
              <p className="text-sm text-gray-500 mt-1">Overview and control of submitted papers</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/papers/new')}
              className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-md"
            >
              + New Paper
            </button>
          </div>

          {papers.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-700">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 font-medium text-gray-600">ID</th>
                      <th className="px-6 py-4 font-medium text-gray-600">Title</th>
                      <th className="px-6 py-4 font-medium text-gray-600">Description</th>
                      <th className="px-6 py-4 font-medium text-gray-600">Status</th>
                      <th className="px-6 py-4 font-medium text-gray-600">Visibility</th>
                      <th className="px-6 py-4 font-medium text-gray-600">Applications</th>
                      <th className="px-6 py-4 font-medium text-gray-600">Role Details</th>
                      <th className="px-6 py-4 font-medium text-gray-600">File</th>
                      <th className="px-6 py-4 font-medium text-gray-600">Created By</th>
                      <th className="px-6 py-4 text-center font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {papers.map(p => (
                      <tr key={p.paper_id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-semibold text-gray-900">{p.paper_id}</td>
                        <td className="px-6 py-4">{p.title}</td>
                        <td className="px-6 py-4">{p.description}</td>
                        <td className="px-6 py-4">{p.status}</td>
                        <td className="px-6 py-4">{p.visibility}</td>
                        <td className="px-6 py-4">{p.accepting_applications ? 'Yes' : 'No'}</td>
                        <td className="px-6 py-4">{p.role_details || '-'}</td>
                        <td className="px-6 py-4">{p.file_path}</td>
                        <td className="px-6 py-4">{p.created_by}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleEdit(p.paper_id)}
                              className="px-3 py-1.5 text-xs bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-md shadow-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(p.paper_id)}
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
          ) : (
            <p className="text-gray-500 text-sm">No papers available</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
