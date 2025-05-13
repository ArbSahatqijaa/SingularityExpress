import React, { useState } from 'react';
import { FaRegCommentDots } from 'react-icons/fa';

const ChatSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, user: 'You' }]);
      setNewMessage('');
    }
  };

  return (
    <div>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-4 right-4 p-4 bg-blue-600 text-white rounded-full shadow-lg transition-all duration-300 transform ${
          isOpen ? 'rotate-45' : ''
        }`}
      >
        <FaRegCommentDots size={24} />
      </button>

      {/* Chat Box */}
      <div
        className={`fixed bottom-0 right-0 w-[400px] h-[600px] bg-white shadow-lg rounded-l-xl transition-all duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Chat Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center">
          <span className="font-semibold"> Chat</span>
          <button onClick={toggleChat} className="text-white text-lg">
            &times;
          </button>
        </div>

        {/* Chat Messages */}
        <div className="overflow-y-auto p-4 space-y-4 h-[calc(100%-120px)]">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.user === 'You' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs ${
                  message.user === 'You' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                <p>{message.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="flex p-4 border-t border-gray-200 bg-white">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-2 rounded-lg border border-gray-300"
            placeholder="Type your message..."
          />
          <button
            onClick={handleSendMessage}
            className="ml-2 p-2 bg-blue-600 text-white rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
