// components/home/ResearchPaperCard.jsx
import React from 'react';

const ResearchPaperCard = ({ title, description, fileUrl }) => (
  <div className="bg-white shadow rounded-md p-4 border">
    <h3 className="text-md font-bold mb-1">{title}</h3>
    <p className="text-sm text-gray-600 mb-2">{description}</p>
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 text-sm hover:underline"
    >
      View Paper
    </a>
  </div>
);

export default ResearchPaperCard;
