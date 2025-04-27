import axios from './axios';

export const getUserProfile = async () => {
  const res = await axios.get("/users/me");
  return res.data;
};

export const updateUserProfile = async (profileData) => {
  const res = await axios.put("/users/me", profileData);
  return res.data;
};
