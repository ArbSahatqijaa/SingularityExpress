import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';

const FriendsList = () => {
  const [friendships, setFriendships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

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

  useEffect(() => {
    fetchFriendships();
  }, []);

  // Handle accepting friend request
  const handleAccept = (friendshipId) => {
    API.patch(`/friendships/${friendshipId}/`, { status: 'ACCEPTED' })
      .then(() => {
        fetchFriendships();
        addNotification({
          type: 'friendship',
          title: 'Friend Request Accepted',
          message: 'You have accepted a friend request',
          timestamp: new Date().toISOString()
        });
      })
      .catch((error) => {
        console.error('Error accepting friend request:', error);
        setError('Failed to accept friend request');
      });
  };

  // Handle rejecting friend request
  const handleReject = (friendshipId) => {
    API.patch(`/friendships/${friendshipId}/`, { status: 'REJECTED' })
      .then(() => {
        fetchFriendships();
        addNotification({
          type: 'friendship',
          title: 'Friend Request Rejected',
          message: 'You have rejected a friend request',
          timestamp: new Date().toISOString()
        });
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

  // Separate friendships by status
  const pendingRequests = friendships.filter(f => f.status === 'PENDING' && f.to_user === undefined);
  const acceptedFriendships = friendships.filter(f => f.status === 'ACCEPTED');
  const receivedRequests = friendships.filter(f => f.status === 'PENDING' && f.to_user !== undefined);

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-8">
      {/* Pending Requests Section */}
      {receivedRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Friend Requests</h2>
          <div className="space-y-3">
            {receivedRequests.map((friendship) => (
              <div key={friendship.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">
                    {friendship.from_user.first_name} {friendship.from_user.last_name}
                  </p>
                  <p className="text-sm text-gray-500">Wants to connect with you</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => viewProfile(friendship.from_user.user_id)}
                    className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleAccept(friendship.id)}
                    className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(friendship.id)}
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

      {/* Friends Section */}
      {acceptedFriendships.length > 0 ? (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Your Friends</h2>
          <div className="space-y-3">
            {acceptedFriendships.map((friend) => (
              <div key={friend.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">
                    {friend.to_user.first_name} {friend.to_user.last_name}
                  </p>
                  <p className="text-sm text-gray-500">Status: {friend.status}</p>
                </div>
                <button
                  onClick={() => viewProfile(friend.to_user.user_id)}
                  className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-gray-600">You have no friends yet.</div>
      )}

      {/* Sent Requests Section */}
      {pendingRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Sent Requests</h2>
          <div className="space-y-3">
            {pendingRequests.map((friendship) => (
              <div key={friendship.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">
                    {friendship.to_user.first_name} {friendship.to_user.last_name}
                  </p>
                  <p className="text-sm text-gray-500">Request pending</p>
                </div>
                <button
                  onClick={() => viewProfile(friendship.to_user.user_id)}
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
