import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useNotifications } from './NotificationContext';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const { addNotification } = useNotifications();

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setUser(null);
      return;
    }

    // Set the token in the API headers
    API.defaults.headers.Authorization = `Bearer ${token}`;

    API.get('/whoami/')
      .then(({ data }) => {
        setUser(data);

        // 🔧 ADD: notify the recipient about each pending friend request
        if (data.pending_friend_requests > 0) {
          API.get('/friendships/?status=PENDING')
            .then(({ data: pendingList }) => {
              pendingList.forEach(f => {
                if (f.to_user_details.user_id === data.user_id) {
                  addNotification({
                    id: `friend-${f.id}`,
                    type: 'friendship',
                    title: `${f.from_user.first_name} sent you a friend request`,
                    message: '',
                    timestamp: new Date().toISOString(),
                    friendshipId: f.id
                  });
                }
              });
            })
            .catch(() => {}); // Silently handle friendship fetch errors
        }
      })
      .catch(() => {
        // If whoami fails, clear the token and user state
        localStorage.removeItem('jwt');
        delete API.defaults.headers.Authorization;
        setUser(null);
      });
  }, [addNotification]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
