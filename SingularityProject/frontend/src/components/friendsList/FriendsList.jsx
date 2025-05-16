// src/components/friendsList/FriendsList.jsx
import React from "react";
import FriendItem from "./FriendItem";

const friends = [
  { id: 1, name: "John Doe", role: "Software Engineer", image: "https://randomuser.me/api/portraits/men/1.jpg" },
  { id: 2, name: "Jane Smith", role: "Product Manager", image: "https://randomuser.me/api/portraits/women/1.jpg" },
  { id: 3, name: "Alice Johnson", role: "Designer", image: "https://randomuser.me/api/portraits/women/2.jpg" },
  { id: 4, name: "Bob Lee", role: "Developer", image: "https://randomuser.me/api/portraits/men/2.jpg" },
  // Add more friends as needed
];

const FriendList = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Suggested Friends</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {friends.map((friend) => (
          <FriendItem key={friend.id} friend={friend} />
        ))}
      </div>
    </div>
  );
};

export default FriendList;
