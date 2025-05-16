// src/components/friendsList/FriendItem.jsx
import React from "react";

const FriendItem = ({ friend }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg transition-transform duration-200 ease-in-out hover:scale-105">
      <div className="flex items-center mb-4">
        <img
          src={friend.image}
          alt={friend.name}
          className="w-20 h-20 rounded-full mr-6"  // Increase size of profile picture
        />
        <div>
          <p className="font-bold text-xl text-gray-900">{friend.name}</p>
          <p className="text-md text-gray-600">{friend.role}</p>
        </div>
      </div>
      <button className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-all duration-200 focus:outline-none text-lg">
        Add Friend
      </button>
    </div>
  );
};

export default FriendItem;
