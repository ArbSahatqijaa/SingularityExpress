import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    academic_title: "",
    profession: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const pw = form.password;
    const pwValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(pw);
    if (!pwValid) {
      setError(
        "Password must be at least 8 characters and include both letters and numbers."
      );
      return;
    }

    if (pw !== form.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      await API.post("users/", {
        username: form.username,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        academic_title: form.academic_title,
        profession: form.profession,
        password: pw,
      });
      navigate("/login");
    } catch (err) {
      const msgs = err.response?.data || {};
      setError(msgs.username || msgs.email || "Signup failed");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center bg-gray-100 py-12 px-4 min-h-screen"
    >
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-6"
      >
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-center text-gray-800"
        >
          Create an Account
        </motion.h2>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-100 text-red-800 p-3 rounded mb-4 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit} 
          className="space-y-4"
        >
          {[
            { name: 'username', label: 'Username', type: 'text' },
            { name: 'first_name', label: 'First Name', type: 'text' },
            { name: 'last_name', label: 'Last Name', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'password', label: 'Password', type: 'password' },
            { name: 'confirmPassword', label: 'Confirm Password', type: 'password' },
          ].map((field, index) => (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-600">
                {field.label}
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                name={field.name}
                type={field.type}
                required
                value={form[field.name]}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <label className="block text-sm font-medium text-gray-600">
              Academic Title
            </label>
            <motion.select
              whileFocus={{ scale: 1.02 }}
              name="academic_title"
              required
              value={form.academic_title}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            >
              <option value="">Select Title</option>
              <option value="None">None</option>
              <option value="Student">Student</option>
              <option value="Bachelor">Bachelor</option>
              <option value="Master">Master</option>
              <option value="PhD">PhD</option>
            </motion.select>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <label className="block text-sm font-medium text-gray-600">
              Profession
            </label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              name="profession"
              type="text"
              required
              value={form.profession}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors duration-200"
          >
            Sign Up
          </motion.button>
        </motion.form>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm"
        >
          Already have an account?{" "}
          <motion.span whileHover={{ x: 5 }}>
            <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors duration-200">
              Sign In
            </Link>
          </motion.span>
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
