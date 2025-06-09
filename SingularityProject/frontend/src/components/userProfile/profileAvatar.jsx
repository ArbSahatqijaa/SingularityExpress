import React from 'react';
import API from '../../services/api';

const ProfileAvatar = ({ avatar, className = '' }) => {
  const defaultAvatar = "/default_images/default-avatar.svg";
  const baseURL = API.defaults.baseURL;

  // Handle avatar URL construction
  const getAvatarUrl = (avatar) => {
    if (!avatar) return defaultAvatar;
    
    // If it's already a full URL (starts with http), use it as is
    if (avatar.startsWith('http')) return avatar;
    
    // If it's a relative path starting with /media/, remove the /media/ prefix
    if (avatar.startsWith('/media/')) {
      return `${baseURL}${avatar}`;
    }
    
    // If it's a relative path without /media/, add it
    if (avatar.startsWith('/')) {
      return `${baseURL}/media${avatar}`;
    }
    
    // If it's just a filename, add /media/avatars/
    return `${baseURL}/media/avatars/${avatar}`;
  };

  const avatarUrl = getAvatarUrl(avatar);

  return (
    <div className={`w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden ${className}`}>
      <img 
        src={avatarUrl} 
        alt="User avatar" 
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.onerror = null; // Prevent infinite loop
          e.target.src = defaultAvatar;
        }}
      />
    </div>
  );
};

export default ProfileAvatar;
