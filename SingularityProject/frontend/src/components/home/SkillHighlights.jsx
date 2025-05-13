// src/components/home/SkillEndorsements.jsx
import React from 'react';
import { ThumbsUp } from 'lucide-react';

const SkillHighlight = () => {
  const skills = [
    { id: 1, skill: 'JavaScript', endorsements: 25 },
    { id: 2, skill: 'React', endorsements: 30 },
    { id: 3, skill: 'Node.js', endorsements: 20 },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Skill Highlights</h3>
      <ul className="divide-y divide-gray-200">
        {skills.map((skill) => (
          <li key={skill.id} className="py-3 flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-medium">{skill.skill}</p>
              <p className="text-xs text-gray-500">Endorsed by {skill.endorsements} people</p>
            </div>
            <div className="flex items-center gap-1 text-blue-600">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm font-semibold">{skill.endorsements}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SkillHighlight;
