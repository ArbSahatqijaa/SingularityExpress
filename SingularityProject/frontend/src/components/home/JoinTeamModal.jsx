import React from 'react';
import { FaTimes } from 'react-icons/fa';

const JoinTeamModal = ({ project, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg relative shadow-2xl animate-fade-in-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
        >
          <FaTimes size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Join <span className="text-blue-600">"{project.title}"</span></h2>
          <p className="mt-2 text-gray-600 text-sm">
            Confirm that you want to join this team and collaborate on an exciting project!
          </p>
        </div>

        {/* Project Description Preview */}
        <div className="bg-gray-100 rounded-md p-4 text-sm text-gray-700 mb-4">
          {project.description}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              alert(`You joined ${project.title}`);
              onClose();
            }}
            className="px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
          >
            Join Team
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinTeamModal;
