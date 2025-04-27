import React, { useState } from "react";
import ProfileForm from "./profileForm";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    bio: "Web developer, tech enthusiast, coffee lover.",
    avatarFile: null,
    avatarPreview: "https://via.placeholder.com/150"
  });

  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        avatarFile: file,
        avatarPreview: URL.createObjectURL(file),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setSuccessMsg("✅ Profile updated successfully!");

    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">Edit Profile</h2>

        {successMsg && (
          <div className="bg-green-100 text-green-800 px-4 py-3 rounded-md border border-green-200">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow">
              <img
                src={formData.avatarPreview}
                alt="Avatar Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Change Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                name="avatar"
                onChange={handleChange}
                className="mt-1 text-sm"
              />
            </div>
          </div>

          <ProfileForm
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
          />
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
