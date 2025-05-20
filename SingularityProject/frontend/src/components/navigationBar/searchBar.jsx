import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
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
    <div className="relative">
      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={handleChange}
        className="px-4 py-2 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {showDropdown && filteredResults.length > 0 && (
        <ul className="absolute mt-1 w-full bg-white border rounded shadow z-50 max-h-60 overflow-y-auto">
          {filteredResults.map((user) => (
            <li
              key={user.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => navigate(`/users/${user.user_id}`)}            >
              {user.username}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
