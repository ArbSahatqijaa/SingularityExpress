import React, { useState, useEffect } from 'react';
import ProfileCard from '../../components/home/ProfileCard';  
import FeaturedProjects from '../../components/home/FeaturedProjects';  
import ChatSidebar from '../../components/home/ChatSidebar';  
import TrendingProjects from '../../components/home/TrendingProjects'; 
import TeamCollaborationFeed from '../../components/home/TeamCollaborationFeed'; 
import Skills from '../../components/home/SkillHighlights'; 
import TodoTasks from '../../components/home/ToDoTask';
import CreateProjectPost from './CreateProject';  
import FriendSuggestionCard from './FriendList';
import ProfileDashboard from './ProfileDashboard';  
import Activitiy from './RecentActivityFeed';
import ChatAssistant from './ChatAssistant';  
import ProjectFilter from './ProjectFilter';  
import Research from './ResearchPaper'; 
import ProjectCard from '../projectCard/projectCard';
import API from '../../services/api';

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState('Project');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    API.get('/projects/')
    .then(({data}) => setProjects(data))
    .catch(() => setError('Failed to load projects'))
    .finally(() => setLoading(false));
  }, [])

  const handleNewProject = project => {
    setProjects(ps => [project, ...ps]);
  }


  return (
    <div className="bg-gray-100 min-h-screen p-4 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <ProfileCard />
          <ProfileDashboard />
          <TeamCollaborationFeed />
          <TodoTasks />
        </div>

        <div className="lg:col-span-6 space-y-4">
          <ProjectFilter
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          <CreateProjectPost onCreate={handleNewProject} />

          {selectedCategory === 'Project' && (
            loading
              ? <div>Loading projects…</div>
              : error
                ? <div className="text-red-500">{error}</div>
                : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map(p => {
                      const imageUrl = p.image
                        ? (p.image.startsWith('http') ? p.image : API.defaults.baseURL + p.image)
                        : null;
                      return (
                        <ProjectCard
                          key={p.project_id}
                          title={p.title}
                          description={p.description}
                          status={p.status === 'ACTIVE' ? 'In Progress' : 'Completed'}
                          imageUrl={imageUrl}
                        />
                      );
                    })}
                  </div>
                )
          )}

          {selectedCategory === 'Research' && <Research />}
        </div>

        <div className="lg:col-span-3 space-y-4 flex flex-col">
          <Activitiy />
          <TrendingProjects />
          <Skills />
          <FriendSuggestionCard />
        </div>
      </div>

      <div className="hidden md:block lg:block">
        <ChatSidebar />
      </div>
      <div className="fixed bottom-6 left-6 z-50">
        <ChatAssistant />
      </div>
    </div>
  );
};

export default Home;
