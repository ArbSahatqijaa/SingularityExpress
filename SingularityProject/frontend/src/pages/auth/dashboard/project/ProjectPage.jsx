import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../services/api';
import DashboardLayout from '../DashboardLayout';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
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
    API.get('/projects/')
      .then(({ data }) => setProjects(data))
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  const canManage = project =>
    me && (me.is_superuser || me.is_staff || me.user_id === project.leader);

  const handleDelete = async projectId => {
    const project = projects.find(p => p.project_id === projectId);
    if (!canManage(project)) {
      return alert("You don't have permission to delete this project");
    }
    if (!window.confirm('Delete this project?')) return;
    await API.delete(`/projects/${projectId}/`);
    setProjects(projects.filter(p => p.project_id !== projectId));
  };

  const handleEdit = projectId => {
    const project = projects.find(p => p.project_id === projectId);
    if (!canManage(project)) {
      return alert("You don't have permission to edit this project");
    }
    navigate(`/dashboard/projects/edit/${projectId}`);
  };

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <DashboardLayout>
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Manage Projects</h1>
              <p className="text-sm text-gray-500 mt-1">Review and edit your project library</p>
            </div>
            <button
              className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-md"
              onClick={() => navigate('/dashboard/projects/new')}
            >
              + New Project
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-medium text-gray-600">ID</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Title</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Description</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Visibility</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Status</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Accepting Applications</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Role Details</th>
                    <th className="px-6 py-4 font-medium text-gray-600">File</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Image</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Leader</th>
                    <th className="px-6 py-4 font-medium text-gray-600">Created By</th>
                    <th className="px-6 py-4 text-center font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projects.map(p => {
                    const fileUrl = p.file_path
                      ? (p.file_path.startsWith('http') ? p.file_path : API.defaults.baseURL + p.file_path)
                      : null;

                    const imgUrl = p.image
                      ? (p.image.startsWith('http') ? p.image : API.defaults.baseURL + p.image)
                      : null;

                    return (
                      <tr key={p.project_id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-semibold text-gray-900">{p.project_id}</td>
                        <td className="px-6 py-4">{p.title}</td>
                        <td className="px-6 py-4">{p.description}</td>
                        <td className="px-6 py-4">{p.visibility}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{p.status}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${p.accepting_applications ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.accepting_applications ? 'Yes' : 'No'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-pre-wrap">{p.role_details || <span className="text-gray-400">–</span>}</td>
                        <td className="px-6 py-4">
                          {fileUrl ? (
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Download
                            </a>
                          ) : (
                            <span className="text-gray-400">–</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={p.title}
                              className="rounded object-cover"
                              style={{ width: 60, height: 60 }}
                            />
                          ) : (
                            <span className="text-gray-400">–</span>
                          )}
                        </td>
                        <td className="px-6 py-4">{p.leader}</td>
                        <td className="px-6 py-4">{p.created_by_info.username}</td>
                        <td className="px-6 py-4 text-center">
                          {canManage(p) ? (
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => handleEdit(p.project_id)}
                                className="px-3 py-1.5 text-xs bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-md shadow-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(p.project_id)}
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
