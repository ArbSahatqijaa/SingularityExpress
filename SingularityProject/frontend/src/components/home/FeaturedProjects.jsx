import React, { useState } from "react";
import {
  FaHeart,
  FaRegHeart,
  FaRegCommentDots,
  FaBookmark,
  FaRegBookmark,
  FaFlask,
  FaChalkboardTeacher,
  FaUpload,
} from "react-icons/fa";
import JoinTeamModal from "./JoinTeamModal";
import API from "../../services/api";

const FeaturedProjects = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [likedProjects, setLikedProjects] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [comments, setComments] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});
  const [uploadDropdown, setUploadDropdown] = useState({}); 
  const [uploadedFiles, setUploadedFiles] = useState({});
  const projects = [
    {
      id: 1,
      title: "Project 1",
      description:
        "Revolutionizing the tech industry with cutting-edge solutions.",
      teams: 3,
      maxTeams: 5,
      imageUrl: "https://images.unsplash.com/photo-1542744094-24638eff58bb",
      teamMembers: [
        "https://randomuser.me/api/portraits/men/32.jpg",
        "https://randomuser.me/api/portraits/women/44.jpg",
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
        "https://randomuser.me/api/portraits/men/45.jpg",
        "https://randomuser.me/api/portraits/women/38.jpg",
      ],
    },
  ];

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

  // Toggle dropdown for upload forms in project card
  const toggleUploadDropdown = (projectId, type) => {
    setUploadDropdown((prev) => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [type]: !prev?.[projectId]?.[type],
      },
    }));
  };

  const handleFileChange = (projectId, type, files) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [type]: Array.from(files),
      },
    }));
  };

  const handleUpload = (projectId, type) => {
    const filesToUpload = uploadedFiles?.[projectId]?.[type];
    if (!filesToUpload || filesToUpload.length === 0) {
      alert("Please select files first");
      return;
    }
    alert(
      `Uploading ${filesToUpload.length} ${
        type === "research" ? "research paper" : "tutorial"
      } file(s) for Project ID: ${projectId}`
    );
    setUploadedFiles((prev) => ({
      ...prev,
      [projectId]: {
        ...prev?.[projectId],
        [type]: [],
      },
    }));
    setUploadDropdown((prev) => ({
      ...prev,
      [projectId]: {
        ...prev?.[projectId],
        [type]: false,
      },
    }));
  };

  const handleJoinClick = (project) => {
    setSelectedProject(project);
    setIsJoinModalOpen(true);
  };

  const toggleLike = (projectId) => {
    setLikedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const toggleSave = (projectId) => {
    setSavedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const toggleCommentBox = (projectId) => {
    setShowCommentBox((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const handleCommentSubmit = (projectId, text) => {
    if (!text) return;
    setComments((prev) => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), text],
    }));
    setShowCommentBox((prev) => ({ ...prev, [projectId]: false }));
  };

  const closeJoinModal = () => {
    setSelectedProject(null);
    setIsJoinModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-gray-100 min-h-screen">
      <div className="space-y-8">
        {projects.map((project) => {
          const researchDropdownOpen = uploadDropdown?.[project.id]?.research;
          const tutorialDropdownOpen = uploadDropdown?.[project.id]?.tutorial;
          const researchFiles = uploadedFiles?.[project.id]?.research || [];
          const tutorialFiles = uploadedFiles?.[project.id]?.tutorial || [];

          return (
            <div
              key={project.id}
              className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-center mb-2 space-x-4">
                <img
                  src={getAvatarUrl(project.leader.avatar)}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = defaultAvatar;
                  }}
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-500">Posted 2 hours ago</p>
                </div>
              </div>

              {/* Image */}
              <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden shadow-md">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black opacity-25"></div>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-4">{project.description}</p>

              {/* Stats */}
              <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-gray-500">
                  {project.teams} / {project.maxTeams} Teams
                </span>
                <span
                  className={`${
                    project.teams < project.maxTeams
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {project.teams < project.maxTeams
                    ? "Space Available"
                    : "Full"}
                </span>
              </div>

              {/* Upload Dropdown Buttons */}
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => toggleUploadDropdown(project.id, "research")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold transition
                    ${
                      researchDropdownOpen
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    }
                  `}
                  aria-expanded={researchDropdownOpen ? "true" : "false"}
                >
                  <FaFlask />
                  <span>Add Research Paper</span>
                </button>

                <button
                  onClick={() => toggleUploadDropdown(project.id, "tutorial")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold transition
                    ${
                      tutorialDropdownOpen
                        ? "bg-green-600 text-white shadow-lg"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }
                  `}
                  aria-expanded={tutorialDropdownOpen ? "true" : "false"}
                >
                  <FaChalkboardTeacher />
                  <span>Add Tutorial Files</span>
                </button>
              </div>

              {/* Upload Dropdown Panels */}
              {researchDropdownOpen && (
                <div className="border rounded-lg p-4 mb-4 bg-indigo-50 shadow-inner">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) =>
                      handleFileChange(project.id, "research", e.target.files)
                    }
                    className="mb-3"
                  />
                  {researchFiles.length > 0 && (
                    <ul className="mb-3 max-h-24 overflow-auto list-disc list-inside text-sm text-indigo-900">
                      {researchFiles.map((file, idx) => (
                        <li key={idx}>{file.name}</li>
                      ))}
                    </ul>
                  )}
                  <button
                    onClick={() => handleUpload(project.id, "research")}
                    disabled={researchFiles.length === 0}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    Upload Research Paper
                  </button>
                </div>
              )}

              {tutorialDropdownOpen && (
                <div className="border rounded-lg p-4 mb-4 bg-green-50 shadow-inner">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                    onChange={(e) =>
                      handleFileChange(project.id, "tutorial", e.target.files)
                    }
                    className="mb-3"
                  />
                  {tutorialFiles.length > 0 && (
                    <ul className="mb-3 max-h-24 overflow-auto list-disc list-inside text-sm text-green-900">
                      {tutorialFiles.map((file, idx) => (
                        <li key={idx}>{file.name}</li>
                      ))}
                    </ul>
                  )}
                  <button
                    onClick={() => handleUpload(project.id, "tutorial")}
                    disabled={tutorialFiles.length === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition"
                  >
                    Upload Tutorial Files
                  </button>
                </div>
              )}

              {/* Team Members */}
              <div className="flex space-x-2 mb-4">
                {project.teamMembers.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Team member ${idx + 1}`}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    title={`Member ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-4 text-gray-600">
                  <button
                    onClick={() => toggleLike(project.id)}
                    aria-label="Like project"
                    className="flex items-center space-x-1 hover:text-red-600 focus:outline-none"
                  >
                    {likedProjects.includes(project.id) ? (
                      <FaHeart className="text-red-600" />
                    ) : (
                      <FaRegHeart />
                    )}
                    <span>Like</span>
                  </button>
                  <button
                    onClick={() => toggleCommentBox(project.id)}
                    aria-label="Comment on project"
                    className="flex items-center space-x-1 hover:text-blue-600 focus:outline-none"
                  >
                    <FaRegCommentDots />
                    <span>Comment</span>
                  </button>
                  <button
                    onClick={() => toggleSave(project.id)}
                    aria-label="Save project"
                    className="flex items-center space-x-1 hover:text-yellow-600 focus:outline-none"
                  >
                    {savedProjects.includes(project.id) ? (
                      <FaBookmark className="text-yellow-600" />
                    ) : (
                      <FaRegBookmark />
                    )}
                    <span>Save</span>
                  </button>
                </div>

                <button
                  onClick={() => handleJoinClick(project)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Join Project
                </button>
              </div>

              {/* Comment Box */}
              {showCommentBox[project.id] && (
                <div className="mt-4">
                  <CommentBox
                    projectId={project.id}
                    onSubmit={handleCommentSubmit}
                    comments={comments[project.id] || []}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isJoinModalOpen && (
        <JoinTeamModal
          project={selectedProject}
          onClose={closeJoinModal}
        />
      )}
    </div>
  );
};

// Comment Box Component
const CommentBox = ({ projectId, onSubmit, comments }) => {
  const [commentText, setCommentText] = useState("");

  const submitHandler = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onSubmit(projectId, commentText.trim());
      setCommentText("");
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-inner border border-gray-300">
      <form onSubmit={submitHandler} className="mb-3">
        <textarea
          className="w-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Submit Comment
        </button>
      </form>
      <div>
        {comments.length === 0 && (
          <p className="text-sm text-gray-500">No comments yet.</p>
        )}
        {comments.map((c, idx) => (
          <p
            key={idx}
            className="mb-1 p-2 bg-gray-100 rounded border border-gray-200 text-gray-700"
          >
            {c}
          </p>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProjects;
