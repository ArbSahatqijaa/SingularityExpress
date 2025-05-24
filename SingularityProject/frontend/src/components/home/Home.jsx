import React, { useState, useEffect } from 'react';
import ProfileCard from './ProfileCard';
import ChatSidebar from './ChatSidebar';
import TrendingProjects from './TrendingProjects';
import TeamCollaborationFeed from './TeamCollaborationFeed';
import Skills from './SkillHighlights';
import TodoTasks from './ToDoTask';
import CreateProjectPost from './CreateProject';
import FriendSuggestionCard from './FriendList';
import ProfileDashboard from './ProfileDashboard';
import Activitiy from './RecentActivityFeed';
import ChatAssistant from './ChatAssistant';
import ProjectFilter from './ProjectFilter';


import CreateResearchPaper from './ResearchPaper/CreateResearchPaper';
import ResearchPaperCard from './ResearchPaper/ResearchPaperCard';


import CreateTutorial from './Tutorial/CreateTutorial'; 
import TutorialCard from './Tutorial/TutorialCard';     

import ProjectCard from '../projectCard/projectCard';
import API from '../../services/api';

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState('Project');
  const [projects, setProjects] = useState([]);
  const [researchPapers, setResearchPapers] = useState([]);
  const [tutorials, setTutorials] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Effect to fetch data based on selectedCategory
  useEffect(() => {
    setLoading(true);
    setError(''); 

    if (selectedCategory === 'Project') {
      API.get('/projects/')
        .then(({ data }) => setProjects(data))
        .catch(() => setError('Failed to load projects'))
        .finally(() => setLoading(false));
    } else if (selectedCategory === 'Research') {
      API.get('/papers/')
        .then(({ data }) => setResearchPapers(data))
        .catch(() => setError('Failed to load research papers'))
        .finally(() => setLoading(false));
    } else if (selectedCategory === 'Tutorial') { 
      API.get('/tutorials/') 
        .then(({ data }) => setTutorials(data))
        .catch(() => setError('Failed to load tutorials'))
        .finally(() => setLoading(false));
    }
  }, [selectedCategory]); 

  const handleNewProject = (project) => {
    setProjects((prevProjects) => [project, ...prevProjects]);
  };

  const handleNewResearchPaper = (paper) => {
    setResearchPapers((prevPapers) => [paper, ...prevPapers]);
  };

  const handleNewTutorial = (tutorial) => { 
    setTutorials((prevTutorials) => [tutorial, ...prevTutorials]);
  };

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
           
            categories={['Project', 'Research', 'Tutorial']} 
          />

          {/* Conditional rendering for creation forms */}
          {selectedCategory === 'Project' && (
            <CreateProjectPost onCreate={handleNewProject} />
          )}
          {selectedCategory === 'Research' && (
            <CreateResearchPaper onCreate={handleNewResearchPaper} />
          )}
          {selectedCategory === 'Tutorial' && ( // NEW: Render CreateTutorial
            <CreateTutorial onCreate={handleNewTutorial} />
          )}

          {/* Conditional rendering for lists */}
          {selectedCategory === 'Project' && (
            loading ? (
              <div>Loading projects…</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((p) => {
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

          {selectedCategory === 'Research' && (
            loading ? (
              <div>Loading research papers…</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {researchPapers.map((paper) => {
                  const pdfUrl = paper.file_path
                    ? (paper.file_path.startsWith('http') ? paper.file_path : API.defaults.baseURL + paper.file_path)
                    : null;
                  return (
                    <ResearchPaperCard
                      key={paper.paper_id}
                      title={paper.title}
                      abstract={paper.description}
                      authors={paper.created_by} 
                      pdfUrl={pdfUrl}
                    />
                  );
                })}
              </div>
            )
          )}

          {selectedCategory === 'Tutorial' && ( 
            loading ? (
              <div>Loading tutorials…</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4"> 
                {tutorials.map((tutorial) => {
                  return (
                    <TutorialCard
                      key={tutorial.tutorial_id} 
                      title={tutorial.title}
                      filePath={tutorial.filePath} 
                    />
                  );
                })}
              </div>
            )
          )}
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