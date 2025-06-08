import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../services/api';
import DashboardLayout from '../DashboardLayout';

export default function PaperProjectPage() {
  const navigate = useNavigate();
  const [paperProjects, setPaperProjects] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    if (!me) return;
    API.get('/paper_projects/')
      .then(({ data }) => setPaperProjects(data))
      .catch(() => setError('Failed to load paper-project links'))
      .finally(() => setLoading(false));
  }, [me]);

  const canManage = pp =>
    me?.is_superuser || me?.is_staff || me.user_id === pp.added_by.user_id;

  const handleEdit = pp => {
    navigate(`/dashboard/paper_projects/edit/${pp.id}`);
  };

  const handleDelete = async pp => {
    if (!canManage(pp)) {
      alert("You don't have permission to delete this link");
      return;
    }
    if (!window.confirm('Remove this paper-project link?')) return;
    await API.delete(`/paper_projects/${pp.id}/`);
    setPaperProjects(cur => cur.filter(x => x.id !== pp.id));
  };

  if (loading) return <div>Loading paper-project links…</div>;
  if (error) return <div className="text-red-600 text-center py-6">{error}</div>;

  return (
    <DashboardLayout>
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Paper–Project Links</h1>
              <p className="text-sm text-gray-500 mt-1">View and manage relationships between papers and projects</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/paper_projects/new')}
              className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-md"
            >
              + Add Link
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">ID</th>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">Paper</th>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">Project</th>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">Added By</th>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">Added At</th>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">Notes</th>
                    <th className="px-6 py-4 text-center font-medium tracking-wide text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paperProjects.map(pp => (
                    <tr key={pp.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-900">{pp.id}</td>
                      <td className="px-6 py-4">{pp.paper.title}</td>
                      <td className="px-6 py-4">{pp.project.title}</td>
                      <td className="px-6 py-4">{pp.added_by.username}</td>
                      <td className="px-6 py-4">{new Date(pp.added_at).toLocaleString()}</td>
                      <td className="px-6 py-4">{pp.notes || '—'}</td>
                      <td className="px-6 py-4 text-center">
                        {canManage(pp) ? (
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleEdit(pp)}
                              className="px-3 py-1.5 text-xs bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-md shadow-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(pp)}
                              className="px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md shadow-sm"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">–</span>
                        )}
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
