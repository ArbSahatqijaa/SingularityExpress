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
  // Load notifications from localStorage on initial render
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Derive unreadCount from notifications array instead of separate state
  const unreadCount = notifications.filter(n => !n.read).length;

  // Define addNotification before using it in useEffect
  const addNotification = useCallback((notification) => {
    setNotifications(prev => {
      // Check for duplicate notifications based on type and senderId
      const isDuplicate = prev.some(n => 
        n.type === notification.type && 
        n.senderId === notification.senderId && 
        // For messages, also check messageId
        (notification.type === 'message' ? n.messageId === notification.messageId : true) &&
        // For calls, also check callId
        (notification.type === 'call' ? n.callId === notification.callId : true) &&
        // Only consider notifications within the last 5 seconds as duplicates
        (new Date().getTime() - new Date(n.timestamp).getTime()) < 5000
      );

      if (isDuplicate) {
        return prev; // Return existing notifications without adding a duplicate
      }

      // Create a unique notification with guaranteed unique ID
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      const newNotification = {
        ...notification,
        timestamp: new Date().toISOString(),
        read: false,
        id: uniqueId
      };

      // Add new notification at the beginning of the array
      return [newNotification, ...prev].slice(0, 100); // Keep up to 100 notifications
    });
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

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