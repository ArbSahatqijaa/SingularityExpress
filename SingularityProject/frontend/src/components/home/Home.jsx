/* src/components/Home.jsx */
import React, { useState, useEffect } from 'react';
import ProfileCard            from './ProfileCard';
import ChatSidebar            from './ChatSidebar';
import TrendingFeed      from './TrendingFeed';
import TeamCollaborationFeed  from './TeamCollaborationFeed';
import Skills                 from './SkillHighlights';
import CreateProjectPost      from './CreateProject';
import FriendSuggestionCard   from './FriendList';
import ProfileDashboard       from './ProfileDashboard';
import ChatAssistant          from './ChatAssistant';
import ProjectFilter          from './ProjectFilter';
import PostsFeed              from './Posts/PostsFeed';           // NEW

/* paper + tutorial imports */
import CreateResearchPaper    from './ResearchPaper/CreateResearchPaper';
import ResearchPaperCard      from './ResearchPaper/ResearchPaperCard';
import CreateTutorial         from './Tutorial/CreateTutorial';
import TutorialCard           from './Tutorial/TutorialCard';     // THIS fetches & renders all tutorials

/* project card */
import ProjectCard            from '../projectCard/projectCard';

import API from '../../services/api';

const Home = () => {
  /* Default to "Project" (or change to "Posts" if you prefer) */
  const [selectedCategory, setSelectedCategory] = useState('Project');

  const [projects,       setProjects]       = useState([]);
  const [researchPapers, setResearchPapers] = useState([]);
  /* We no longer need a local `tutorials` array in Home.jsx */
  // const [tutorials,      setTutorials]      = useState([]);

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const [me, setMe] = useState(null);

  /* fetch current user once */
  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => setMe(data))
      .catch(()        => setMe(null));
  }, []);

  /* ---------- update / remove helpers for Project & Paper ---------- */
  const handleUpdateProject = (u) =>
    setProjects(arr => arr.map(p => p.project_id === u.project_id ? u : p));
  const handleRemoveProject = (id) =>
    setProjects(arr => arr.filter(p => p.project_id !== id));

  const handleUpdatePaper = (u) =>
    setResearchPapers(arr => arr.map(p => p.paper_id === u.paper_id ? u : p));
  const handleRemovePaper = (id) =>
    setResearchPapers(arr => arr.filter(p => p.paper_id !== id));

  /* newest-first util */
  const newestFirst = arr =>
    [...arr].sort(
      (a, b) =>
        new Date(b.created_at || 0) - new Date(a.created_at || 0) ||
        (b.project_id ?? b.paper_id ?? b.tutorial_id ?? 0) -
        (a.project_id ?? a.paper_id   ?? a.tutorial_id  ?? 0)
    );

  /* FETCH list whenever category changes (skip Posts & skip Tutorials here) */
  useEffect(() => {
    if (selectedCategory === 'Posts' || selectedCategory === 'Tutorial') {
      // If "Posts" or "Tutorial" is selected, do not run this legacy fetch
      setLoading(false);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    const endpoint =
      selectedCategory === 'Project'  ? '/projects/' :
      selectedCategory === 'Research' ? '/papers/'   :
                                        '/tutorials/';

    API.get(endpoint)
      .then(({ data }) => {
        if (selectedCategory === 'Project')  setProjects      (newestFirst(data));
        if (selectedCategory === 'Research') setResearchPapers(newestFirst(data));
        /* We removed the local `tutorials` state, so we do NOT setTutorials() here */
      })
      .catch(() => setError(`Failed to load ${selectedCategory.toLowerCase()}s`))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  /* prepend callbacks */
  const handleNewProject  = p => setProjects      (a => [p, ...a]);
  const handleNewPaper    = p => setResearchPapers(a => [p, ...a]);
  const handleNewTutorial = t => {
    console.warn('New tutorial callback will not update local list; TutorialCard fetches fresh on mount');
  };

  /* ---------- RENDER ---------- */
  return (
    <div className="bg-gray-100 min-h-screen p-4 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ---------- LEFT SIDEBAR ---------- */}
        <div className="lg:col-span-3 space-y-4">
          <ProfileCard user = {me}/>
          <ProfileDashboard />
          <TeamCollaborationFeed />
        </div>

        {/* ---------- MAIN COLUMN ---------- */}
        <div className="lg:col-span-6 space-y-4">
          <ProjectFilter
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={['Posts', 'Project', 'Research', 'Tutorial']}
          />

          {/* no create form when on Posts */}
          {selectedCategory === 'Project'  && <CreateProjectPost   onCreate={handleNewProject}  />}
          {selectedCategory === 'Research' && <CreateResearchPaper onCreate={handleNewPaper}    />}
          {selectedCategory === 'Tutorial' && <CreateTutorial      onCreate={handleNewTutorial} />}

          {/* -------- POSTS (combined feed) -------- */}
          {selectedCategory === 'Posts' && (
            <PostsFeed meId={me?.user_id} />
          )}

          {/* ------------ LISTS ------------ */}

          {selectedCategory === 'Project' && (
            loading ? <div>Loading projects…</div> :
            error   ? <div className="text-red-500">{error}</div> :
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(p => {
                const imageUrl = p.image
                  ? (p.image.startsWith('http') ? p.image : API.defaults.baseURL + p.image)
                  : null;

                const fileUrl = p.file_path
                  ? (p.file_path.startsWith('http') ? p.file_path : API.defaults.baseURL + p.file_path)
                  : null;

                const leaderName =
                  p.leader_full_name || p.leader_username ||
                  p.leader?.full_name || p.leader?.username ||
                  `User #${p.leader}`;

                return (
                  <ProjectCard
                    key={p.project_id}
                    {...p}
                    image={imageUrl}
                    fileUrl={fileUrl}
                    leaderName={leaderName}
                    leaderId={Number(p.leader)}
                    myRole={p.my_role}
                    createdById={p.created_by}
                    meId={me?.user_id}
                    onUpdate={handleUpdateProject}
                    onDelete={handleRemoveProject}
                  />
                );
              })}
            </div>
          )}

          {selectedCategory === 'Research' && (
            loading ? <div>Loading research papers…</div> :
            error   ? <div className="text-red-500">{error}</div> :
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {researchPapers.map(pap => {
                const pdfUrl = pap.file_path
                  ? (pap.file_path.startsWith('http') ? pap.file_path : API.defaults.baseURL + pap.file_path)
                  : null;

                return (
                  <ResearchPaperCard
                    key={pap.paper_id}
                    paper_id={pap.paper_id}
                    title={pap.title}
                    description={pap.description}
                    role_details={pap.role_details}
                    accepting_applications={pap.accepting_applications}
                    status={pap.status}
                    authors={pap.authors || []}
                    file_path={pdfUrl}
                    created_by={typeof pap.created_by === 'object'
                      ? pap.created_by.user_id
                      : pap.created_by}
                    my_role={pap.my_role}
                    meId={me?.user_id}
                    onUpdate={handleUpdatePaper}
                    onDelete={handleRemovePaper}
                  />
                );
              })}
            </div>
          )}

          {selectedCategory === 'Tutorial' && (
            <TutorialCard />
          )}
        </div>

        {/* ---------- RIGHT SIDEBAR ---------- */}
        <div className="lg:col-span-3 space-y-4 flex flex-col">
          <TrendingFeed />
          <FriendSuggestionCard />
        </div>
      </div>

      {/* floating chat */}
      <div className="fixed bottom-6 left-6 z-50"><ChatAssistant /></div>
    </div>
  );
};

export default Home;
