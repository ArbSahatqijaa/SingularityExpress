import React, { useState, useEffect } from 'react';
import { FaRegCommentDots } from 'react-icons/fa';

const friendsList = [
  { id: 1, name: 'John Doe', status: 'online' },
  { id: 2, name: 'Alice Smith', status: 'offline' },
  { id: 3, name: 'David Johnson', status: 'online' },
];

const ChatSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFriend, setActiveFriend] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [search, setSearch] = useState('');

  const toggleChat = () => setIsOpen(!isOpen);

  const handleFriendClick = (friend) => {
    setActiveFriend(friend);
    if (!messages[friend.id]) {
      setMessages((prev) => ({ ...prev, [friend.id]: [] }));
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeFriend) return;
    setMessages((prev) => ({
      ...prev,
      [activeFriend.id]: [...(prev[activeFriend.id] || []), { user: 'You', text: newMessage }],
    }));
    setNewMessage('');
    setTyping(false);
  };

  useEffect(() => {
    if (newMessage.trim()) setTyping(true);
    else setTyping(false);
  }, [newMessage]);

  const filteredFriends = friendsList.filter((friend) =>
    friend.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition z-50"
      >
        <FaRegCommentDots size={24} />
      </button>

      <div
        className={`fixed bottom-0 right-0 w-[700px] h-[600px] bg-white text-black shadow-2xl rounded-tl-xl transition-all duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-tr-xl">
              <span className="font-semibold">
                {activeFriend ? `Chatting with ${activeFriend.name}` : 'Select a friend'}
              </span>
              <button onClick={toggleChat} className="text-white text-xl font-bold">
                &times;
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
              {activeFriend &&
                (messages[activeFriend.id] || []).map((msg, i) => (
                  <div key={i} className={`flex ${msg.user === 'You' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`px-4 py-2 rounded-lg max-w-xs ${
                        msg.user === 'You' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              {typing && activeFriend && <div className="text-sm text-gray-500 animate-pulse">Typing...</div>}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white flex items-center">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg"
                placeholder="Type your message..."
                disabled={!activeFriend}
              />
              <button
                onClick={handleSendMessage}
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={!activeFriend}
              >
                Send
              </button>
            </div>
          </div>

          {/* Friends List  */}
          <div className="w-1/3 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto rounded-tr-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Friends</h3>
            <input
              type="text"
              placeholder="Search friends..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4 w-full p-2 border border-gray-300 rounded-lg bg-white text-black"
            />
            <ul className="space-y-2">
              {filteredFriends.map((friend) => (
                <li
                  key={friend.id}
                  onClick={() => handleFriendClick(friend)}
                  className={`cursor-pointer flex items-center gap-2 p-2 rounded-lg hover:bg-blue-100 transition ${
                    activeFriend?.id === friend.id ? 'bg-blue-100 font-semibold' : ''
                  }`}
                >
                  <div className="relative w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full font-bold">
                    {friend.name.charAt(0)}
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        friend.status === 'online' ? 'bg-green-500 ' : 'bg-gray-400'
                      }`}
                    ></span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{friend.name}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
