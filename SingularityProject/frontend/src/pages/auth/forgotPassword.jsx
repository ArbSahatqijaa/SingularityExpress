import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    console.log("Submitting email for password reset:", email);

    try {
      console.log("Making POST request to /password-reset/");
      const response = await API.post("/password-reset/", { email });
      console.log("Response received:", response.data);
      setSuccess(response.data.message);
      setStep(2);
    } catch (err) {
      console.error("Error in password reset request:", err);
      setError(err.response?.data?.error || "Failed to send reset code");
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await API.put("/password-reset/", {
        email,
        code,
        new_password: newPassword,
      });
      setSuccess("Password updated successfully");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update password");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-gray-100 px-4"
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
          {step === 1
            ? "Reset Your Password"
            : step === 2
            ? "Enter Reset Code"
            : "Set New Password"}
        </motion.h2>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 text-red-500 p-3 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 text-green-500 p-3 rounded-lg text-sm"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form 
              key="email-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleEmailSubmit} 
              className="space-y-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-600">
                  Email Address
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors duration-200"
              >
                Send Reset Code
              </motion.button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form 
              key="reset-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleCodeSubmit} 
              className="space-y-4"
            >
              {[
                { label: 'Reset Code', value: code, onChange: (e) => setCode(e.target.value), type: 'text', placeholder: 'Enter the 6-digit code' },
                { label: 'New Password', value: newPassword, onChange: (e) => setNewPassword(e.target.value), type: 'password', placeholder: 'Enter new password' },
                { label: 'Confirm Password', value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), type: 'password', placeholder: 'Confirm new password' },
              ].map((field, index) => (
                <motion.div
                  key={field.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <label className="block text-sm font-medium text-gray-600">
                    {field.label}
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type={field.type}
                    value={field.value}
                    onChange={field.onChange}
                    required
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                </motion.div>
              ))}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors duration-200"
              >
                Reset Password
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm"
        >
          Remembered your password?{" "}
          <motion.span whileHover={{ x: 5 }}>
            <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors duration-200">
              Sign In
            </Link>
          </motion.span>
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default ForgotPassword;
