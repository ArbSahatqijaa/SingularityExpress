import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";

const Login = () => {
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCreds({
      ...creds,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    localStorage.removeItem("jwt");
    delete API.defaults.headers.Authorization;

    try {
      const {
        data: { access },
      } = await API.post("/token/", creds);
      console.log("🎫 New JWT:", access);
      localStorage.setItem("jwt", access);
      const { data: user } = await API.get("/whoami/");
      navigate(user.is_staff ? "/dashboard" : "/home");
    } catch {
      setError("Login failed. Please check your credentials.");
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
          Welcome Back
        </motion.h2>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-100 text-red-800 p-4 rounded-lg mb-4 text-center"
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
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-medium text-gray-600">
              Username
            </label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              name="username"
              type="text"
              required
              value={creds.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              name="password"
              type="password"
              required
              value={creds.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-between items-center text-sm"
          >
            <motion.div whileHover={{ x: -5 }}>
              <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 transition-colors duration-200">
                Forgot password?
              </Link>
            </motion.div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors duration-200"
          >
            Sign In
          </motion.button>
        </motion.form>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm"
        >
          Don't have an account?{" "}
          <motion.span whileHover={{ x: 5 }}>
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 transition-colors duration-200">
              Sign Up
            </Link>
          </motion.span>
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default Login;
