// src/components/Home.jsx
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
  const [projects, setProjects]             = useState([]);
  const [researchPapers, setResearchPapers] = useState([]);
  const [tutorials, setTutorials]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [me, setMe] = useState(null);

  //--fech current user
  useEffect(() => {
    API.get('/whoami/')
    .then(({ data }) => setMe(data))
    .catch(() => setMe(null));
  }, []);

  //update or remove after edit/delete
  const handleUpdateProject = (updated) =>
    setProjects((arr) =>
      arr.map((p) => (p.project_id === updated.project_id ? updated : p))
    );
  const handleRemoveProject = (id) =>
    setProjects((arr) => arr.filter((p) => p.project_id !== id));




  /* helper: newest-first sort (fall back to id) */
  const newestFirst = (arr) =>
    [...arr].sort(
      (a, b) =>
        new Date(b.created_at || 0) - new Date(a.created_at || 0) ||
        (b.project_id ?? b.paper_id ?? b.tutorial_id ?? 0) -
        (a.project_id ?? a.paper_id ?? a.tutorial_id ?? 0)
    );

  /* FETCH whenever category changes */
  useEffect(() => {
    setLoading(true);
    setError('');

    const endpoint =
      selectedCategory === 'Project'
        ? '/projects/'
        : selectedCategory === 'Research'
        ? '/papers/'
        : '/tutorials/';

    API.get(endpoint)
      .then(({ data }) => {
        if (selectedCategory === 'Project')   setProjects(newestFirst(data));
        if (selectedCategory === 'Research')  setResearchPapers(newestFirst(data));
        if (selectedCategory === 'Tutorial')  setTutorials(newestFirst(data));
      })
      .catch(() =>
        setError(`Failed to load ${selectedCategory.toLowerCase()}s`)
      )
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  /* creation callbacks already prepend new items */
  const handleNewProject       = (proj)  => setProjects((p) => [proj, ...p]);
  const handleNewResearchPaper = (pap)   => setResearchPapers((p) => [pap, ...p]);
  const handleNewTutorial      = (tut)   => setTutorials((t) => [tut, ...t]);

  /* ----------- JSX below is unchanged ------------ */
  return (
    <div className="bg-gray-100 min-h-screen p-4 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* left sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <ProfileCard />
          <ProfileDashboard />
          <TeamCollaborationFeed />
          <TodoTasks />
        </div>

        {/* main column */}
        <div className="lg:col-span-6 space-y-4">
          <ProjectFilter
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={['Project', 'Research', 'Tutorial']}
          />

          {selectedCategory === 'Project'  && <CreateProjectPost   onCreate={handleNewProject} />}
          {selectedCategory === 'Research' && <CreateResearchPaper onCreate={handleNewResearchPaper} />}
          {selectedCategory === 'Tutorial' && <CreateTutorial      onCreate={handleNewTutorial} />}

          {/* LISTS */}
          {selectedCategory === 'Project' && (
            loading ? (
              <div>Loading projects…</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((p) => {
                  const imageUrl = p.image
                    ? p.image.startsWith('http')
                      ? p.image
                      : API.defaults.baseURL + p.image
                    : null;

                  const leaderName =
                    p.leader_full_name ||
                    p.leader_username  ||
                    p.leader?.full_name ||
                    p.leader?.username ||
                    `User #${p.leader}`;

                  return (
                    <ProjectCard
                      key={p.project_id}
                      project_id={p.project_id}
                      title={p.title}
                      description={p.description}
                      accepting_applications={p.accepting_applications}
                      role_details={p.role_details}
                      status={p.status}
                      image={imageUrl}
                      leaderName={leaderName}

                      leaderId = {Number(p.leader)}
                      createdById = {p.created_by}
                      meId = {me?.user_id}
                      onUpdate={handleUpdateProject}
                      onDelete={handleRemoveProject}

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {researchPapers.map((paper) => {
                  const pdfUrl = paper.file_path
                    ? paper.file_path.startsWith('http')
                      ? paper.file_path
                      : API.defaults.baseURL + paper.file_path
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutorials.map((tut) => (
                  <TutorialCard
                    key={tut.tutorial_id}
                    title={tut.title}
                    filePath={tut.file_path}
                  />
                ))}
              </div>
            )
          )}
        </div>

        {/* right sidebar */}
        <div className="lg:col-span-3 space-y-4 flex flex-col">
          <Activitiy />
          <TrendingProjects />
          <Skills />
          <FriendSuggestionCard />
        </div>
      </div>

      {/* chat */}
      <div className="hidden md:block"><ChatSidebar /></div>
      <div className="fixed bottom-6 left-6 z-50"><ChatAssistant /></div>
    </div>
  );
};

export default Home;
