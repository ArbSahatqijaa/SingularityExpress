import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import API from '../../services/api';

export default function RequireStaff({ children }) {
  const [user, setUser] = useState(undefined); 

  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => setUser(data)) 
      .catch(() => setUser(null));       
  }, []);

  if (user === undefined) {
    return null;
  }

  if (user === null || !user.is_staff) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
