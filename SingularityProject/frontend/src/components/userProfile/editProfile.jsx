import React, { useState, useEffect } from "react";
import API from "../../services/api";
import ProfileForm from "./profileForm";
import { useNavigate } from "react-router-dom";
import "./upload_photo.jpg";

const EditProfile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    avatar: null, // Initially set to null to indicate no avatar uploaded
  });
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    API.get("/whoami/")
      .then(({ data }) => {
        setUser(data);
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          username: data.username,
          avatar: null, // Reset avatar
        });
      })
      .catch((error) => {
        console.error(error.response);
        setUser(null);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar") {
      setFormData({
        ...formData,
        avatar: files[0], // Store the selected file
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formDataToSubmit = new FormData();
    formDataToSubmit.append("first_name", formData.first_name);
    formDataToSubmit.append("last_name", formData.last_name);
    formDataToSubmit.append("email", formData.email);
    formDataToSubmit.append("username", formData.username);
    // Only append avatar if it's not null (not the default image)
    if (formData.avatar) {
      formDataToSubmit.append("avatar", formData.avatar);
    }

    API.patch(`/users/${user.user_id}/`, formDataToSubmit, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then(({ data }) => {
        setSuccessMsg("✅ Profile updated successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
        setUser(data);
        navigate("/profile");
      })
      .catch((error) => {
        console.error(error);
        setSuccessMsg("❌ Something went wrong. Please try again.");
        setTimeout(() => setSuccessMsg(""), 3000);
      });
  };

  if (user === null) return <div>Loading...</div>;

  // Show preview of uploaded avatar or default image if no avatar uploaded
  const previewURL =
  formData.avatar
    ? URL.createObjectURL(formData.avatar)
    : user.avatar
    ? `${process.env.REACT_APP_API_URL}/media/${user.avatar}`
    : '/default_images/default-avatar.svg';

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
                src={previewURL} // Use the preview URL for avatar
                alt=""
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

          <ProfileForm formData={formData} handleChange={handleChange} />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
