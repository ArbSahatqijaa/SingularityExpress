import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const processedFriendshipIds = useRef(new Set());
  const processedEventIds = useRef(new Set());
  const token = localStorage.getItem('token');
  const wsRef = useRef(null);
  const lastNotificationRef = useRef(null);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  // Save notifications and processed IDs to localStorage when they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    localStorage.setItem('processedFriendshipIds', JSON.stringify([...processedFriendshipIds.current]));
  }, [notifications]);

  // Clean up old processed IDs periodically
  const cleanupProcessedIds = (set, maxSize = 1000) => {
    if (set.size > maxSize) {
      const idsToKeep = Array.from(set).slice(-maxSize);
      set.clear();
      idsToKeep.forEach(id => set.add(id));
    }
  };

  // Handle friendship notifications with improved duplicate prevention
  const handleFriendshipNotification = (data) => {
    if (!data.action?.startsWith('friendship_request_')) return;

    const friendshipId = data.friendship_id;
    const currentUserId = JSON.parse(atob(token.split('.')[1])).user_id;
    const eventId = `${data.action}_${friendshipId}_${data.timestamp}`;
    
    // Skip if we've already processed this event
    if (processedEventIds.current.has(eventId)) {
      console.log('Skipping duplicate friendship event:', eventId);
      return;
    }
    processedEventIds.current.add(eventId);
    cleanupProcessedIds(processedEventIds.current);

    // Create notification based on the action and user role
    let notification = null;
    const fromUser = data.from_user_details || data.from_user || { first_name: 'Someone', last_name: '' };
    const toUser = data.to_user_details || data.to_user || { first_name: 'Someone', last_name: '' };

    // Helper function to create notification object
    const createNotification = (title, message, status) => ({
      type: 'friendship',
      title,
      message,
      timestamp: data.timestamp || new Date().toISOString(),
      friendshipId: friendshipId,
      fromUser: data.from_user,
      toUser: data.to_user,
      fromUserDetails: data.from_user_details,
      toUserDetails: data.to_user_details,
      status,
      eventId
    });

    switch (data.action) {
      case 'friendship_request_sent':
        if (data.to_user === currentUserId) {
          notification = createNotification(
            'New Friend Request',
            `${fromUser.first_name} ${fromUser.last_name} wants to connect with you`,
            'PENDING'
          );
        } else if (data.from_user === currentUserId) {
          notification = createNotification(
            'Friend Request Sent',
            `You sent a friend request to ${toUser.first_name} ${toUser.last_name}`,
            'PENDING'
          );
        }
        break;

      case 'friendship_request_accepted':
        if (data.to_user === currentUserId) {
          notification = createNotification(
            'Friend Request Accepted',
            `${fromUser.first_name} ${fromUser.last_name} accepted your friend request`,
            'ACCEPTED'
          );
        } else if (data.from_user === currentUserId) {
          notification = createNotification(
            'Friend Request Accepted',
            `You accepted ${toUser.first_name} ${toUser.last_name}'s friend request`,
            'ACCEPTED'
          );
        }
        break;

      case 'friendship_request_rejected':
        if (data.to_user === currentUserId) {
          notification = createNotification(
            'Friend Request Rejected',
            `${fromUser.first_name} ${fromUser.last_name} rejected your friend request`,
            'REJECTED'
          );
        } else if (data.from_user === currentUserId) {
          notification = createNotification(
            'Friend Request Rejected',
            `You rejected ${toUser.first_name} ${toUser.last_name}'s friend request`,
            'REJECTED'
          );
        }
        break;

      case 'friendship_deleted':
        if (data.to_user === currentUserId || data.from_user === currentUserId) {
          const otherUser = data.to_user === currentUserId ? fromUser : toUser;
          notification = createNotification(
            'Friendship Ended',
            `Your friendship with ${otherUser.first_name} ${otherUser.last_name} has ended`,
            'DELETED'
          );
        }
        break;
    }

    if (notification) {
      // Check for duplicate notification (same type, friendshipId, and within 30 seconds)
      const isDuplicate = notifications.some(n => 
        n.type === notification.type &&
        n.friendshipId === notification.friendshipId &&
        Math.abs(new Date(n.timestamp) - new Date(notification.timestamp)) < 30000
      );

      if (!isDuplicate) {
        setNotifications(prev => {
          // Remove any existing notifications for this friendship
          const filtered = prev.filter(n => n.friendshipId !== friendshipId);
          // Add the new notification at the beginning
          return [notification, ...filtered].slice(0, 50);
        });
      }
    }
  };

  // WebSocket message handler
  const handleWebSocketMessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'broadcast.friendship') {
        handleFriendshipNotification(data);
      }
      // ... handle other notification types ...
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  };

  // Set up WebSocket connection
  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/communication/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected for notifications');
    };

    ws.onmessage = handleWebSocketMessage;

    ws.onclose = () => {
      console.log('WebSocket disconnected, attempting to reconnect...');
      setTimeout(() => {
        if (wsRef.current) {
          wsRef.current = new WebSocket(`ws://localhost:8000/ws/communication/?token=${token}`);
        }
      }, 3000);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [token]);

  const addNotification = (notification) => {
    // For friendship notifications, check if we've already processed this ID
    if (notification.type === 'friendship' && notification.friendshipId) {
      if (processedFriendshipIds.current.has(notification.friendshipId)) {
        console.log('Skipping duplicate friendship notification:', notification.friendshipId);
        return;
      }
      processedFriendshipIds.current.add(notification.friendshipId);
    }

    // Check for duplicate notification (same type, title, and within 5 seconds)
    const isDuplicate = notifications.some(n => 
      n.type === notification.type &&
      n.title === notification.title &&
      n.fromUser === notification.fromUser &&
      Math.abs(new Date(n.timestamp) - new Date(notification.timestamp)) < 5000
    );

    if (!isDuplicate) {
      setNotifications(prev => [notification, ...prev].slice(0, 50));
    }
  };

  const removeNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (index) => {
    setNotifications(prev => 
      prev.map((notification, i) => 
        i === index ? { ...notification, read: true } : notification
      )
    );
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    markAsRead,
    handleWebSocketMessage
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 