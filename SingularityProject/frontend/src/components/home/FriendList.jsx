// src/components/friends/FriendList.jsx
import React, { useState, useEffect } from 'react';
import FriendSuggestionCard from './FriendSuggestionCard';
import API from '../../services/api';

const FriendList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // First get current user
        const { data: currentUserData } = await API.get('/whoami/');
        setCurrentUser(currentUserData);

        // Then get all users
        const { data: usersData } = await API.get('/users/');
        
        // Filter out current user and users who are already friends
        const filteredUsers = usersData.filter(user => 
          user.user_id !== currentUserData.user_id
        );

        setUsers(filteredUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load suggested friends');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddClick = (user) => {
    // Remove the user from the suggestions list after sending request
    setUsers(prevUsers => prevUsers.filter(u => u.user_id !== user.user_id));
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-xl shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">People You May Know</h2>
        <div className="text-center py-4 text-gray-500">Loading suggestions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-xl shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">People You May Know</h2>
        <div className="text-center py-4 text-red-500">{error}</div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white p-4 rounded-xl shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">People You May Know</h2>
        <div className="text-center py-4 text-gray-500">No suggestions available at the moment</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">People You May Know</h2>
      <div className="space-y-3">
        {users.map((user) => (
          <FriendSuggestionCard 
            key={user.user_id} 
            user={user} 
            onAddClick={handleAddClick}
          />
        ))}
      </div>
    </div>
  );
};

export default FriendList;
