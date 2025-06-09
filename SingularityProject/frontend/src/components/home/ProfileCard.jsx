// src/components/home/ProfileCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const ProfileCard = ({ user }) => {
  const navigate = useNavigate();

  if (!user) {
    return <div className="p-4 text-center">Loading profile…</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-auto transition-all hover:shadow-xl">
      {/* Profile Header */}
      <div className="flex items-center space-x-4 mb-4">
        {/* Profile Image */}
        <img
          src={
            user.avatar ?
            user.avatar.startsWith('http') ?
            user.avatar
            : API.defaults.baseURL + user.avatar
            : '/default_images/default-avatar.svg'
          }
          alt="User Avatar"
          className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
        />
        {/* User Info */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            {`${user.academic_title ? user.academic_title + ' ' : ''}${user.first_name} ${user.last_name}`.trim()}
          </h3>
          <p className="text-sm text-gray-500">@{user.username}</p>
          <p className="text-sm text-gray-500">{user.profession || '—'}</p>
        </div>
      </div>

      {/* Contact & Join Date */}
      <div className="space-y-2">
        <p className="text-gray-700 text-sm">Email: {user.email}</p>
        <p className="text-gray-700 text-sm">
          Joined: {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* View Profile Button */}
      <button
        className="w-full mt-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
        onClick={() => navigate('/profile')}
      >
        View Profile
      </button>
    </div>
  );
};

export default ProfileCard;
