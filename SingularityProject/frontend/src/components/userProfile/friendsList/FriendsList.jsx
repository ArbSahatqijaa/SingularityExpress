import React, { useEffect, useState } from 'react';
import API from '../../../services/api';

const FriendsList = () => {
  const [friendships, setFriendships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/friendships/')
      .then(({ data }) => {
        setFriendships(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching friendships:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading friends...</div>;

  if (friendships.length === 0) {
    return <div className="text-gray-600">You have no friends yet.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Your Friends</h2>
      {friendships.map((friend, idx) => (
        <div key={idx} className="bg-white p-4 rounded shadow flex justify-between items-center">
          <div>
            <p className="font-semibold text-gray-800">
              {friend.to_user.first_name} {friend.to_user.last_name}
            </p>
            <p className="text-sm text-gray-500">Status: {friend.status}</p>
          </div>
          {/* Future: Add buttons for accept/reject/block */}
        </div>
      ))}
    </div>
  );
};

export default FriendsList;
