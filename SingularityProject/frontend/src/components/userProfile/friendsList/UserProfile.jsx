import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../../services/api';
import ProfileAvatar from '../profileAvatar';

const UserProfile = () => {
  const { id } = useParams();  
  const [user, setUser] = useState(null);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('Overview');

  useEffect(() => {
  setLoading(true);

  // Get user data
  API.get(`/users/${id}/`)
    .then(res => setUser(res.data))
    .catch(err => console.error(err));

  // Get friendship status
  API.get(`/friendships/status/${id}/`)  // Use the new endpoint
    .then(res => setFriendshipStatus(res.data.status))
    .catch(() => setFriendshipStatus('NONE'))
    .finally(() => setLoading(false));
}, [id]);

  const handleRequestAdd = () => {
  API.post(`/friendships/`, { to_user: id })  
    .then(() => setFriendshipStatus('PENDING'))
    .catch(err => console.error(err));
};

  const handleTabClick = (tab) => setSelectedTab(tab);

  if (loading || !user) return <div className="p-8 text-gray-700">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8 space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {/* Cover Banner */}
        <div className="h-40 bg-gradient-to-r from-purple-600 to-blue-500 relative">
          {/* Avatar */}
          <div className="absolute -bottom-12 left-6">
            <ProfileAvatar avatar={user.avatar} />
          </div>
        </div>

        {/* User Info */}
        <div className="pt-16 px-6 pb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{user.first_name} {user.last_name}</h2>
            <p className="text-gray-500">{user.username}</p>
          </div>
          {/* Friend Request Button */}
          {friendshipStatus === 'NONE' && (
            <button
              onClick={handleRequestAdd}
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition"
            >
              Request to Add
            </button>
          )}
          {friendshipStatus === 'PENDING' && (
            <p className="text-yellow-600 font-semibold">Request Pending</p>
          )}
          {friendshipStatus === 'ACCEPTED' && (
            <p className="text-green-600 font-semibold">You are friends</p>
          )}
          {friendshipStatus === 'REJECTED' && (
            <p className="text-red-600 font-semibold">Request Rejected</p>
          )}
          {friendshipStatus === 'BLOCKED' && (
            <p className="text-gray-600 font-semibold">User blocked</p>
          )}
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 px-6">
          <ul className="flex space-x-6 text-sm font-medium text-gray-600">
            {['Overview', 'Projects', 'Friends', 'Activity'].map(tab => (
              <li
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`cursor-pointer pb-3 border-b-2 transition ${
                  selectedTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent hover:text-blue-600'
                }`}
              >
                {tab}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Left Column - About User */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">About {user.first_name}</h3>
          <p className="text-black-600 mt-4 font-bold text-xl">{user.first_name} {user.last_name}</p>
          <p className="text-gray-600 mt-4">Email: {user.email}</p>
          <p className="text-gray-600 mt-1">Profession: {user.profession || 'N/A'}</p>
        </div>

        {/* Right Column - Dynamic Tab Content */}
        <div className="lg:col-span-2 space-y-4">
          {selectedTab === 'Overview' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">User Overview</h2>
              {/* You can add more user details here */}
              <p>More details about the user can go here...</p>
            </div>
          )}

          {selectedTab === 'Projects' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Projects</h2>
              {/* If you have projects API or static projects you can map here */}
              <p>No projects to show.</p>
            </div>
          )}

          {selectedTab === 'Friends' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Friends List</h2>
              {/* Import and render your FriendsList component here */}
              {/* <FriendsList userId={id} /> */}
              <p>Friends list component goes here.</p>
            </div>
          )}

          {selectedTab === 'Activity' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
              <p>No recent activity.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
