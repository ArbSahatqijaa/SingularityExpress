import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import SearchBar from './searchBar';
import Notifications from './notifications';

export default function NavigationBar() {
  const [user, setUser] = useState(undefined);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    delete API.defaults.headers.Authorization;
    navigate('/login', { replace: true });
  };

  if (user === undefined) return null;

  return (
    <nav className="bg-white shadow-md px-8 py-4 flex items-center justify-between">
      <div className="text-2xl font-extrabold text-gray-800">
        <Link to={user ? '/profile' : '/'}>Singularity<span className="text-blue-600">Express</span></Link>
      </div>

      {user && (
        <div className="flex items-center gap-8">
          <Link to="/profile" className="text-gray-700 hover:text-blue-600 font-medium transition">Home</Link>
          <Link to="/projects" className="text-gray-700 hover:text-blue-600 font-medium transition">Projects</Link>
          <Link to="/posts" className="text-gray-700 hover:text-blue-600 font-medium transition">Posts</Link>
          <Link to="/communication" className="text-gray-700 hover:text-blue-600 font-medium transition">Communication</Link>
        </div>
      )}

      <div className="flex items-center gap-6 relative">
        <SearchBar />
        <Notifications />

        {user ? (
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg transition"
            >
              {user.username.charAt(0).toUpperCase()}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                <Link to="/edit-profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition">
                  Edit Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-700 hover:bg-gray-100 transition"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium transition">
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
}
