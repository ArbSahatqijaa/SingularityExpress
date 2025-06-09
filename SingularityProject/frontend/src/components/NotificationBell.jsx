import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';

// Create a sound manager
const soundManager = {
  audio: new Audio('/sounds/notification.mp3'),
  play: function() {
    this.audio.currentTime = 0;
    this.audio.play().catch(err => console.log('Error playing sound:', err));
  }
};

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    notifications,
    markAsRead,
    removeNotification,
    clearNotifications
  } = useNotifications();

  // Track unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Play sound for new notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      // Only play sound for unread notifications that are less than 5 seconds old
      if (!latestNotification.read && 
          Date.now() - new Date(latestNotification.timestamp).getTime() < 5000) {
        soundManager.play();
      }
    }
  }, [notifications]);

  const formatTimestamp = ts => {
    const date = new Date(ts);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff/86400000)}d ago`;
    return date.toLocaleDateString();
  };

  const getIcon = type => {
    switch (type) {
      case 'message': return '💬';
      case 'call': return '📞';
      case 'missed_call': return '❌';
      case 'file': return '📎';
      case 'friendship': return '👋';
      default: return '🔔';
    }
  };

  const handleNotificationClick = (notification, index) => {
    if (!notification.read) {
      markAsRead(index);
    }
    if (notification.onClick) {
      notification.onClick();
    }
    setIsOpen(false);
  };

  const handleClear = (e, index) => {
    e.stopPropagation();
    removeNotification(index);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="relative" 
      ref={dropdownRef}
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 focus:outline-none transition-colors duration-200"
      >
        <motion.svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0
               0118 14.158V11a6.002 6.002 0
               00-4-5.659V5a2 2 0 10-4 0v.341
               C7.67 6.165 6 8.388 6 11v3.159
               c0 .538-.214 1.055-.595 1.436L4 17h5
               m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </motion.svg>
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-0 right-0 inline-flex items-center justify-center
                         px-2 py-1 text-xs font-bold leading-none transform
                         translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full"
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-100 backdrop-blur-sm bg-white/90"
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              <div className="flex gap-2">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => notifications.forEach((_, i) => markAsRead(i))} 
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  Mark all as read
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearNotifications} 
                  className="text-sm text-red-600 hover:text-red-800 transition-colors duration-200"
                >
                  Clear all
                </motion.button>
              </div>
            </div>

            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {notifications.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 text-center text-gray-500"
                >
                  No notifications
                </motion.div>
              ) : (
                notifications.map((notification, index) => (
                  <motion.div
                    key={`${notification.type}_${notification.friendshipId || index}_${notification.timestamp}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 5, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                    className={`p-4 border-b cursor-pointer transition-colors duration-200 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification, index)}
                  >
                    <div className="flex items-start gap-3">
                      <motion.span 
                        whileHover={{ scale: 1.2 }}
                        className="text-xl mt-1"
                      >
                        {getIcon(notification.type)}
                      </motion.span>
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.2, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={e => handleClear(e, index)}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                        aria-label="Remove notification"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                    </div>

                    {notification.type === 'friendship' && notification.friendshipId && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 flex space-x-2"
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            API.patch(`/friendships/${notification.friendshipId}/`, { status: 'ACCEPTED' })
                              .then(() => removeNotification(index))
                              .catch(console.error);
                          }}
                          className="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors duration-200"
                        >
                          Accept
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            API.patch(`/friendships/${notification.friendshipId}/`, { status: 'REJECTED' })
                              .then(() => removeNotification(index))
                              .catch(console.error);
                          }}
                          className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200"
                        >
                          Reject
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NotificationBell;
