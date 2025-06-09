import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import ProfileAvatar from "./profileAvatar";
import API from "../../services/api";
import FriendsList from './friendsList/FriendsList';
import ProjectsList from './ProjectPaperTutorialList/ProjectsList';
import PaperList from './ProjectPaperTutorialList/PaperList';
import TutorialList from './ProjectPaperTutorialList/TutorialList';
import Overview from './ProjectPaperTutorialList/Overview';

const Profile = () => {
  const [user, setUser] = useState(undefined);
  const [selectedTab, setSelectedTab] = useState('Overview');
  const storedKopertina = localStorage.getItem("kopertina");

  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => {
        setUser(data);
      })
      .catch((error) => {
        console.error(error.response);
        setUser(null);
      });
  }, []);

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

  if (user === undefined) {
    return <div className="p-8 text-gray-700">Loading...</div>;
  }

  if (user === null) {
    return <div className="p-8 text-red-600">Failed to load user data.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {/* Cover Banner */}
        <div className="h-40 relative">
          <img
            src={storedKopertina || "/default_images/default-banner.jpg"}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          {/* Avatar */}
          <div className="absolute -bottom-12 left-6">
            <ProfileAvatar avatar={user.avatar} />
          </div>
        </div>

        {/* User Info */}
        <div className="pt-16 px-6 pb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-gray-500">{user.username}</p>
          </div>
          <Link
            to="/edit-profile"
            className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition"
          >
            Edit Profile
          </Link>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 px-6">
          <ul className="flex space-x-6 text-sm font-medium text-gray-600">
            {['Overview', 'Project', 'Papers', 'Tutorials', 'Friends'].map((tab, index) => (
              <li
                key={`${tab}-${index}`}
                onClick={() => handleTabClick(tab)}
                className={`cursor-pointer pb-3 border-b-2 transition ${
                  selectedTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent hover:text-blue-600'
                }`}
              >
                {tab}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Left Column - About Me */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">About Me</h3>
          <p className="text-black-600 mt-4 font-bold text-xl">{user.first_name} {user.last_name}</p>
          <p className="text-gray-600 mt-4">Email: {user.email}</p>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selectedTab === 'Overview' && <Overview user={user} />}
          {selectedTab === 'Friends' && <FriendsList />}
          {selectedTab === 'Project' && <ProjectsList user={user} />}
          {selectedTab === 'Papers' && <PaperList user={user} />}
          {selectedTab === 'Tutorials' && <TutorialList user={user} />}
        </div>
      </div>
    </div>
  );
};

export default Profile;
