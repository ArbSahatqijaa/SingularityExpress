import React from 'react';
import { FaComment, FaPlus, FaUserPlus } from 'react-icons/fa'; 

const TeamCollaborationFeed = () => {
  const activities = [
    { id: 1, user: 'John Doe', action: 'joined', project: 'Project Alpha', icon: <FaUserPlus /> },
    { id: 2, user: 'Jane Smith', action: 'commented on', project: 'Project Beta', icon: <FaComment /> },
    { id: 3, user: 'Bob Brown', action: 'added a new task to', project: 'Project Gamma', icon: <FaPlus /> },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-semibold text-gray-900 mb-4">Team Collaboration Feed</h3>
      <ul className="space-y-4">
        {activities.map((activity) => (
          <li key={activity.id} className="flex items-start space-x-4 hover:bg-gray-50 p-4 rounded-lg transition-all duration-300">
            {/* User Avatar */}
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
              {activity.user[0]} {/* Display the first letter of the user */}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                {/* Activity Icon */}
                <div className="text-gray-600">{activity.icon}</div>
                <div className="font-semibold text-gray-800">{activity.user}</div>
              </div>
              <p className="text-sm text-gray-600">
                {activity.action} <span className="font-semibold text-blue-600">{activity.project}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamCollaborationFeed;
