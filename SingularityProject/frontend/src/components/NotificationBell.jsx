import React, { useState, useRef, useEffect } from 'react';
import API from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications
  } = useNotifications();

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

  const handleNotificationClick = notification => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.onClick) {
      notification.onClick();
    }
    setIsOpen(false);
  };

  const handleClear = (e, id) => {
    e.stopPropagation();
    clearNotification(id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0
               0118 14.158V11a6.002 6.002 0
               00-4-5.659V5a2 2 0 10-4 0v.341
               C7.67 6.165 6 8.388 6 11v3.159
               c0 .538-.214 1.055-.595 1.436L4 17h5
               m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center
                           px-2 py-1 text-xs font-bold leading-none transform
                           translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <div className="flex gap-2">
              <button onClick={markAllAsRead} className="text-sm text-blue-600 hover:text-blue-800">
                Mark all as read
              </button>
              <button onClick={clearAllNotifications} className="text-sm text-red-600 hover:text-red-800">
                Clear all
              </button>
            </div>
          </div>

          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-1">{getIcon(notification.type)}</span>
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                    <button
                      onClick={e => handleClear(e, notification.id)}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Remove notification"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Accept/Reject for friendship requests */}
                  {notification.type === 'friendship' && notification.friendshipId && (
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => {
                          API.patch(`/friendships/${notification.friendshipId}/`, { status: 'ACCEPTED' })
                            .then(() => clearNotification(notification.id))
                            .catch(console.error);
                        }}
                        className="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          API.patch(`/friendships/${notification.friendshipId}/`, { status: 'REJECTED' })
                            .then(() => clearNotification(notification.id))
                            .catch(console.error);
                        }}
                        className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
