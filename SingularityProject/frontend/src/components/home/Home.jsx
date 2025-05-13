import React from 'react';
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
import WorkActivityHeatmap from './WorkActivity'; 
const Home = () => {
  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Profile */}
        <div className="lg:col-span-3 space-y-4">
          <ProfileCard />
          <ProfileDashboard/>
          <TeamCollaborationFeed />
          <WorkActivityHeatmap/>
          <TodoTasks />

        </div>

        {/* Center Column: Featured Projects */}
        <div className="lg:col-span-6 space-y-4">
          <CreateProjectPost />
          <FeaturedProjects />
        </div>

        {/* Right Column: Trending Projects, Skill , Friend List*/}
        <div className="lg:col-span-3 space-y-4">
          <Activitiy/>
          <TrendingProjects/>
          <Skills/>
          <FriendSuggestionCard/>
        </div>

        {/* Chat Sidebar */}
        <div className="hidden md:block lg:block">
          <ChatSidebar />
        </div>
      </div>
    </div>
  );
};

export default Home;
