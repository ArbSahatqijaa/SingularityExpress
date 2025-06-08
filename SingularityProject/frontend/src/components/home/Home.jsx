/* src/components/Home.jsx */
import React, { useState, useEffect } from 'react';
import ProfileCard            from './ProfileCard';
import TrendingFeed           from './TrendingFeed';
import CreateProjectPost      from './CreateProject';
import FriendSuggestionCard   from './FriendList';
import ChatAssistant          from './ChatAssistant';
import ProjectFilter          from './ProjectFilter';
import PostsFeed              from './Posts/PostsFeed';
import CreateResearchPaper    from './ResearchPaper/CreateResearchPaper';
import ResearchPaperCard      from './ResearchPaper/ResearchPaperCard';
import CreateTutorial         from './Tutorial/CreateTutorial';
import TutorialCard           from './Tutorial/TutorialCard';
import ProjectCard            from '../projectCard/projectCard';
import API from '../../services/api';

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState('Project');
  const [projects, setProjects] = useState([]);
  const [researchPapers, setResearchPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [me, setMe] = useState(null);

  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  const handleUpdateProject = (u) =>
    setProjects(arr => arr.map(p => p.project_id === u.project_id ? u : p));
  const handleRemoveProject = (id) =>
    setProjects(arr => arr.filter(p => p.project_id !== id));

  const handleUpdatePaper = (u) =>
    setResearchPapers(arr => arr.map(p => p.paper_id === u.paper_id ? u : p));
  const handleRemovePaper = (id) =>
    setResearchPapers(arr => arr.filter(p => p.paper_id !== id));

  const newestFirst = arr =>
    [...arr].sort(
      (a, b) =>
        new Date(b.created_at || 0) - new Date(a.created_at || 0) ||
        (b.project_id ?? b.paper_id ?? b.tutorial_id ?? 0) -
        (a.project_id ?? a.paper_id ?? a.tutorial_id ?? 0)
    );

  useEffect(() => {
    if (selectedCategory === 'Posts' || selectedCategory === 'Tutorial') {
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
      })
      .catch(() => setError(`Failed to load ${selectedCategory.toLowerCase()}s`))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const handleNewProject  = p => setProjects(a => [p, ...a]);
  const handleNewPaper    = p => setResearchPapers(a => [p, ...a]);
  const handleNewTutorial = t => {
    console.warn('New tutorial callback will not update local list; TutorialCard fetches fresh on mount');
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <ProfileCard user={me} />
        </div>

        <div className="lg:col-span-6 space-y-4">
          <ProjectFilter
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={['Posts', 'Project', 'Research', 'Tutorial']}
          />

          {selectedCategory === 'Project'  && <CreateProjectPost   onCreate={handleNewProject}  />}
          {selectedCategory === 'Research' && <CreateResearchPaper onCreate={handleNewPaper}    />}
          {selectedCategory === 'Tutorial' && <CreateTutorial      onCreate={handleNewTutorial} />}

          {selectedCategory === 'Posts' && <PostsFeed meId={me?.user_id} />}

          {selectedCategory === 'Project' && (
            loading ? <div>Loading projects…</div> :
            error   ? <div className="text-red-500">{error}</div> :
            <div className="flex flex-col gap-6">
              {projects.map(p => {
                const imageUrl = p.image?.startsWith('http') ? p.image : API.defaults.baseURL + p.image;
                const fileUrl  = p.file_path?.startsWith('http') ? p.file_path : API.defaults.baseURL + p.file_path;
                const leaderName = p.leader_full_name || p.leader_username || p.leader?.full_name || p.leader?.username || `User #${p.leader}`;

                return (
                  <div className="w-full">
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
                  </div>
                );
              })}
            </div>
          )}

          {selectedCategory === 'Research' && (
            loading ? <div>Loading research papers…</div> :
            error   ? <div className="text-red-500">{error}</div> :
            <div className="flex flex-col gap-6">
              {researchPapers.map(pap => {
                const pdfUrl = pap.file_path?.startsWith('http') ? pap.file_path : API.defaults.baseURL + pap.file_path;
                return (
                  <div className="w-full">
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
                      created_by={typeof pap.created_by === 'object' ? pap.created_by.user_id : pap.created_by}
                      my_role={pap.my_role}
                      meId={me?.user_id}
                      onUpdate={handleUpdatePaper}
                      onDelete={handleRemovePaper}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {selectedCategory === 'Tutorial' && (
            <div className="flex flex-col gap-6">
              <TutorialCard meId={me?.user_id} />
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-4 flex flex-col">
          <TrendingFeed />
          <FriendSuggestionCard />
        </div>
      </div>

      <div className="fixed bottom-6 left-6 z-50"><ChatAssistant /></div>
    </div>
  );
};

export default Home;
