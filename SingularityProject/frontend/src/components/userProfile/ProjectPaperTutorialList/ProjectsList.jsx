import React, { useEffect, useState } from 'react';
import API from '../../../services/api';
import { useNavigate } from 'react-router-dom';

const ProjectsList = ({ user }) => {
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const backendUrl = 'http://localhost:8000';

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    API.get(`/user_projects/?user=${user.user_id}`)
      .then(({ data }) => {
        console.log('User Projects:', data);
        setUserProjects(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch user projects', error);
        setError('Failed to load projects');
        setLoading(false);
      });

    console.log('User object:', user);
  }, [user]);

  if (loading) return <div className="text-gray-600">Loading projects...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (userProjects.length === 0) return <div className="text-gray-600">You have no projects yet.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Projects I'm Working On</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userProjects.map(({ id, project }) => {
          const cleanImagePath = project.image?.startsWith('/') ? project.image.slice(1) : project.image;
          const imageUrl = project.image ? `${backendUrl}/${cleanImagePath}` : null;

          return (
            <div
              key={id}
              className="bg-white rounded-2xl shadow-md p-4 flex flex-col justify-between hover:shadow-lg transition-shadow duration-200"
            >
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={project.title}
                  className="w-full h-40 object-cover rounded-xl mb-3"
                />
              )}
              <h3 className="text-lg font-semibold text-gray-800">{project.title}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-3"> Description: {project.description}</p>
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full w-fit">
                {project.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectsList;
