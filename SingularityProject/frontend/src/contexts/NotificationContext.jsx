import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import API from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        const parsedNotifications = JSON.parse(savedNotifications);
        if (isDevelopment) {
          console.log('Loaded notifications from storage:', parsedNotifications.length);
        }
        setNotifications(parsedNotifications);
      }
    } catch (error) {
      if (isDevelopment) {
        console.error('Error loading notifications:', error);
      }
      // Clear corrupted data
      localStorage.removeItem('notifications');
    }
  }, []);

  // Save notifications to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
      if (isDevelopment) {
        console.log('Saved notifications to storage:', notifications.length);
      }
    } catch (error) {
      if (isDevelopment) {
        console.error('Error saving notifications:', error);
      }
    }
  }, [notifications]);

  const addNotification = useCallback((notification) => {
    try {
      setNotifications(prev => {
        const newNotifications = [...prev, { ...notification, id: Date.now() }];
        // Keep only the last 50 notifications
        return newNotifications.slice(-50);
      });
    } catch (error) {
      if (isDevelopment) {
        console.error('Error adding notification:', error);
      }
    }
  }, []);

  const removeNotification = useCallback((id) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      if (isDevelopment) {
        console.error('Error removing notification:', error);
      }
    }
  }, []);

  const clearNotifications = useCallback(() => {
    try {
      setNotifications([]);
      localStorage.removeItem('notifications');
    } catch (error) {
      if (isDevelopment) {
        console.error('Error clearing notifications:', error);
      }
    }
  }, []);

  // Track processed message IDs to prevent duplicates
  const [processedMessageIds] = useState(() => {
    const saved = localStorage.getItem('processedMessageIds');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Derive unreadCount from notifications array
  const unreadCount = notifications.filter(n => !n.read).length;

  // Save processed message IDs to localStorage
  useEffect(() => {
    localStorage.setItem('processedMessageIds', JSON.stringify([...processedMessageIds]));
  }, [processedMessageIds]);

  // Check for pending friend requests
  useEffect(() => {
    const fetchPendingFriendRequests = async () => {
      try {
        // Only run if we're authenticated
        if (!API.defaults.headers.Authorization) return;
        
        const response = await API.get('/friendships/pending/');
        const { count, requests } = response.data;
        
        if (count > 0) {
          // Add notifications for pending requests
          requests.forEach(request => {
            const fromUser = request.from_user;
            addNotification({
              type: 'friendship',
              senderId: fromUser.user_id,
              title: 'New Friend Request',
              message: `${fromUser.first_name} ${fromUser.last_name} wants to connect with you`,
              timestamp: request.created_at,
              // When clicked, navigate to the friends page
              onClick: () => {
                window.location.href = '/profile';
              }
            });
          });
        }
      } catch (error) {
        console.error('Error fetching pending friend requests:', error);
      }
    };

    fetchPendingFriendRequests();
    
    // Set up interval to check regularly
    const interval = setInterval(fetchPendingFriendRequests, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [addNotification]);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotification,
      clearAllNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}; 