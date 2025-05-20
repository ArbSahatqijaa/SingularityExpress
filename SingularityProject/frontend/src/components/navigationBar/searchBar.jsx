import React, { useState, useEffect } from 'react';
import API from '../../services/api'; // or wherever your API service is

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

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
    }, 300); // debounce: wait 300ms after typing

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={handleChange}
        className="px-4 py-2 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {showDropdown && results.length > 0 && (
        <ul className="absolute mt-1 w-full bg-white border rounded shadow z-50 max-h-60 overflow-y-auto">
          {results.map((user) => (
            <li
              key={user.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                window.location.href = `/user/${user.id}`; // Or use useNavigate()
              }}
            >
              {user.username}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
