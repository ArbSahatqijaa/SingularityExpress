import React, { useState } from "react";
import { BellIcon } from "lucide-react";

const Notifications = () => {
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => {
    setOpen(!open);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-black-100 dark:hover:bg-gray-200"
      >
        <BellIcon className="w-6 h-6 text-black dark:text-black-200" />
        {/* Badge e kuqe për numër njoftimesh në të ardhmen */}
        <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-600 rounded-full" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4 text-center text-gray-500 dark:text-gray-300">
            No notifications right now
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
