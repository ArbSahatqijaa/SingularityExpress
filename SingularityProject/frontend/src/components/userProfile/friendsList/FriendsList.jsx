import React, { useEffect, useState } from 'react';
import API from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../../contexts/NotificationContext';

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

  
 
  // Navigate to user profile
  const viewProfile = (userId) => {
    navigate(`/users/${userId}`);
  };

  if (loading) return <div>Loading friends...</div>;

  
  const acceptedFriendships = friendships.filter(f => 
    f.status === 'ACCEPTED');

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-8">
      

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

    </div>
  );
};

export default FriendsList;
