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
import UsersPage from './pages/auth/dashboard/user/UserPage';
import UserForm from './pages/auth/dashboard/user/UserForm';
import Profile from './components/userProfile/profile';
import EditProfile from './components/userProfile/editProfile';
import AboutMe from './components/aboutMe/aboutMe';
import ProjectCard from './components/projectCard/projectCard';

// Paper pages
import PaperPage from './pages/auth/dashboard/paper/PaperPage';
import PaperForm from './pages/auth/dashboard/paper/PaperForm';

//Project pages
import ProjectPage from './pages/auth/dashboard/project/ProjectPage';
import ProjectForm from './pages/auth/dashboard/project/ProjectForm';

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

         {/* Staff-only routes */}
         <Route element={<RequireStaff><Outlet/></RequireStaff>}>
          {/* Top‐level dashboard overview */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Users CRUD */}
          <Route path="/dashboard/users" element={<UsersPage />} />
          <Route path="/dashboard/users/new" element={<UserForm />} />
          <Route path="/dashboard/users/edit/:userId" element={<UserForm />} />

          {/* Paper CRUD */}
          <Route path="/dashboard/papers" element={<PaperPage />} />
          <Route path="/dashboard/papers/new" element={<PaperForm />} />
          <Route path="/dashboard/papers/edit/:paperId" element={<PaperForm />} />

          {/* Project CRUD */}
          <Route path="/dashboard/projects" element={<ProjectPage />} />
          <Route path="/dashboard/projects/new" element={<ProjectForm />} />
          <Route path="/dashboard/projects/edit/:projectID" element={<ProjectForm />} />        
        </Route>



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
