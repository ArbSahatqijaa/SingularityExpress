import React, { useEffect, useState } from 'react';
import API from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import TutorialCard from '../../home/Tutorial/TutorialCard.jsx';

const TutorialList = ({ user }) => {
    const [tutorials, setTutorials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const backendUrl = 'http://localhost:8000';

    useEffect(() => {
        setLoading(true);
        API.get(`/tutorials/?user=${user.user_id}`)
            .then(({ data }) => {
                console.log('Tutorials:', data);
                setTutorials(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Failed to fetch user tutorials', error);
                setError('Failed to load tutorials');
                setLoading(false);
            });

        console.log('User object:', user);
        }, [user]);

        if (loading) return <div className="text-gray-600">Loading tutorials...</div>;
        if (error) return <div className="text-red-600">{error}</div>;
        if (tutorials.length === 0) return <div className="text-gray-600">You have no tutorials yet.</div>;
 return (
    <div>
    <h2 className="text-xl font-bold text-gray-800 mb-4">Tutorials I'm Working On</h2>
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
      {tutorials.map((tutorial) => {
        const cleanFilePath = tutorial.filePath?.startsWith('/') ? tutorial.filePath.slice(1) : tutorial.filePath;
        const fileUrl = tutorial.filePath ? `${backendUrl}/${cleanFilePath}` : null;

  return (
    <TutorialCard
      key={tutorial.tutorial_id}
      title={tutorial.title}
      description={`Created at: ${new Date(tutorial.created_at).toLocaleDateString()}`}
      status="Uploaded"
      image={fileUrl}  
    />
  );
})}
    </div>
    </div>
  );
};

export default TutorialList;