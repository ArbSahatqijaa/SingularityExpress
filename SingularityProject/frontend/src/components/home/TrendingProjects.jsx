import React from 'react';
import { FaPlus } from 'react-icons/fa'; 

const TrendingProjects = () => {
  const projects = [
    { id: 1, title: 'Project Alpha', description: 'An innovative AI solution', members: 15 },
    { id: 2, title: 'Project Beta', description: 'Revolutionizing e-commerce with React', members: 20 },
    { id: 3, title: 'Project Gamma', description: 'Decentralized finance for the future', members: 30 },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-gray-900">Trending Projects</h3>
        <div className="text-gray-500 cursor-pointer">
          <FaPlus className="text-xl hover:text-blue-600 transition-all duration-300" />
        </div>
      </div>

      <ul>
        {projects.map((project) => (
          <li key={project.id} className="border-b py-4 hover:bg-gray-50 rounded-lg transition-all duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-gray-800">{project.title}</h4>
                <p className="text-sm text-gray-600">{project.description}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Members: {project.members}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrendingProjects;
