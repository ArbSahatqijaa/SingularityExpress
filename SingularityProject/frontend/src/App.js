// src/App.js
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';

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
import Home from './components/home/Home';
import CommunicationHub from './pages/CommunicationHub';

// Paper pages
import PaperPage from './pages/auth/dashboard/paper/PaperPage';
import PaperForm from './pages/auth/dashboard/paper/PaperForm';

// Paper-Project pages
import PaperProjectPage from './pages/auth/dashboard/paper_project/PaperProjectPage';
import PaperProjectForm from './pages/auth/dashboard/paper_project/PaperProjectForm';

// Project pages
import ProjectPage from './pages/auth/dashboard/project/ProjectPage';
import ProjectForm from './pages/auth/dashboard/project/ProjectForm';

// Tutorial Pages
import TutorialPage from './pages/auth/dashboard/tutorial/TutorialPage';
import TutorialForm from './pages/auth/dashboard/tutorial/TutorialForm';

// Review Pages
import ReviewPage from './pages/auth/dashboard/review/ReviewPage';
import ReviewForm from './pages/auth/dashboard/review/ReviewForm';

// Friendship Pages
import FriendshipPage from './pages/auth/dashboard/friendship/FriendshipPage';
import FriendshipForm from './pages/auth/dashboard/friendship/FriendshipForm';

// Invitation Pages
import InvitationPage from './pages/auth/dashboard/invitation/InvitationPage';
import InvitationForm from './pages/auth/dashboard/invitation/InvitationForm';

// User-Paper Pages
import UserPaperForm from './pages/auth/dashboard/user_paper/UserPaperForm';
import UserPaperPage from './pages/auth/dashboard/user_paper/UserPaperPage';

// Required Roles Pages
import RequiredrolesPage from './pages/auth/dashboard/requirement_roles/RequiredrolesPage';
import RequiredrolesForm from './pages/auth/dashboard/requirement_roles/RequiredrolesForm';

// User-Project Pages
import UserProjectPage from './pages/auth/dashboard/user_project/UserProjectPage';
import UserProjectForm from './pages/auth/dashboard/user_project/UserProjectForm';

//ChatBot
import Chatbot from './components/home/Chatboxtest'

// User Profile
import UserProfile from './components/userProfile/friendsList/UserProfile';

function LayoutWithNav() {
  return (
    <>
      <NavigationBar />
      <div className="pt-20 px-6">
        <Outlet />
      </div>
    </>
  );
}

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Public auth routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/chatbot" element={<Chatbot />} />

          {/* Staff-only routes */}
          <Route element={<RequireStaff><Outlet /></RequireStaff>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/users" element={<UsersPage />} />
            <Route path="/dashboard/users/new" element={<UserForm />} />
            <Route path="/dashboard/users/edit/:userId" element={<UserForm />} />

            <Route path="/dashboard/papers" element={<PaperPage />} />
            <Route path="/dashboard/papers/new" element={<PaperForm />} />
            <Route path="/dashboard/papers/edit/:paperId" element={<PaperForm />} />

            <Route path="/dashboard/paper_projects" element={<PaperProjectPage />} />
            <Route path="/dashboard/paper_projects/new" element={<PaperProjectForm />} />
            <Route path="/dashboard/paper_projects/edit/:paperProjectId" element={<PaperProjectForm />} />

            <Route path="/dashboard/projects" element={<ProjectPage />} />
            <Route path="/dashboard/projects/new" element={<ProjectForm />} />
            <Route path="/dashboard/projects/edit/:projectID" element={<ProjectForm />} />

            <Route path="/dashboard/tutorials" element={<TutorialPage />} />
            <Route path="/dashboard/tutorials/new" element={<TutorialForm />} />
            <Route path="/dashboard/tutorials/edit/:TutorialID" element={<TutorialForm />} />

            <Route path="/dashboard/reviews" element={<ReviewPage />} />
            <Route path="/dashboard/reviews/new" element={<ReviewForm />} />
            <Route path="/dashboard/reviews/edit/:ReviewID" element={<ReviewForm />} />

            <Route path="/dashboard/friendships" element={<FriendshipPage />} />
            <Route path="/dashboard/friendships/new" element={<FriendshipForm />} />
            <Route path="/dashboard/friendships/edit/:friendshipId" element={<FriendshipForm />} />

            <Route path="/dashboard/invitations" element={<InvitationPage />} />
            <Route path="/dashboard/invitations/new" element={<InvitationForm />} />
            <Route path="/dashboard/invitations/edit/:invitationId" element={<InvitationForm />} />

            <Route path="/dashboard/user_papers" element={<UserPaperPage />} />
            <Route path="/dashboard/user_papers/new" element={<UserPaperForm />} />
            <Route path="/dashboard/user_papers/edit/:userPaperId" element={<UserPaperForm />} />

            <Route path="/dashboard/required_roles" element={<RequiredrolesPage />} />
            <Route path="/dashboard/required_roles/new" element={<RequiredrolesForm />} />
            <Route path="/dashboard/required_roles/edit/:RequiredrolesID" element={<RequiredrolesForm />} />

            <Route path="/dashboard/user_projects" element={<UserProjectPage />} />
            <Route path="/dashboard/user_projects/new" element={<UserProjectForm />} />
            <Route path="/dashboard/user_projects/edit/:userProjectId" element={<UserProjectForm />} />

          </Route>
          {/* All other routes with navbar */}
          <Route element={<LayoutWithNav />}>
            <Route path="profile" element={<Profile />} />
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="about" element={<AboutMe />} />
            <Route path="card" element={<ProjectCard />} />
            <Route path="home" element={<Home />} />
            <Route path="communication" element={<CommunicationHub />} />

            <Route path="/users/:id" element={<UserProfile />} />

          </Route>
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
