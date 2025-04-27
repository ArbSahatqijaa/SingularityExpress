const ProfileAvatar = ({ avatar }) => {
    return (
      <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden">
        <img
          src={avatar}
          alt="User avatar"
          className="w-full h-full object-cover"
        />
      </div>
    );
  };
  
  export default ProfileAvatar;
  