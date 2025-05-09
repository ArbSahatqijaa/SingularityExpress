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
// Paper-Project pages
import PaperProjectPage from './pages/auth/dashboard/paper/paper_project/PaperProjectPage';
import PaperProjectForm from './pages/auth/dashboard/paper/paper_project/PaperProjectForm';

//Project pages
import ProjectPage from './pages/auth/dashboard/project/ProjectPage';
import ProjectForm from './pages/auth/dashboard/project/ProjectForm';

//Tutorial Pages
import TutorialPage from './pages/auth/dashboard/tutorial/TutorialPage';
import TutorialForm from './pages/auth/dashboard/tutorial/TutorialForm';

//Review Pages
import ReviewPage from './pages/auth/dashboard/review/ReviewPage';
import ReviewForm from './pages/auth/dashboard/review/ReviewForm';

//Friendship Pages
import FriendshipPage from './pages/auth/dashboard/friendship/FriendshipPage';
import FriendshipForm from './pages/auth/dashboard/friendship/FriendshipForm';

//Invitation Pages
import InvitationPage from './pages/auth/dashboard/invitation/InvitationPage';
import InvitationForm from './pages/auth/dashboard/invitation/InvitationForm';

//User Pages
import UserPaperForm from './pages/auth/dashboard/user_paper/UserPaperForm';
import UserPaperPage from './pages/auth/dashboard/user_paper/UserPaperPage';
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

          {/* Paper-Project CRUD */}
          <Route path="/dashboard/paper_projects" element={<PaperProjectPage />} />
          <Route path="/dashboard/paper_projects/new" element={<PaperProjectForm />} />
          <Route path="/dashboard/paper_projects/edit/:paperProjectId" element={<PaperProjectForm />} />

          {/* Project CRUD */}
          <Route path="/dashboard/projects" element={<ProjectPage />} />
          <Route path="/dashboard/projects/new" element={<ProjectForm />} />
          <Route path="/dashboard/projects/edit/:projectID" element={<ProjectForm />} />   

          {/* Tutorial CRUD */}
          <Route path="/dashboard/tutorials" element={<TutorialPage />} />
         <Route path="/dashboard/tutorials/new" element={<TutorialForm />} />
          <Route path="/dashboard/tutorials/edit/:TutorialID" element={<TutorialForm />} /> 

          {/* Review CRUD */}
          <Route path="/dashboard/reviews" element={<ReviewPage />} />
         <Route path="/dashboard/reviews/new" element={<ReviewForm />} />
          <Route path="/dashboard/reviews/edit/:ReviewID" element={<ReviewForm />} />
          
          {/* Friendship CRUD */}
          <Route path="/dashboard/friendships" element={<FriendshipPage />} />
          <Route path="/dashboard/friendships/new" element={<FriendshipForm />} />
          <Route path="/dashboard/friendships/edit/:friendshipId" element={<FriendshipForm />} />
          
          {/* Invitation CRUD */}
          <Route path="/dashboard/invitations" element={<InvitationPage />} />
          <Route path="/dashboard/invitations/new" element={<InvitationForm />} />
          <Route path="/dashboard/invitations/edit/:invitationId" element={<InvitationForm />} />

          {/* === USER PAPERS === */}
          <Route path="/dashboard/user_papers"               element={<UserPaperPage />} />
          <Route path="/dashboard/user_papers/new"           element={<UserPaperForm />} />
          <Route path="/dashboard/user_papers/edit/:id"      element={<UserPaperForm />} />
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
