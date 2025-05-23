import React, { useState, useEffect } from 'react';
import ProfileCard from '../../components/home/ProfileCard';
// import FeaturedProjects from '../../components/home/FeaturedProjects'; // Not used in the provided Home.jsx snippet
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


import CreateResearchPaper from './ResearchPaper/CreateResearchPaper'; // Adjust path if necessary
import ResearchPaperCard from './ResearchPaper/ResearchPaperCard';   // Adjust path if necessary

import ProjectCard from '../projectCard/projectCard';
import API from '../../services/api';

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState('Project');
  const [projects, setProjects] = useState([]);
  const [researchPapers, setResearchPapers] = useState([]); // State for research papers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Effect to fetch data based on selectedCategory
  useEffect(() => {
    setLoading(true);
    setError(''); // Clear previous errors

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
    }
  }, [selectedCategory]); // Dependency array: re-run when selectedCategory changes

  const handleNewProject = (project) => {
    setProjects((prevProjects) => [project, ...prevProjects]);
  };

  const handleNewResearchPaper = (paper) => {
    setResearchPapers((prevPapers) => [paper, ...prevPapers]);
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
          />

          {/* Conditional rendering for creation forms */}
          {selectedCategory === 'Project' && (
            <CreateProjectPost onCreate={handleNewProject} />
          )}
          {selectedCategory === 'Research' && (
            <CreateResearchPaper onCreate={handleNewResearchPaper} />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4"> {/* Adjusted grid for research papers */}
                {researchPapers.map((paper) => {
                  const pdfUrl = paper.pdf
                    ? (paper.pdf.startsWith('http') ? paper.pdf : API.defaults.baseURL + paper.pdf)
                    : null;
                  return (
                    <ResearchPaperCard
                      key={paper.id} // Assuming 'id' is the unique identifier for research papers from your API
                      title={paper.title}
                      abstract={paper.abstract}
                      authors={paper.authors}
                      pdfUrl={pdfUrl}
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