// src/components/friends/FriendList.jsx
import React, { useState } from 'react';
import FriendSuggestionCard from './FriendSuggestionCard';
import AddFriendModal from './AddFriendModal';

const suggestedFriends = [
  {
    id: 1,
    name: 'Arb Sahatqija',
    role: 'UI/UX Designer',
    image: '',
    bio: 'Design lover, coffee enthusiast.',
  },
  {
    id: 2,
    name: 'Aid Aliu',
    role: 'Frontend Developer',
    image: '',
    bio: 'Code, chill, repeat.',
  },
  {
    id: 3,
    name: 'Blend Kqiku',
    role: 'Project Manager',
    image: '',
    bio: 'Organized chaos master.',
  },
  {
    id: 4,
    name: 'Arb Arb',
    role: 'Backend Developer',
    image: '',
    bio: 'Server-side wizard.',
  },
];

const FriendList = () => {
  const [selectedFriend, setSelectedFriend] = useState(null);

  const handleAddClick = (friend) => {
    setSelectedFriend(friend);
  };

  const handleCloseModal = () => {
    setSelectedFriend(null);
  };

  const handleConfirmAdd = () => {
    alert(`You added ${selectedFriend.name} as a friend!`);
    setSelectedFriend(null);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">People You May Know</h2>
      <div className="space-y-3">
        {suggestedFriends.map((friend) => (
          <FriendSuggestionCard key={friend.id} friend={friend} onAddClick={handleAddClick} />
        ))}
      </div>

      {selectedFriend && (
        <AddFriendModal
          friend={selectedFriend}
          onClose={handleCloseModal}
          onConfirm={handleConfirmAdd}
        />
      )}
    </div>
  );
};

export default FriendList;
