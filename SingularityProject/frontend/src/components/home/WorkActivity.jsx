import React from 'react';
import { format, subDays } from 'date-fns';

const generateActivityData = () => {
  const days = 30; // Change to 60 or 365 for more data
  const data = [];

  for (let i = 0; i < days; i++) {
    data.push({
      date: subDays(new Date(), i),
      count: Math.floor(Math.random() * 5), 
    });
  }

  return data.reverse(); 
};

const getColor = (count) => {
  if (count === 0) return 'bg-gray-200';
  if (count === 1) return 'bg-blue-100';
  if (count === 2) return 'bg-blue-300';
  if (count === 3) return 'bg-blue-500';
  return 'bg-blue-700';
};

const WorkActivityHeatmap = () => {
  const data = generateActivityData();

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Daily Activity</h2>
      <div className="grid grid-cols-10 gap-1">
        {data.map((day, idx) => (
          <div
            key={idx}
            className={`w-6 h-6 rounded-md ${getColor(day.count)} cursor-pointer`}
            title={`${format(day.date, 'MMM dd')}: ${day.count} activities`}
          />
        ))}
      </div>
      <div className="text-xs text-gray-400 mt-3">
        Showing last {data.length} days of activity
      </div>
    </div>
  );
};

export default WorkActivityHeatmap;
