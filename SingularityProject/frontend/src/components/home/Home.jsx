/* src/components/Home.jsx */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileCard            from './ProfileCard';
import TrendingFeed           from './TrendingFeed';
import CreateProjectPost      from './CreateProject';
import FriendList             from './FriendList';
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

  const defaultProjectImage = "/default_images/default-project.svg";

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-gray-100 min-h-screen p-4 relative"
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4"
      >
        <motion.div variants={itemVariants} className="lg:col-span-3 space-y-4">
          <ProfileCard user={me} />
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-6 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ProjectFilter
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={['Posts', 'Project', 'Research', 'Tutorial']}
            />
          </motion.div>

          <AnimatePresence mode="wait">
            {selectedCategory === 'Project' && (
              <motion.div
                key="project-create"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <CreateProjectPost onCreate={handleNewProject} />
              </motion.div>
            )}
            {selectedCategory === 'Research' && (
              <motion.div
                key="research-create"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <CreateResearchPaper onCreate={handleNewPaper} />
              </motion.div>
            )}
            {selectedCategory === 'Tutorial' && (
              <motion.div
                key="tutorial-create"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <CreateTutorial onCreate={handleNewTutorial} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {selectedCategory === 'Posts' && (
              <motion.div
                key="posts-feed"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <PostsFeed meId={me?.user_id} />
              </motion.div>
            )}

            {selectedCategory === 'Project' && (
              <motion.div
                key="projects-list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {loading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-4"
                  >
                    Loading projects…
                  </motion.div>
                ) : error ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-center py-4"
                  >
                    {error}
                  </motion.div>
                ) : (
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-6"
                  >
                    {projects.map((p, index) => {
                      const imageUrl = p.image?.startsWith('http') 
                        ? p.image 
                        : p.image 
                          ? API.defaults.baseURL + p.image 
                          : defaultProjectImage;
                      const fileUrl = p.file_path?.startsWith('http') 
                        ? p.file_path 
                        : API.defaults.baseURL + p.file_path;
                      const leaderName = p.leader_full_name || p.leader_username || 
                        p.leader?.full_name || p.leader?.username || `User #${p.leader}`;

                      return (
                        <motion.div
                          key={p.project_id}
                          variants={itemVariants}
                          custom={index}
                          className="w-full"
                        >
                          <ProjectCard
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
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </motion.div>
            )}

            {selectedCategory === 'Research' && (
              <motion.div
                key="research-list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {loading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-4"
                  >
                    Loading research papers…
                  </motion.div>
                ) : error ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-center py-4"
                  >
                    {error}
                  </motion.div>
                ) : (
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-6"
                  >
                    {researchPapers.map((pap, index) => {
                      const pdfUrl = pap.file_path?.startsWith('http') 
                        ? pap.file_path 
                        : API.defaults.baseURL + pap.file_path;
                      return (
                        <motion.div
                          key={pap.paper_id}
                          variants={itemVariants}
                          custom={index}
                          className="w-full"
                        >
                          <ResearchPaperCard
                            paper_id={pap.paper_id}
                            title={pap.title}
                            description={pap.description}
                            role_details={pap.role_details}
                            accepting_applications={pap.accepting_applications}
                            status={pap.status}
                            authors={pap.authors || []}
                            file_path={pdfUrl}
                            visibility={pap.visibility}
                            created_by={typeof pap.created_by === 'object' ? pap.created_by.user_id : pap.created_by}
                            my_role={pap.my_role}
                            meId={me?.user_id}
                            onUpdate={handleUpdatePaper}
                            onDelete={handleRemovePaper}
                          />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </motion.div>
            )}

            {selectedCategory === 'Tutorial' && (
              <motion.div
                key="tutorial-list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-6"
              >
                <TutorialCard meId={me?.user_id} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-3 space-y-4 flex flex-col">
          <TrendingFeed />
          <FriendList />
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 left-6 z-50"
      >
        <ChatAssistant />
      </motion.div>
    </motion.div>
  );
};

export default Home;
