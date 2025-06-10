import React, { useEffect, useState, useRef, useCallback } from 'react';
import API from '../../services/api';    // your axios instance
import { Link } from 'react-router-dom';

export default function TrendingFeed({ kind = 'projects' }) {
  const [trendingItems, setTrendingItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const trendingItemsRef = useRef([]); // Add ref to track current trending items

  // Update ref when trendingItems changes
  useEffect(() => {
    trendingItemsRef.current = trendingItems;
  }, [trendingItems]);

  const fetchTrendingItems = useCallback(async () => {
    try {
      const response = await API.get('/projects/trending/');
      // Use the backend's sorting (by member count) and take only the 3 most trending
      const sortedItems = response.data.slice(0, 3);
      setTrendingItems(sortedItems);
    } catch (error) {
      console.error('Error fetching trending items:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      console.log('No JWT token found, skipping WebSocket connection');
      return;
    }

    console.log('JWT token found, attempting WebSocket connection...');

    // Clear any existing reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Get the base URL from the API instance
    const baseUrl = API.defaults.baseURL || 'http://localhost:8000';
    let url;
    try {
      url = new URL(baseUrl);
      console.log('Using base URL:', baseUrl);
    } catch (e) {
      console.error("Invalid API base URL:", baseUrl, e);
      // Fallback if URL is invalid, though it shouldn't be for localhost
      url = new URL('http://localhost:8000');
      console.log('Falling back to localhost URL');
    }

    const wsProtocol = url.protocol === 'https:' ? 'wss' : 'ws';
    const wsHost = url.host; // This will be localhost:8000

    // Use the communication endpoint since it's already working
    const wsUrl = `${wsProtocol}://${wsHost}/ws/communication/?token=${token}`;
    console.log('Attempting WebSocket connection to:', wsUrl);
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        console.log('WebSocket readyState:', ws.readyState);
        setWsConnected(true);
        setError('');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error details:', {
          error,
          readyState: ws.readyState,
          url: wsUrl,
          timestamp: new Date().toISOString()
        });
        setError('WebSocket connection error - check console for details');
        setWsConnected(false);
      };

      ws.onmessage = (event) => {
        console.log('Received WebSocket message at:', new Date().toISOString());
        console.log('Raw message data:', event.data);
        try {
          const data = JSON.parse(event.data);
          console.log('Parsed message data:', data);
          
          switch (data.action) {
            case 'new_project':
              console.log('Received new project:', data.project);
              console.log('Current trending items:', trendingItemsRef.current);
              setTrendingItems(prev => {
                // Check if project already exists in the list
                const exists = prev.some(p => p.project_id === data.project.project_id);
                if (exists) {
                  console.log('Project already in list, skipping update');
                  return prev;
                }
                
                // Add new project and sort by member count
                const newItems = [...prev, data.project]
                  .sort((a, b) => (b.worker_count || 0) - (a.worker_count || 0))
                  .slice(0, 3);
                console.log('Updated trending items:', newItems);
                return newItems;
              });
              break;
            default:
              console.log('Unhandled WebSocket action:', data.action, 'Full message:', data);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
          console.error('Raw message that caused error:', event.data);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', {
          code: event.code,
          reason: event.reason,
          timestamp: new Date().toISOString(),
          wasClean: event.wasClean
        });
        setWsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect WebSocket...');
          connectWebSocket();
        }, 3000);
      };

      return ws;
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      console.error('Connection attempt details:', {
        url: wsUrl,
        timestamp: new Date().toISOString()
      });
      setError('Failed to create WebSocket connection');
      setWsConnected(false);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchTrendingItems();
    const ws = connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        console.log('Cleaning up WebSocket connection');
        wsRef.current.close();
      }
    };
  }, [fetchTrendingItems, connectWebSocket]);

  if (isLoading) return <div className="bg-white p-6 rounded-lg shadow-lg">Loading…</div>;
  if (error)   return <div className="bg-white p-6 rounded-lg shadow-lg text-red-500">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-semibold text-gray-900 mb-4">
        Trending {kind === 'projects' ? 'Projects' : 'Papers'}
      </h3>
      {trendingItems.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No recent {kind} found</p>
      ) : (
        <ul>
          {trendingItems.map(it => {
            const id    = it.project_id ?? it.paper_id;
            const title = it.title;
            const desc  = it.description;
            const count = it.worker_count;
            const createdAt = new Date(it.created_at).toLocaleDateString();
            return (
              <li key={id}
                  className="border-b py-4 hover:bg-gray-50 rounded-lg transition-all duration-300">
                <Link
                  to={`/${kind}/${id}`}
                  className="flex justify-between items-start"
                >
                  <div className="pr-3 max-w-[180px]">
                    <h4 className="font-semibold text-gray-800 truncate">{title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{desc}</p>
                    <p className="text-xs text-gray-400 mt-1">Created: {createdAt}</p>
                  </div>
                  <span className="text-sm text-gray-500 shrink-0 ml-3">
                    Members: {count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
