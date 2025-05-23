import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../../services/api';
import ProfileAvatar from '../profileAvatar';
import { useNotifications } from '../../../contexts/NotificationContext';

const UserProfile = () => {
  const { id } = useParams();  
  const [user, setUser] = useState(null);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('Overview');
  const [friendshipId, setFriendshipId] = useState(null);
  const [requestDirection, setRequestDirection] = useState(null); // 'sent' or 'received'
  const { addNotification } = useNotifications();

  useEffect(() => {
  console.log('useEffect fired with id:', id);

  setLoading(true);

  API.get(`/users/${id}/`)
    .then(res => {
      console.log('User response:', res.data);
      setUser(res.data);
    })
    .catch(err => console.error('User fetch error:', err));

  API.get(`/friendships/status/${id}/`)
    .then(res => {
      console.log('Friendship status response:', res.data);
      setFriendshipStatus(res.data.status);
      if (res.data.id) {
        setFriendshipId(res.data.id);
        if (res.data.status === 'PENDING') {
          if (res.data.from_user && res.data.from_user.hasOwnProperty('is_self')) {
            setRequestDirection(res.data.from_user.is_self ? 'sent' : 'received');
          } else {
            setRequestDirection(res.data.from_user?.user_id !== parseInt(id) ? 'sent' : 'received');
          }
        }
      }
    })
    .catch(err => console.error('Friendship status fetch error:', err))
    .finally(() => setLoading(false));
}, [id]);

  const handleRequestAdd = () => {
    API.post(`/friendships/`, { to_user: id })  
      .then((response) => {
        setFriendshipStatus('PENDING');
        setFriendshipId(response.data.id);
        setRequestDirection('sent');
        addNotification({
          type: 'friendship',
          title: 'Friend Request Sent',
          message: `You sent a friend request to ${user.first_name} ${user.last_name}`,
          timestamp: new Date().toISOString()
        });
      })
      .catch(err => console.error(err));
  };

  // Handle accepting friend request
  const handleAccept = () => {
    if (!friendshipId) return;
    
    API.patch(`/friendships/${friendshipId}/`, { status: 'ACCEPTED' })
      .then(() => {
        setFriendshipStatus('ACCEPTED');
        addNotification({
          type: 'friendship',
          title: 'Friend Request Accepted',
          message: `You are now friends with ${user.first_name} ${user.last_name}`,
          timestamp: new Date().toISOString()
        });
      })
      .catch(err => console.error(err));
  };

  // Handle rejecting friend request
  const handleReject = () => {
    if (!friendshipId) return;
    
    API.patch(`/friendships/${friendshipId}/`, { status: 'REJECTED' })
      .then(() => {
        setFriendshipStatus('REJECTED');
        addNotification({
          type: 'friendship',
          title: 'Friend Request Rejected!',
          message: `You rejected the friend request from ${user.first_name} ${user.last_name}`,
          timestamp: new Date().toISOString()
        });
      })
      .catch(err => console.error(err));
  };

  const handleRemove = () => {
    if (!friendshipId) return;
    
    API.patch(`/friendships/${friendshipId}/`, { status: 'REJECTED' })
      .then(() => {
        setFriendshipStatus('REMOVED');
        addNotification({
          type: 'friendship',
          title: 'Friend Removed!',
          message: `You removed ${user.first_name} ${user.last_name}`,
          timestamp: new Date().toISOString()
        });
      })
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
          {/* Friend Request Buttons */}
          {friendshipStatus === 'NONE' && (
            <button
              onClick={handleRequestAdd}
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition"
            >
              Request to Add
            </button>
          )}
          {friendshipStatus === 'PENDING' && requestDirection === 'sent' && (
            <p className="text-yellow-600 font-semibold">Request Pending</p>
          )}
          {friendshipStatus === 'PENDING' && requestDirection === 'received' && (
            <div className="flex space-x-2">
              <button
                onClick={handleAccept}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
              >
                Accept
              </button>
              <button
                onClick={handleReject}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                Decline
              </button>
            </div>
          )}
         {friendshipStatus === 'ACCEPTED' && (
  <>
    <div className="flex items-center space-x-4">
      <p className="text-green-600 font-semibold">You are friends</p>
      <button
        onClick={handleRemove}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
      >
        Remove
      </button>
    </div>
  </>
)}
          {friendshipStatus === 'REJECTED' && (
            <p className="text-red-600 font-semibold">Request Rejected</p>
          )}
          {friendshipStatus === 'BLOCKED' && (
            <p className="text-gray-600 font-semibold">User blocked</p>
          )}
          {friendshipStatus === 'REMOVED' && (
            <p className="text-red-600 font-semibold">Friend Removed</p>
          )}
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 px-6">
          <ul className="flex space-x-6 text-sm font-medium text-gray-600">
            {['Overview', 'Projects', 'Friends', 'Activity'].map((tab, index) => (
              <li
                key={`${tab}-${index}`}
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
