// src/components/friends/FriendSuggestionCard.jsx
import React from 'react';
import { UserPlus } from 'lucide-react';

const FriendSuggestionCard = ({ friend, onAddClick }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:shadow-sm transition">
      <div className="flex items-center gap-3">
        <img src={friend.image} alt={friend.name} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <p className="text-sm font-medium text-gray-800">{friend.name}</p>
          <p className="text-xs text-gray-500">{friend.role}</p>
          <p className="text-xs text-gray-400 italic">{friend.bio}</p>
        </div>
      </div>
      <button
        onClick={() => onAddClick(friend)}
        className="p-2 rounded-full hover:bg-blue-100 transition"
        title="Add Friend"
      >
        <UserPlus className="w-5 h-5 text-blue-600" />
      </button>
    </div>
  );
};

export default FriendSuggestionCard;
