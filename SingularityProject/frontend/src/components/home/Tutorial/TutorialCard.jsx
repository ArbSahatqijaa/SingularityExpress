// src/components/home/Tutorial/TutorialCard.jsx
import React from 'react';
import { BookOpen, Download } from 'lucide-react';
import API from '../../../services/api'; // Needed for constructing file URL

const TutorialCard = ({ tutorial_id, title, filePath, created_by }) => {
  const fileUrl = filePath
    ? (filePath.startsWith('http') ? filePath : API.defaults.baseURL + filePath)
    : null;

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-purple-600" />
        {title}
      </h3>
      {created_by && (
        <p className="text-gray-600 text-xs mb-3">
          <span className="font-medium">Created by:</span> {created_by}
        </p>
      )}
      <div className="flex justify-end gap-3">
        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 bg-purple-500 text-white text-xs font-medium rounded-md hover:bg-purple-600 transition-colors duration-200"
          >
            <Download className="w-4 h-4 mr-1" />
            View/Download File
          </a>
        )}
      </div>
    </div>
  );
};

export default TutorialCard;