// src/components/friends/AddFriendModal.jsx
import React from 'react';
import { FaTimes } from 'react-icons/fa';

const AddFriendModal = ({ friend, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <FaTimes />
        </button>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Add Friend</h3>
        <div className="flex items-center gap-3 mb-4">
          <img src={friend.image} alt={friend.name} className="w-12 h-12 rounded-full" />
          <div>
            <p className="text-sm font-medium text-gray-700">{friend.name}</p>
            <p className="text-xs text-gray-500">{friend.role}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to add <span className="font-semibold">{friend.name}</span> as a
          friend?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Friend
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFriendModal;
