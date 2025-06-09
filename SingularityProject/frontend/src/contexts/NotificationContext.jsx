import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [processedFriendshipIds] = useState(() => {
    const saved = localStorage.getItem('processedFriendshipIds');
    return new Set(saved ? JSON.parse(saved) : []);
  });
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
    localStorage.setItem('processedFriendshipIds', JSON.stringify([...processedFriendshipIds]));
  }, [notifications, processedFriendshipIds]);

  // Set up WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/communication/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected for notifications');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data);

      // Handle friendship events
      if (data.action?.startsWith('friendship_request_')) {
        const friendshipId = data.friendship_id;
        const currentUserId = JSON.parse(atob(token.split('.')[1])).user_id;
        
        // Skip if we've already processed this friendship event
        if (processedFriendshipIds.has(friendshipId)) {
          console.log('Skipping duplicate friendship event:', friendshipId);
          return;
        }
        processedFriendshipIds.add(friendshipId);

        // Clean up old IDs periodically
        if (processedFriendshipIds.size > 1000) {
          const idsToKeep = Array.from(processedFriendshipIds).slice(-1000);
          processedFriendshipIds.clear();
          idsToKeep.forEach(id => processedFriendshipIds.add(id));
        }

        // Create notification based on the action and user role
        let notification = null;
        const fromUser = data.from_user_details || data.from_user || { first_name: 'Someone', last_name: '' };
        const toUser = data.to_user_details || data.to_user || { first_name: 'Someone', last_name: '' };

        switch (data.action) {
          case 'friendship_request_sent':
            // For the receiver
            if (data.to_user === currentUserId) {
              notification = {
                type: 'friendship',
                title: 'New Friend Request',
                message: `${fromUser.first_name} ${fromUser.last_name} wants to connect with you`,
                timestamp: data.timestamp || new Date().toISOString(),
                friendshipId: friendshipId,
                fromUser: data.from_user,
                status: 'PENDING'
              };
            }
            // For the sender
            else if (data.from_user === currentUserId) {
              notification = {
                type: 'friendship',
                title: 'Friend Request Sent',
                message: `You sent a friend request to ${toUser.first_name} ${toUser.last_name}`,
                timestamp: data.timestamp || new Date().toISOString(),
                friendshipId: friendshipId,
                toUser: data.to_user,
                status: 'PENDING'
              };
            }
            break;

          case 'friendship_request_accepted':
            // For the sender
            if (data.to_user === currentUserId) {
              notification = {
                type: 'friendship',
                title: 'Friend Request Accepted',
                message: `${fromUser.first_name} ${fromUser.last_name} accepted your friend request`,
                timestamp: data.timestamp || new Date().toISOString(),
                friendshipId: friendshipId,
                fromUser: data.from_user,
                status: 'ACCEPTED'
              };
            }
            // For the receiver
            else if (data.from_user === currentUserId) {
              notification = {
                type: 'friendship',
                title: 'Friend Request Accepted',
                message: `You accepted ${toUser.first_name} ${toUser.last_name}'s friend request`,
                timestamp: data.timestamp || new Date().toISOString(),
                friendshipId: friendshipId,
                toUser: data.to_user,
                status: 'ACCEPTED'
              };
            }
            break;

          case 'friendship_request_rejected':
            // For the sender
            if (data.to_user === currentUserId) {
              notification = {
                type: 'friendship',
                title: 'Friend Request Rejected',
                message: `${fromUser.first_name} ${fromUser.last_name} rejected your friend request`,
                timestamp: data.timestamp || new Date().toISOString(),
                friendshipId: friendshipId,
                fromUser: data.from_user,
                status: 'REJECTED'
              };
            }
            // For the receiver
            else if (data.from_user === currentUserId) {
              notification = {
                type: 'friendship',
                title: 'Friend Request Rejected',
                message: `You rejected ${toUser.first_name} ${toUser.last_name}'s friend request`,
                timestamp: data.timestamp || new Date().toISOString(),
                friendshipId: friendshipId,
                toUser: data.to_user,
                status: 'REJECTED'
              };
            }
            break;
        }

        if (notification) {
          // Check for duplicate notification (same type, title, and within 5 seconds)
          const isDuplicate = notifications.some(n => 
            n.type === notification.type &&
            n.title === notification.title &&
            n.friendshipId === notification.friendshipId &&
            Math.abs(new Date(n.timestamp) - new Date(notification.timestamp)) < 5000
          );

          if (!isDuplicate) {
            setNotifications(prev => [notification, ...prev].slice(0, 50));
          }
        }
      }
    };

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
  }, [processedFriendshipIds]);

  const addNotification = (notification) => {
    // For friendship notifications, check if we've already processed this ID
    if (notification.type === 'friendship' && notification.friendshipId) {
      if (processedFriendshipIds.has(notification.friendshipId)) {
        console.log('Skipping duplicate friendship notification:', notification.friendshipId);
        return;
      }
      processedFriendshipIds.add(notification.friendshipId);
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
    markAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 