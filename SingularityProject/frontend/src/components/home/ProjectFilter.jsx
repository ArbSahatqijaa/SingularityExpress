import React from 'react';

const categories = ['Project', 'Tutorial', 'Research'];

const ProjectFilter = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <div className="flex space-x-4 mb-4">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => setSelectedCategory(category)}
          className={`px-4 py-2 rounded font-semibold ${
            selectedCategory === category
              ? 'bg-blue-600 text-white'
              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default ProjectFilter;
