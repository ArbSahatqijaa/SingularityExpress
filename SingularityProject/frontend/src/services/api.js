import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api', 
});

API.interceptors.request.use((config) => {
  // Don't add auth token for password reset endpoints
  if (config.url === '/password-reset/') {
    return config;
  }
  
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getUserProfile() {
  const { data } = await API.get('/whoami/');
  return data;
}

export default API;
