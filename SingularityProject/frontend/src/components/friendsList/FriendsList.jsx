import React, { useEffect, useState, useRef } from 'react';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { useWebSocket } from '../../contexts/WebSocketContext';

const WS_URL = 'ws://localhost:8000/ws/communication/';

const FriendsList = () => {
  const [friendships, setFriendships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { sendMessage } = useWebSocket();
  const wsRef = useRef(null);
  const processedEvents = useRef(new Set());

  // Function to fetch friendships
  const fetchFriendships = () => {
    API.get('/friendships/')
      .then(({ data }) => {
        setFriendships(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching friendships:', error);
        setLoading(false);
      });
  };

  // Get current user on mount
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      const userData = JSON.parse(atob(token.split('.')[1]));
      setCurrentUser({
        user_id: userData.user_id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        avatar: userData.avatar,
        profession: userData.profession,
        academic_title: userData.academic_title
      });
    }
  }, []);

  useEffect(() => {
    fetchFriendships();
  }, []);

  // Set up WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected for friend list');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received in FriendsList:', data);

      // Skip if we've already processed this event
      const eventId = `${data.action}_${data.friendship_id || data.from_user}_${Date.now()}`;
      if (processedEvents.current.has(eventId)) {
        console.log('Skipping duplicate event:', eventId);
        return;
      }
      processedEvents.current.add(eventId);

      // Clean up old event IDs periodically
      if (processedEvents.current.size > 1000) {
        const idsToKeep = Array.from(processedEvents.current).slice(-1000);
        processedEvents.current = new Set(idsToKeep);
      }

      switch (data.action) {
        case 'friendship_request_sent':
          // Add the new request to the state immediately
          setFriendships(prevFriendships => {
            const newFriendship = {
              id: data.friendship_id,
              status: 'PENDING',
              from_user: data.from_user,
              to_user_details: {
                is_self: true,
                user_id: data.to_user
              },
              created_at: data.timestamp
            };
            return [...prevFriendships, newFriendship];
          });

          // Show notification
          addNotification({
            type: 'friendship',
            title: 'New Friend Request',
            message: `${data.from_user.first_name} ${data.from_user.last_name} sent you a friend request`,
            timestamp: data.timestamp,
            friendshipId: data.friendship_id
          });
          break;

        case 'friendship_request_accepted':
          // Update the friendship status in the state
          setFriendships(prevFriendships => 
            prevFriendships.map(f => 
              f.id === data.friendship_id 
                ? { ...f, status: 'ACCEPTED' }
                : f
            )
          );
          break;

        case 'friendship_request_rejected':
          // Remove the rejected friendship from the state
          setFriendships(prevFriendships => 
            prevFriendships.filter(f => f.id !== data.friendship_id)
          );
          break;
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected, attempting to reconnect...');
      setTimeout(() => {
        if (wsRef.current) {
          wsRef.current = new WebSocket(`${WS_URL}?token=${token}`);
        }
      }, 3000);
    };

    // Initial fetch
    fetchFriendships();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Handle accepting friend request
  const handleAccept = (friendshipId, fromUser) => {
    API.patch(`/friendships/${friendshipId}/`, { status: 'ACCEPTED' })
      .then(() => {
        // Send WebSocket notification
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const eventId = `accept_friendship_request_${friendshipId}_${Date.now()}`;
          processedEvents.current.add(eventId);
          
          wsRef.current.send(JSON.stringify({
            action: 'friendship_request_accepted',
            friendship_id: friendshipId,
            from_user: fromUser.user_id,
            to_user: currentUser?.user_id,
            from_user_details: fromUser,
            to_user_details: {
              user_id: currentUser?.user_id,
              first_name: currentUser?.first_name,
              last_name: currentUser?.last_name,
              avatar: currentUser?.avatar,
              profession: currentUser?.profession,
              academic_title: currentUser?.academic_title
            },
            event_id: eventId,
            timestamp: new Date().toISOString()
          }));
        }
        
        fetchFriendships();
      })
      .catch((error) => {
        console.error('Error accepting friend request:', error);
        setError('Failed to accept friend request');
      });
  };

  // Handle rejecting friend request
  const handleReject = (friendshipId, fromUser) => {
    API.patch(`/friendships/${friendshipId}/`, { status: 'REJECTED' })
      .then(() => {
        // Send WebSocket notification
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const eventId = `reject_friendship_request_${friendshipId}_${Date.now()}`;
          processedEvents.current.add(eventId);
          
          wsRef.current.send(JSON.stringify({
            action: 'friendship_request_rejected',
            friendship_id: friendshipId,
            from_user: fromUser.user_id,
            to_user: currentUser?.user_id,
            from_user_details: fromUser,
            to_user_details: {
              user_id: currentUser?.user_id,
              first_name: currentUser?.first_name,
              last_name: currentUser?.last_name,
              avatar: currentUser?.avatar,
              profession: currentUser?.profession,
              academic_title: currentUser?.academic_title
            },
            event_id: eventId,
            timestamp: new Date().toISOString()
          }));
        }
        
        fetchFriendships();
      })
      .catch((error) => {
        console.error('Error rejecting friend request:', error);
        setError('Failed to reject friend request');
      });
  };

  // Navigate to user profile
  const viewProfile = (userId) => {
    navigate(`/users/${userId}`);
  };

  if (loading) return <div>Loading friends...</div>;

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  // Separate friendships by status
  const sentRequests = friendships.filter(
    f => f.status === 'PENDING' && f.from_user.is_self
  );
  const receivedRequests = friendships.filter(
    f => f.status === 'PENDING' && f.to_user_details.is_self
  );
  const acceptedFriendships = friendships.filter(
    f => f.status === 'ACCEPTED'
  );

  return (
    <div className="space-y-8">
      {/* ===== Friend Requests ===== */}
      {receivedRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Friend Requests</h2>
          <div className="space-y-3">
            {receivedRequests.map(f => (
              <div key={f.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">
                    {f.from_user.first_name} {f.from_user.last_name}
                  </p>
                  <p className="text-sm text-gray-500">Wants to connect</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => viewProfile(f.from_user.user_id)}
                    className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleAccept(f.id, f.from_user)}
                    className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(f.id, f.from_user)}
                    className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== Your Friends ===== */}
      {acceptedFriendships.length > 0 ? (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Your Friends</h2>
          <div className="space-y-3">
            {acceptedFriendships.map(f => {
              const other = f.from_user.is_self
                ? f.to_user_details
                : f.from_user;
              return (
                <div key={f.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {other.first_name} {other.last_name}
                    </p>
                    <p className="text-sm text-gray-500">Status: {f.status}</p>
                  </div>
                  <button
                    onClick={() => viewProfile(other.user_id)}
                    className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded"
                  >
                    View Profile
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-gray-600">You have no friends yet.</div>
      )}

      {/* ===== Sent Requests ===== */}
      {sentRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Sent Requests</h2>
          <div className="space-y-3">
            {sentRequests.map(f => (
              <div key={f.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">
                    {f.to_user_details.first_name} {f.to_user_details.last_name}
                  </p>
                  <p className="text-sm text-gray-500">Request pending</p>
                </div>
                <button
                  onClick={() => viewProfile(f.to_user_details.user_id)}
                  className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsList;
