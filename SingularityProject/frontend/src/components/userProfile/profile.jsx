import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import ProfileAvatar from "./profileAvatar";
import API from "../../services/api";
import ProjectCard from "../projectCard/projectCard";

const Profile = () => {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => {
        console.log(data); // Log the response data
        setUser(data);
      })
      .catch((error) => {
        console.error(error.response); // Log the full error response
        setUser(null);
      });
  }, []); // Add the empty dependency array here
  

  const projects = [
    {
      title: "Portfolio Website",
      description: "Creating a personal portfolio to showcase my skills.",
      status: "Completed",
      imageUrl: "https://images.unsplash.com/photo-1506765515384-028b60a970df",
    },
    {
      title: "E-commerce App",
      description: "Building a full-stack online store with Stripe integration.",
      status: "In Progress",
      imageUrl: "https://images.unsplash.com/photo-1542744094-24638eff58bb",
    },
  ];

  // Handle loading and error states
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
        <div className="h-40 bg-gradient-to-r from-purple-600 to-blue-500 relative">
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
            <li className="border-b-2 border-blue-600 text-blue-600 pb-3">Overview</li>
            <li className="hover:text-blue-600 cursor-pointer">Project</li>
            <li className="hover:text-blue-600 cursor-pointer">Files</li>
            <li className="hover:text-blue-600 cursor-pointer">Teams</li>
            <li className="hover:text-blue-600 cursor-pointer">Followers</li>
            <li className="hover:text-blue-600 cursor-pointer">Activity</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">About Me</h3>
          <p className="text-black-600 mt-4 font-bold text-xl">{user.first_name} {user.last_name}</p>
          <p className="text-gray-600 mt-4">Email: {user.email}</p>
        </div>

        {/* Projects (Right Side) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Projects I'm Working On</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <ProjectCard
                key={index}
                title={project.title}
                description={project.description}
                status={project.status}
                imageUrl={project.imageUrl}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
