// src/components/friends/FriendSuggestionCard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Check, X } from 'lucide-react';
import API from '../../services/api';
import { useNotifications } from '../../contexts/NotificationContext';
import { useWebSocket } from '../../contexts/WebSocketContext';

const FriendSuggestionCard = ({ user }) => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { sendMessage } = useWebSocket();
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);
  const processedEvents = useRef(new Set());
  const defaultAvatar = "/default_images/default-avatar.svg";
  const baseURL = API.defaults.baseURL;
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // Check initial friendship status
  useEffect(() => {
    const checkFriendshipStatus = async () => {
      try {
        const response = await API.get(`/friendships/status/${user.user_id}/`);
        setRequestStatus(response.data.status);
      } catch (error) {
        console.error('Error checking friendship status:', error);
      }
    };
    checkFriendshipStatus();
  }, [user.user_id]);

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

        // Handle friendship events for this user
        if ((data.from_user === currentUser?.user_id && data.to_user === user.user_id) ||
            (data.to_user === currentUser?.user_id && data.from_user === user.user_id)) {
          
          switch (data.action) {
            case 'friendship_request_sent':
              setRequestStatus('PENDING');
              break;

            case 'friendship_request_accepted':
              setRequestStatus('ACCEPTED');
              break;

            case 'friendship_request_rejected':
              setRequestStatus('REJECTED');
              break;

            case 'friendship_deleted':
              setRequestStatus('NONE');
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
  }, [user.user_id, currentUser?.user_id]);

  // Handle avatar URL construction
  const getAvatarUrl = (avatar) => {
    if (!avatar) return defaultAvatar;
    if (avatar.startsWith('http')) return avatar;
    if (avatar.startsWith('/media/')) {
      return `${baseURL}${avatar}`;
    }
    if (avatar.startsWith('/')) {
      return `${baseURL}/media${avatar}`;
    }
    return `${baseURL}/media/avatars/${avatar}`;
  };

  if (!user) return null;

  const handleProfileClick = () => {
    navigate(`/users/${user.user_id}`);
  };

  const handleAddFriend = async (e) => {
    e.stopPropagation(); // Prevent profile navigation
    if (loading || requestStatus === 'PENDING') return;

    setLoading(true);
    try {
      // Send friend request
      const response = await API.post('/friendships/', { to_user: user.user_id });
      
      // Send WebSocket notification
      sendMessage({
        action: 'friendship_request_sent',
        friendship_id: response.data.id,
        from_user: currentUser?.user_id,
        to_user: user.user_id,
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

      setRequestStatus('PENDING');
    } catch (err) {
      console.error('Error sending friend request:', err);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to send friend request. Please try again.',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:shadow-sm transition ${
        loading || requestStatus === 'PENDING' ? 'opacity-50' : ''
      }`} 
    >
      <div 
        className="flex items-center gap-3 cursor-pointer"
        onClick={handleProfileClick}
      >
        <img 
          src={getAvatarUrl(user.avatar)} 
          alt={`${user.first_name} ${user.last_name}`} 
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultAvatar;
          }}
        />
        <div>
          <p className="text-sm font-medium text-gray-800 hover:text-blue-600 transition">
            {user.first_name} {user.last_name}
            {requestStatus === 'PENDING' && (
              <span className="ml-2 text-xs text-gray-500">(Request sent)</span>
            )}
            {requestStatus === 'ACCEPTED' && (
              <span className="ml-2 text-xs text-green-500">(Friends)</span>
            )}
            {requestStatus === 'REJECTED' && (
              <span className="ml-2 text-xs text-red-500">(Request rejected)</span>
            )}
          </p>
          <p className="text-xs text-gray-500">{user.profession || 'User'}</p>
          <p className="text-xs text-gray-400 italic">{user.academic_title || ''}</p>
        </div>
      </div>
      
      <div className="flex items-center">
        {requestStatus === 'PENDING' ? (
          <div className="flex items-center gap-1 text-gray-400">
            <Check className="w-4 h-4" />
            <span className="text-xs">Sent</span>
          </div>
        ) : requestStatus === 'ACCEPTED' ? (
          <div className="flex items-center gap-1 text-green-500">
            <Check className="w-4 h-4" />
            <span className="text-xs">Friends</span>
          </div>
        ) : requestStatus === 'REJECTED' ? (
          <div className="flex items-center gap-1 text-red-500">
            <X className="w-4 h-4" />
            <span className="text-xs">Rejected</span>
          </div>
        ) : (
          <button
            onClick={handleAddFriend}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
              'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
            disabled={loading}
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Friend</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FriendSuggestionCard;
