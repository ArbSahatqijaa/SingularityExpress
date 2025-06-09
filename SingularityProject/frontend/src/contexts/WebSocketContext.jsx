import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useNotifications } from './NotificationContext';

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

  const getWebSocketUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws/communication/`;
  };

  const connect = () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    const ws = new WebSocket(`${getWebSocketUrl()}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
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
          addNotification({
            type: 'friendship',
            title: 'New Friend Request',
            message: `${data.from_user_details?.first_name} ${data.from_user_details?.last_name} sent you a friend request`,
            timestamp: data.timestamp,
            friendshipId: data.friendship_id
          });
          break;

        case 'friendship_request_accepted':
          addNotification({
            type: 'friendship',
            title: 'Friend Request Accepted',
            message: `${data.from_user_details?.first_name} ${data.from_user_details?.last_name} accepted your friend request`,
            timestamp: data.timestamp,
            friendshipId: data.friendship_id
          });
          break;

        case 'friendship_request_rejected':
          addNotification({
            type: 'friendship',
            title: 'Friend Request Rejected',
            message: `${data.from_user_details?.first_name} ${data.from_user_details?.last_name} rejected your friend request`,
            timestamp: data.timestamp,
            friendshipId: data.friendship_id
          });
          break;
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected, attempting to reconnect...');
      setIsConnected(false);
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connect();
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const sendMessage = (message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}; 