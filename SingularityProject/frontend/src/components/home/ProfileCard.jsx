import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileCard = ({ user }) => {
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate('/profile'); 
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-auto transition-all hover:shadow-xl">
      {/* Profile Header */}
      <div className="flex items-center space-x-4 mb-4">
        {/* Profile Image */}
        <img
          src={user?.profileImage || 'https://via.placeholder.com/150'}
          alt="User Avatar"
          className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
        />
        {/* User Info */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{user?.name || 'John Doe'}</h3>
          <p className="text-sm text-gray-500">{user?.role || 'Developer'}</p>
        </div>
      </div>

      {/* Bio and Details */}
      <div className="space-y-3">
        <p className="text-gray-700 text-sm">{user?.bio || 'This is a short user bio.'}</p>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Projects: {user?.projectsCount || 0}</span>
          <span>Joined: {user?.joinDate || 'N/A'}</span>
        </div>
      </div>

      {/* Edit Button */}
      <button
        className="w-full mt-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
        onClick={handleEditProfile}
      >
        View Profile
      </button>
    </div>
  );
};

export default ProfileCard;
