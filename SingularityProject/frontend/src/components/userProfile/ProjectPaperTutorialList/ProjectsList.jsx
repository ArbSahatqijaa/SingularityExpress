import React, { useEffect, useState } from 'react';
import API from '../../../services/api';
import { useNavigate } from 'react-router-dom';

const ProjectsList = ({ user }) => {
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const backendUrl = 'http://localhost:8000';
  const defaultProjectImage = "/default_images/default-project.svg";

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

  // Add image URL handling
  const getImageUrl = (img) => {
    if (!img) return defaultProjectImage;
    
    // If it's already a full URL (starts with http), use it as is
    if (img.startsWith('http')) return img;
    
    // If it's a relative path starting with /media/, use it as is
    if (img.startsWith('/media/')) {
      return `${backendUrl}${img}`;
    }
    
    // If it's a relative path without /media/, add it
    if (img.startsWith('/')) {
      return `${backendUrl}/media${img}`;
    }
    
    // If it's just a filename, add /media/project-images/
    return `${backendUrl}/media/project-images/${img}`;
  };

  // Add error handling for image loading
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = defaultProjectImage;
  };

  if (loading) return <div className="text-gray-600">Loading projects...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (userProjects.length === 0) return <div className="text-gray-600">You have no projects yet.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Projects I'm Working On</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userProjects.map(({ id, project }) => {
          return (
            <div
              key={id}
              className="bg-white rounded-2xl shadow-md p-4 flex flex-col justify-between hover:shadow-lg transition-shadow duration-200"
            >
              <img
                src={getImageUrl(project.image)}
                onError={handleImageError}
                alt={project.title}
                className="w-full h-40 object-cover rounded-xl mb-3"
              />
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
