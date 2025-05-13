import React from 'react';

const activities = [
  {
    id: 1,
    user: 'John Doe',
    action: 'posted a new project',
    project: 'Project Alpha',
    time: '5 minutes ago',
  },
  {
    id: 2,
    user: 'Jane Smith',
    action: 'commented on your post',
    project: 'Project Beta',
    time: '30 minutes ago',
  },
  {
    id: 3,
    user: 'Mike Lee',
    action: 'liked your project',
    project: 'Project Gamma',
    time: '1 hour ago',
  },
  // More activities...
];

const RecentActivityFeed = () => {
  return (
    <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 hover:bg-gray-50 rounded-lg p-4 transition duration-300 relative">
            <div className="flex-shrink-0">
              {/* Add user avatar */}
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                {activity.user[0]} {/* Display the first letter of the user */}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-800">
                <span className="font-semibold">{activity.user}</span> {activity.action}{' '}
                <span className="font-semibold text-blue-600">{activity.project}</span>
              </div>
              <div className="text-xs text-gray-500">{activity.time}</div>
            </div>

         
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivityFeed;
