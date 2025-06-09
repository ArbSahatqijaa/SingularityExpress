import React from 'react';
import API from '../../services/api';


const ProfileAvatar = ({ avatar, className = '' }) => {
  const defaultAvatar = "/default_images/default-avatar.svg";
  const baseURL       = API.defaults.baseURL;
  const avatarUrl     = avatar
  ? avatar.startsWith('http')
    ? avatar
    : `${baseURL}${avatar.startsWith('/') ? '' : '/'}${avatar}`
  : defaultAvatar;

  return (
    <div className={`w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden ${className}`}>
      <img src={avatarUrl} alt="User avatar" className="w-full h-full object-cover" />
    </div>
  );
};
export default ProfileAvatar;
