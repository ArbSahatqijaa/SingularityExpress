import React, { useState } from 'react';
import { FaProjectDiagram, FaUsers, FaSave, FaCalendarAlt } from 'react-icons/fa'; 

const ProfileDashboard = () => {
  const [activeTab, setActiveTab] = useState('projects'); 

  const content = {
    projects: 'Here are your trending projects, you can manage and collaborate with the team.',
    team: 'View your team members and collaborate with them on different tasks.',
    saved: 'Check all the projects, tasks, and resources you have saved.',
    events: 'See upcoming events, meetings, and deadlines related to your projects.',
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
      <div className="flex justify-around mb-6">
        {/* Projects */}
        <div
          className={`text-center p-4 cursor-pointer ${activeTab === 'projects' ? 'text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('projects')}
        >
          <FaProjectDiagram size={30} />
          <p className="mt-2 text-sm font-semibold">Projects</p>
        </div>
        
        {/* Team */}
        <div
          className={`text-center p-4 cursor-pointer ${activeTab === 'team' ? 'text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('team')}
        >
          <FaUsers size={30} />
          <p className="mt-2 text-sm font-semibold">Team</p>
        </div>
        
        {/* Saved */}
        <div
          className={`text-center p-4 cursor-pointer ${activeTab === 'saved' ? 'text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('saved')}
        >
          <FaSave size={30} />
          <p className="mt-2 text-sm font-semibold">Saved</p>
        </div>
        
        {/* Events */}
        <div
          className={`text-center p-4 cursor-pointer ${activeTab === 'events' ? 'text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('events')}
        >
          <FaCalendarAlt size={30} />
          <p className="mt-2 text-sm font-semibold">Events</p>
        </div>
      </div>

      {/* Content Display */}
      <div className="mt-4">
        <p className="text-gray-700 text-sm">{content[activeTab]}</p>
      </div>
    </div>
  );
};

export default ProfileDashboard;
