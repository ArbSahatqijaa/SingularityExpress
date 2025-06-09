import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import SearchBar from './searchBar';
import NotificationBell from '../NotificationBell';

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
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="bg-white shadow-md px-8 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-sm bg-white/90"
    >
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="text-2xl font-extrabold text-gray-800"
      >
        <Link to={user ? '/profile' : '/'}>
          Singularity<span className="text-blue-600">Express</span>
        </Link>
      </motion.div>

      {user && (
        <div className="flex items-center gap-8">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/home" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
              Home
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/profile" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
              Profile
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {user?.is_staff && (
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                Dashboard
              </Link>
            )}
          </motion.div>
        
        </div>
      )}

      <div className="flex items-center gap-6 relative">
        <SearchBar />
        <NotificationBell />

        {user ? (
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDropdown}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 flex items-center justify-center text-white font-bold text-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {user.username.charAt(0).toUpperCase()}
            </motion.button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100"
                >
                  <motion.div whileHover={{ x: 5 }}>
                    <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200">
                      Profile
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link to="/edit-profile" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200">
                      Edit Profile
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ x: 5 }}>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      Log Out
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              to="/login" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Log In
            </Link>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
