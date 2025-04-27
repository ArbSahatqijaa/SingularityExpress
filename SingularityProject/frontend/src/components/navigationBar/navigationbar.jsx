import { useState } from 'react';
import { Link } from 'react-router-dom'; 
import SearchBar from './searchBar';
import Notifications from './notifications';

const NavigationBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="bg-white shadow-md px-8 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="text-2xl font-extrabold text-gray-800">
        <Link to="/profile">
          Singularity<span className="text-blue-600">Express</span>
        </Link>
      </div>

      <div className="flex items-center gap-8">
        <Link to="/profile" className="text-gray-700 hover:text-blue-600 font-medium transition">
          Home
        </Link>
        <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition">
          Projects
        </Link>
        <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition">
          Posts
        </Link>
      </div>

      <div className="flex items-center gap-6 relative">
        <SearchBar />
        <Notifications />

        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg transition"
          >
            U
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
              <Link
                to="/edit-profile"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
              >
                Edit Profile
              </Link>
              <Link
                to="/"
                className="block px-4 py-2 text-red-700 hover:bg-gray-100 transition"
              >
                LogOut
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
