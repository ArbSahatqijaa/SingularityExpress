import React, { useState, useEffect, useRef } from 'react';
import { FaRobot } from 'react-icons/fa';
import API from '../../services/api';


// Helper function to clean response text
const cleanResponseText = (text) => {
  if (!text) return '';
  
  // Remove LaTeX-style formatting
  let cleaned = text
    .replace(/\\boxed{([^}]*)}/g, '$1') // Remove \boxed{}
    .replace(/\\[a-zA-Z]+{([^}]*)}/g, '$1') // Remove other LaTeX commands
    .replace(/\\[a-zA-Z]+/g, '') // Remove standalone LaTeX commands
    .replace(/\$\$([^$]*)\$\$/g, '$1') // Remove $$ math delimiters
    .replace(/\$([^$]*)\$/g, '$1') // Remove $ math delimiters
    .replace(/\\n/g, '\n') // Convert \n to actual newlines
    .replace(/\\"/g, '"') // Convert \" to "
    .replace(/\\'/g, "'") // Convert \' to '
    .trim();

  return cleaned;
};

const faqs = [
  "How do I reset my password?",
  "How do I post a Project?",
  "What is a Research Paper?",
  "How can I collaborate on a project?",
  "How do I manage my research papers?",
];

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [messages, setMessages] = useState([
    { id: 0, user: 'Assistant', text: 'Hello! I am your AI assistant for SingularityExpress. How can I help you today?' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowPrompt(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowPrompt(false);
    setError(null);
  };

  async function getAIResponse(userMessage) {
  try {
    // Append user message to chat
    const newMessages = [...messages, { user: 'You', text: userMessage }];
    setMessages(newMessages);

    // Call your backend AI API via your axios instance
    const res = await API.post('/chat/', {
      model: "gpt-4o-mini",
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant for SingularityExpress, a platform for research collaboration and project management. Provide concise and relevant answers. Do not use LaTeX formatting, special characters, or boxed text in your responses. Use plain text only.'
        },
        ...newMessages.slice(1).map(msg => ({
          role: msg.user === 'You' ? 'user' : 'assistant',
          content: msg.text
        })),
        {
          role: 'user',
          content: userMessage
        }
      ]
    });

    // Get AI reply text from response data
    const aiReply = res.data.choices?.[0]?.message?.content || "Sorry, I didn't get a response.";

    // Append AI reply to chat
    setMessages([...newMessages, { user: 'AI', text: aiReply }]);
  } catch (error) {
    console.error('Error fetching AI response:', error);
    setMessages([...messages, { user: 'AI', text: 'Oops! Something went wrong. Try again later.' }]);
  }
}

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const userMsg = newMessage.trim();
    setMessages(prev => [...prev, { id: prev.length, user: 'You', text: userMsg }]);
    setNewMessage('');
    await getAIResponse(userMsg);
  };

  const handleFaqClick = async (question) => {
    setMessages(prev => [...prev, { id: prev.length, user: 'You', text: question }]);
    await getAIResponse(question);
  };

  return (
    <div>
      {!isOpen && (
        <div
          className="fixed bottom-6 left-6 flex items-center space-x-3 cursor-pointer select-none"
          onClick={toggleChat}
          aria-label="Open Chat Assistant"
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleChat(); }}
        >
          {/* Robot icon */}
          <div
            className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg
              animate-pulse-slow hover:scale-110 transition-transform duration-300 ease-in-out
              floating"
          >
            <FaRobot size={28} />
          </div>

          {/* Prompt bubble */}
          <div
            className={`bg-blue-600 text-white rounded-full px-4 py-2 text-sm font-semibold shadow-lg
              transform transition-opacity duration-700 ease-in-out
              ${showPrompt ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
            style={{ userSelect: 'none', whiteSpace: 'nowrap' }}
          >
            Need help?
          </div>
        </div>
      )}

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 left-6 w-[400px] h-[520px] bg-white text-black shadow-2xl rounded-tr-xl flex flex-col
          transition-transform transition-opacity duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-full opacity-0 pointer-events-none'}
        `}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-tr-xl">
          <span className="font-semibold flex items-center gap-2">
            <FaRobot /> AI Assistant
          </span>
          <button
            onClick={toggleChat}
            className="text-white text-xl font-bold"
            aria-label="Close Chat Assistant"
          >
            &times;
          </button>
        </div>

        {/* Messages & FAQ */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.user === 'You' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs
                  animate-fadeIn
                  ${msg.user === 'You' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}
                `}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg max-w-xs animate-pulse">
                Assistant is typing...
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}

          {!isTyping && messages.length === 1 && (
            <div className="mt-4 border-t border-gray-300 pt-4">
              <h4 className="text-gray-600 font-semibold mb-2">Frequently Asked Questions:</h4>
              <ul className="space-y-2">
                {faqs.map((question, i) => (
                  <li
                    key={i}
                    onClick={() => handleFaqClick(question)}
                    className="cursor-pointer text-blue-600 hover:underline"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleFaqClick(question);
                    }}
                  >
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            aria-label="Type your message"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isTyping}
            className={`ml-2 px-4 py-2 rounded-lg transition-colors
              ${newMessage.trim() && !isTyping
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            aria-label="Send message"
          >
            Send
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
        @keyframes pulseSlow {
          0%, 100% {
            box-shadow: 0 0 8px 2px rgba(59, 130, 246, 0.7);
          }
          50% {
            box-shadow: 0 0 12px 4px rgba(59, 130, 246, 1);
          }
        }
        .animate-pulse-slow {
          animation: pulseSlow 3s ease-in-out infinite;
        }
        @keyframes floating {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        .floating {
          animation: floating 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ChatAssistant;
