import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../../services/api';
import ProfileAvatar from '../profileAvatar';
import { useNotifications } from '../../../contexts/NotificationContext';
import { useWebSocket } from '../../../contexts/WebSocketContext';
import OtherOverview from './OtherOverview';
import FriendsList from './FriendsList';

const UserProfile = () => {
  const { id } = useParams();  
  const [user, setUser] = useState(null);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('Overview');
  const [friendshipId, setFriendshipId] = useState(null);
  const [requestDirection, setRequestDirection] = useState(null); // 'sent' or 'received'
  const { addNotification } = useNotifications();
  const { sendMessage } = useWebSocket();
  const processedEvents = useRef(new Set());
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // Function to check friendship status
  const checkFriendshipStatus = () => {
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
  };

  // Initial data fetch
  useEffect(() => {
    console.log('useEffect fired with id:', id);
    setLoading(true);

    API.get(`/users/${id}/`)
      .then(res => {
        console.log('User response:', res.data);
        setUser(res.data);
      })
      .catch(err => console.error('User fetch error:', err));

    checkFriendshipStatus();
  }, [id]);

  // WebSocket message handler
  useEffect(() => {
    const handleWebSocketMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type !== 'broadcast.friendship') return;

        const eventId = `${data.action}_${data.friendship_id}_${data.timestamp}`;
        if (processedEvents.current.has(eventId)) {
          console.log('Skipping duplicate event:', eventId);
          return;
        }
        processedEvents.current.add(eventId);

        // Clean up old event IDs
        if (processedEvents.current.size > 1000) {
          const idsToKeep = Array.from(processedEvents.current).slice(-1000);
          processedEvents.current.clear();
          idsToKeep.forEach(id => processedEvents.current.add(id));
        }

        // Handle friendship events
        if (data.friendship_id === friendshipId || 
            (data.from_user === currentUser?.user_id && data.to_user === parseInt(id)) ||
            (data.to_user === currentUser?.user_id && data.from_user === parseInt(id))) {
          
          switch (data.action) {
            case 'friendship_request_sent':
              setFriendshipStatus('PENDING');
              setFriendshipId(data.friendship_id);
              setRequestDirection(data.from_user === currentUser?.user_id ? 'sent' : 'received');
              break;

            case 'friendship_request_accepted':
              setFriendshipStatus('ACCEPTED');
              break;

            case 'friendship_request_rejected':
              setFriendshipStatus('REJECTED');
              break;

            case 'friendship_deleted':
              setFriendshipStatus('NONE');
              setFriendshipId(null);
              setRequestDirection(null);
              break;
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    // Add WebSocket message listener
    const ws = new WebSocket(`ws://localhost:8000/ws/communication/?token=${localStorage.getItem('token')}`);
    ws.onmessage = handleWebSocketMessage;

    return () => {
      ws.close();
    };
  }, [id, friendshipId, currentUser?.user_id]);

  const handleRequestAdd = () => {
    API.post(`/friendships/`, { to_user: id })  
      .then((response) => {
        setFriendshipStatus('PENDING');
        setFriendshipId(response.data.id);
        setRequestDirection('sent');
        
        // Send WebSocket notification
        sendMessage({
          action: 'friendship_request_sent',
          friendship_id: response.data.id,
          from_user: currentUser?.user_id,
          to_user: parseInt(id),
          from_user_details: {
            user_id: currentUser?.user_id,
            first_name: currentUser?.first_name,
            last_name: currentUser?.last_name,
            avatar: currentUser?.avatar,
            profession: currentUser?.profession,
            academic_title: currentUser?.academic_title
          },
          to_user_details: {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar: user.avatar,
            profession: user.profession,
            academic_title: user.academic_title
          },
          timestamp: new Date().toISOString()
        });
      })
      .catch(err => console.error(err));
  };

  const handleAccept = () => {
    if (!friendshipId) return;
    
    API.patch(`/friendships/${friendshipId}/`, { status: 'ACCEPTED' })
      .then(() => {
        setFriendshipStatus('ACCEPTED');
        
        // Send WebSocket notification
        sendMessage({
          action: 'friendship_request_accepted',
          friendship_id: friendshipId,
          from_user: parseInt(id),
          to_user: currentUser?.user_id,
          from_user_details: {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar: user.avatar,
            profession: user.profession,
            academic_title: user.academic_title
          },
          to_user_details: {
            user_id: currentUser?.user_id,
            first_name: currentUser?.first_name,
            last_name: currentUser?.last_name,
            avatar: currentUser?.avatar,
            profession: currentUser?.profession,
            academic_title: currentUser?.academic_title
          },
          timestamp: new Date().toISOString()
        });
      })
      .catch(err => console.error(err));
  };

  const handleReject = () => {
    if (!friendshipId) return;
    
    API.patch(`/friendships/${friendshipId}/`, { status: 'REJECTED' })
      .then(() => {
        setFriendshipStatus('REJECTED');
        
        // Send WebSocket notification
        sendMessage({
          action: 'friendship_request_rejected',
          friendship_id: friendshipId,
          from_user: parseInt(id),
          to_user: currentUser?.user_id,
          from_user_details: {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar: user.avatar,
            profession: user.profession,
            academic_title: user.academic_title
          },
          to_user_details: {
            user_id: currentUser?.user_id,
            first_name: currentUser?.first_name,
            last_name: currentUser?.last_name,
            avatar: currentUser?.avatar,
            profession: currentUser?.profession,
            academic_title: currentUser?.academic_title
          },
          timestamp: new Date().toISOString()
        });
      })
      .catch(err => console.error(err));
  };

  const handleRemove = () => {
    if (!friendshipId) return;
    
    API.delete(`/friendships/${friendshipId}/`)
      .then(() => {
        setFriendshipStatus('NONE');
        setFriendshipId(null);
        setRequestDirection(null);
        
        // Send WebSocket notification
        sendMessage({
          action: 'friendship_deleted',
          friendship_id: friendshipId,
          from_user: currentUser?.user_id,
          to_user: parseInt(id),
          from_user_details: {
            user_id: currentUser?.user_id,
            first_name: currentUser?.first_name,
            last_name: currentUser?.last_name,
            avatar: currentUser?.avatar,
            profession: currentUser?.profession,
            academic_title: currentUser?.academic_title
          },
          to_user_details: {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar: user.avatar,
            profession: user.profession,
            academic_title: user.academic_title
          },
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
            {['Overview'].map((tab, index) => (
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
          {selectedTab === 'Overview' && <OtherOverview user={user} />}

          
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
