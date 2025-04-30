// src/App.js
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';

import NavigationBar from './components/navigationBar/navigationbar';

// Auth pages
import Login from './pages/auth/logIn';
import Signup from './pages/auth/signUp';
import ForgotPassword from './pages/auth/forgotPassword';
import Dashboard from './pages/auth/dashboard/Dashboard';
import RequireStaff from './pages/auth/RequireStaff';

// User profile pages
import Profile from './components/userProfile/profile';
import EditProfile from './components/userProfile/editProfile';
import AboutMe from './components/aboutMe/aboutMe';
import ProjectCard from './components/projectCard/projectCard';

// ─── Layout wrapper that shows the NavigationBar on every protected page ──
function LayoutWithNav() {
  return (
    <>
      <NavigationBar />
      <div className="pt-20 px-6">
        <Outlet /> {/* nested routes rendered here */}
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public auth routes (no navbar) */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Staff-only dashboard */}
        <Route
          path="/dashboard"
          element={
            <RequireStaff>
              <Dashboard />
            </RequireStaff>
          }
        />

        {/* All other routes that need the NavigationBar */}
        <Route element={<LayoutWithNav />}>
          <Route path="profile" element={<Profile />} />
          <Route path="edit-profile" element={<EditProfile />} />
          <Route path="about" element={<AboutMe />} />
          <Route path="card" element={<ProjectCard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
