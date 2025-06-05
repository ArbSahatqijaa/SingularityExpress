import React, { useEffect, useState } from 'react';
import API from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import ResearchPaperCard from '../../home/ResearchPaper/ResearchPaperCard.jsx';

const PaperList = ({ user }) => {
    const [userPapers, setUserPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const backendUrl = 'http://localhost:8000';

    useEffect(() => {
        setLoading(true);
        API.get(`/user_papers/?user=${user.user_id}`)
            .then(({ data }) => {
                console.log('User Papers:', data);
                setUserPapers(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Failed to fetch user papers', error);
                setError('Failed to load papers');
                setLoading(false);
            });

        console.log('User object:', user);
        }, [user]);

        if (loading) return <div className="text-gray-600">Loading papers...</div>;
        if (error) return <div className="text-red-600">{error}</div>;
        if (userPapers.length === 0) return <div className="text-gray-600">You have no research papers yet.</div>;
 return (
    <div>
    <h2 className="text-xl font-bold text-gray-800 mb-4">ResearchPapers I'm Working On</h2>
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
      {userPapers.map(({ id, paper }) => {
        const cleanImagePath = paper.image?.startsWith('/') ? paper.image.slice(1) : paper.image;
        const imageUrl = paper.image ? `${backendUrl}/${cleanImagePath}` : null;

        return (
          <ResearchPaperCard
            key={id}
            title={paper.title}
            description={paper.description}
            status={paper.status}
            image={imageUrl}
          />
        );
      })}
    </div>
    </div>
  );
};

export default PaperList;