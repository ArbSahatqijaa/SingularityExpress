import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaRegCommentDots, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import JoinTeamModal from './JoinTeamModal';

const FeaturedProjects = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedProjects, setLikedProjects] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [comments, setComments] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});

  const projects = [
    {
      id: 1,
      title: "Project 1",
      description: "Revolutionizing the tech industry with cutting-edge solutions.",
      teams: 3,
      maxTeams: 5,
      imageUrl: "https://images.unsplash.com/photo-1542744094-24638eff58bb",
      teamMembers: [
        'https://randomuser.me/api/portraits/men/32.jpg',
        'https://randomuser.me/api/portraits/women/44.jpg',
      ],
    },
    {
      id: 2,
      title: "Project 2",
      description: "Optimizing business processes using AI and machine learning.",
      teams: 2,
      maxTeams: 5,
      imageUrl: "https://images.unsplash.com/photo-1506765515384-028b60a970df",
      teamMembers: [
        'https://randomuser.me/api/portraits/men/45.jpg',
        'https://randomuser.me/api/portraits/women/38.jpg',
      ],
    },
    {
      id: 2,
      title: "Project 2",
      description: "Optimizing business processes using AI and machine learning.",
      teams: 2,
      maxTeams: 5,
      imageUrl: "https://images.unsplash.com/photo-1506765515384-028b60a970df",
      teamMembers: [
        'https://randomuser.me/api/portraits/men/45.jpg',
        'https://randomuser.me/api/portraits/women/38.jpg',
      ],
    },
  ];

  const handleJoinClick = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const toggleLike = (projectId) => {
    setLikedProjects(prev =>
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
    );
  };

  const toggleSave = (projectId) => {
    setSavedProjects(prev =>
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
    );
  };

  const toggleCommentBox = (projectId) => {
    setShowCommentBox(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const handleCommentSubmit = (projectId, text) => {
    if (!text) return;
    setComments(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), text],
    }));
    setShowCommentBox(prev => ({ ...prev, [projectId]: false }));
  };

  const closeModal = () => {
    setSelectedProject(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-all duration-300"
        >
          {/* Header */}
          <div className="flex items-center mb-4 space-x-4">
            <img
              src="https://via.placeholder.com/40"
              alt="User Avatar"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
              <p className="text-sm text-gray-500">Posted 2 hours ago</p>
            </div>
          </div>

          {/* Image */}
          <div className="relative w-full h-64 mb-4">
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-full object-cover rounded-lg shadow-md"
            />
            <div className="absolute inset-0 bg-black opacity-25 rounded-lg"></div>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-4">{project.description}</p>

          {/* Stats */}
          <div className="flex justify-between items-center text-sm mb-4">
            <span className="text-gray-500">
              {project.teams} / {project.maxTeams} Teams
            </span>
            <span className={`${project.teams < project.maxTeams ? 'text-green-500' : 'text-red-500'}`}>
              {project.teams < project.maxTeams ? 'Space Available' : 'Full'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-6 text-xl">
              <button
                onClick={() => toggleLike(project.id)}
                className={`hover:scale-110 transition-transform ${likedProjects.includes(project.id) ? 'text-red-600' : 'text-gray-500'
                  }`}
              >
                {likedProjects.includes(project.id) ? <FaHeart /> : <FaRegHeart />}
              </button>

              <button
                onClick={() => toggleCommentBox(project.id)}
                className="text-gray-500 hover:text-blue-500 hover:scale-110 transition-transform"
              >
                <FaRegCommentDots />
              </button>

              <button
                onClick={() => toggleSave(project.id)}
                className={`hover:scale-110 transition-transform ${savedProjects.includes(project.id) ? 'text-yellow-500' : 'text-gray-500'
                  }`}
              >
                {savedProjects.includes(project.id) ? <FaBookmark /> : <FaRegBookmark />}
              </button>
            </div>

            {/* Team Members */}
            <div className="flex space-x-2">
              {project.teamMembers.map((avatar, i) => (
                <img
                  key={i}
                  src={avatar}
                  alt="Team Member"
                  className="w-8 h-8 rounded-full border-2 border-white shadow -ml-2"
                />
              ))}
            </div>
          </div>

          {/* Join Button */}
          <button
            onClick={() => handleJoinClick(project)}
            disabled={project.teams >= project.maxTeams}
            className={`w-full py-3 text-lg rounded-lg font-semibold text-white ${project.teams < project.maxTeams
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
              }`}
          >
            {project.teams < project.maxTeams ? 'Join Project' : 'Full'}
          </button>

          {/* Comment Box */}
          {showCommentBox[project.id] && (
            <div className="mt-4">
              <textarea
                className="w-full p-2 border border-gray-300 rounded-lg mb-2"
                rows="3"
                placeholder="Write your comment..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit(project.id, e.target.value);
                    e.target.value = '';
                  }
                }}
              ></textarea>
            </div>
          )}


          {/* Display Comments */}
          {comments[project.id]?.length > 0 && (
            <div className="mt-4 border-t pt-4 space-y-3">
              {comments[project.id].map((comment, idx) => (
                <div key={idx} className="p-3 bg-gray-100 rounded-md shadow-sm">
                  <p className="text-sm text-gray-800">{comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Join Modal */}
      {isModalOpen && (
        <JoinTeamModal
          project={selectedProject}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default FeaturedProjects;
