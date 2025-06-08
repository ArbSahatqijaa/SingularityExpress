import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api', 
});

// Add request interceptor
API.interceptors.request.use((config) => {
  // Don't add auth token for password reset endpoints
  if (config.url === '/password-reset/') {
    return config;
  }
  
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add silent flag for endpoints that should not log errors
  if (config.url === '/whoami/') {
    config.silent = true;
  }
  
  return config;
});

// Add response interceptor to handle errors gracefully
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't log errors for silent requests
    if (error.config?.silent) {
      return Promise.reject(error);
    }

    // Only log 401s if they're not for /whoami/ endpoint
    if (error.response?.status === 401 && !error.config.url.includes('/whoami/')) {
      console.error('Authentication error:', error.response?.data);
    }
    return Promise.reject(error);
  }
);

export async function getUserProfile() {
  const { data } = await API.get('/whoami/');
  return data;
}

export default API;
