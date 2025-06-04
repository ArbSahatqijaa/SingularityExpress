import React, { useEffect, useState } from 'react';
import API from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '../../projectCard/projectCard';

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
          <ProjectCard
            key={id}
            title={project.title}
            description={project.description}
            status={project.status}
            image={imageUrl}
          />
        );
      })}
    </div>
    </div>
  );
};

export default ProjectsList;
