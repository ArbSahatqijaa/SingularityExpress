import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const { addNotification } = useNotifications();
  const processedEvents = useRef(new Set());
  const reconnectTimeoutRef = useRef(null);
  const { user: currentUser } = useAuth();
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  const getWebSocketUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws/communication/`;
  };

  const connect = () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    // Close existing connection if any
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    const ws = new WebSocket(`${getWebSocketUrl()}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttempts.current = 0;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);

        // Skip if we've already processed this event
        const eventId = `${data.action}_${data.friendship_id || data.from_user}_${Date.now()}`;
        if (processedEvents.current.has(eventId)) {
          console.log('Skipping duplicate event:', eventId);
          return;
        }
        processedEvents.current.add(eventId);

        // Clean up old event IDs periodically
        if (processedEvents.current.size > 1000) {
          const idsToKeep = Array.from(processedEvents.current).slice(-1000);
          processedEvents.current = new Set(idsToKeep);
        }

        // Handle different types of messages
        switch (data.action) {
          case 'friendship_request_sent':
            if (data.to_user === currentUser?.user_id) {
              addNotification({
                type: 'friendship',
                title: 'New Friend Request',
                message: `${data.from_user_details?.first_name || 'Someone'} ${data.from_user_details?.last_name || ''} wants to connect with you`,
                timestamp: data.timestamp,
                friendshipId: data.friendship_id
              });
            }
            break;

          case 'friendship_request_accepted':
            // For the sender of the request (when someone accepts their request)
            if (data.to_user === currentUser?.user_id) {
              addNotification({
                type: 'friendship',
                title: 'Friend Request Accepted',
                message: `${data.from_user_details?.first_name || 'Someone'} ${data.from_user_details?.last_name || ''} accepted your friend request`,
                timestamp: data.timestamp,
                friendshipId: data.friendship_id,
                status: 'ACCEPTED'
              });
            }
            // For the receiver who accepted the request (when they accept someone's request)
            else if (data.from_user === currentUser?.user_id) {
              addNotification({
                type: 'friendship',
                title: 'Friend Request Accepted',
                message: `You accepted ${data.to_user_details?.first_name || 'Someone'} ${data.to_user_details?.last_name || ''}'s friend request`,
                timestamp: data.timestamp,
                friendshipId: data.friendship_id,
                status: 'ACCEPTED'
              });
            }
            break;

          case 'friendship_request_rejected':
            if (data.to_user === currentUser?.user_id) {
              addNotification({
                type: 'friendship',
                title: 'Friend Request Rejected',
                message: `${data.from_user_details?.first_name || 'Someone'} ${data.from_user_details?.last_name || ''} rejected your friend request`,
                timestamp: data.timestamp,
                friendshipId: data.friendship_id
              });
            }
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code);
      setIsConnected(false);
      
      // Attempt to reconnect if we haven't exceeded max attempts
      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts.current += 1;
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`Attempting to reconnect (${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})...`);
          connect();
        }, RECONNECT_DELAY);
      } else {
        console.log('Max reconnection attempts reached');
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  };

  // Initial connection
  useEffect(() => {
    const ws = connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [currentUser?.user_id]); // Reconnect when user changes

  const sendMessage = (message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  };

  const value = {
    isConnected,
    sendMessage
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}; 