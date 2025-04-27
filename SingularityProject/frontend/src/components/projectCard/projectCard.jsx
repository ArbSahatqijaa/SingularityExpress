import React from 'react';

const ProjectCard = ({ title, description, status, imageUrl }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 max-w-sm">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="h-40 w-full object-cover"
        />
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4 text-sm">{description}</p>
        <div className="flex justify-between items-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              status === 'In Progress'
                ? 'bg-blue-100 text-blue-600'
                : status === 'Completed'
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {status}
          </span>
          <button className="text-blue-600 text-sm hover:underline font-medium">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
