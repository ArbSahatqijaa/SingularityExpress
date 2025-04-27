// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import NavigationBar from "./components/navigationBar/navigationbar";
// Auth Pages
import Login from "./pages/auth/logIn";
import Signup from "./pages/auth/signUp";
import ForgotPassword from "./pages/auth/forgotPassword";

// User Profile Components
import Profile from "./components/userProfile/profile";
import EditProfile from "./components/userProfile/editProfile";
import AboutMe from "./components/aboutMe/aboutMe";
import ProjectCard from "./components/projectCard/projectCard";   

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Auth Routes (pa NavigationBar) */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes me NavigationBar */}
        <Route
          path="/*"
          element={
            <>
              <NavigationBar />
              <div className="pt-20 px-6">
                <Routes>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/edit-profile" element={<EditProfile />} />
                  <Route path="/about" element={<AboutMe />} />
                  <Route path="/card" element={<ProjectCard />} />
                </Routes>
              </div>
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
