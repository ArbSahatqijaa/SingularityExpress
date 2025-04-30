const ProfileAvatar = ({ avatar }) => {
  const defaultAvatar = "/default-avatar.png";
  const baseURL = "http://localhost:8000"; // Or your deployed backend URL

  const avatarUrl = avatar
    ? avatar.startsWith("http") ? avatar : `${baseURL}/${avatar}`
    : defaultAvatar;

  return (
    <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden">
      <img src={avatarUrl} alt="User avatar" className="w-full h-full object-cover" />
    </div>
  );
};
export default ProfileAvatar;