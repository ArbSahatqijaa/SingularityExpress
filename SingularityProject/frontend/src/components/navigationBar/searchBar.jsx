import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate(); 

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim() !== '') {
        API.get(`/users/?search=${query}`)
          .then((res) => {
            setResults(res.data);
            setShowDropdown(true);
          })
          .catch(() => {
            setResults([]);
            setShowDropdown(false);
          });
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const filteredResults = results.filter(user =>
    user.username.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <motion.input
        whileFocus={{ scale: 1.02 }}
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={handleChange}
        className="px-4 py-2 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-all duration-200 bg-white/80 backdrop-blur-sm"
      />

      <AnimatePresence>
        {showDropdown && filteredResults.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto backdrop-blur-sm bg-white/90"
          >
            {filteredResults.map((user, index) => (
              <motion.li
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 5, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                className="px-4 py-2 cursor-pointer text-gray-700 hover:text-blue-600 transition-colors duration-200"
                onClick={() => navigate(`/users/${user.user_id}`)}
              >
                {user.username}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SearchBar;
