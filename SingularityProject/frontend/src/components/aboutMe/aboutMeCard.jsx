import React from "react";

const AboutMeCard = ({ info }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-700">About Me</h2>

      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Bio</h3>
        <p className="text-gray-700">{info.bio}</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Position</h3>
        <p className="text-gray-700">{info.position}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Phone</h4>
          <p className="text-gray-700">{info.phone}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Date of Birth</h4>
          <p className="text-gray-700">{info.dob}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Email</h4>
          <p className="text-gray-700">{info.email}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Location</h4>
          <p className="text-gray-700">{info.location}</p>
        </div>
      </div>
    </div>
  );
};

export default AboutMeCard;
