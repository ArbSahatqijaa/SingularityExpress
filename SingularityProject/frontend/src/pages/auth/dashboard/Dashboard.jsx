// src/pages/auth/dashboard/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../services/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [data, setData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data: user } = await API.get('/whoami/');
        if (!user.is_staff) throw new Error('Not authorized');

        const [
          usersRes,
          friendshipsRes,
          projectsRes,
          papersRes,
          tutorialsRes,
          reviewsRes,
          invitationsRes,
          rolesRes,
          userPapersRes,
          userProjectsRes,
          paperProjectsRes,
        ] = await Promise.all([
          API.get('/users/'),
          API.get('/friendships/'),
          API.get('/projects/'),
          API.get('/papers/'),
          API.get('/tutorials/'),
          API.get('/reviews/'),
          API.get('/invitations/'),
          API.get('/required_roles/'),
          API.get('/user_papers/'),
          API.get('/user_projects/'),
          API.get('/paper_projects/'),
        ]);

        setData({
          total_users:         usersRes.data.length,
          total_friendships:   friendshipsRes.data.length,
          total_projects:      projectsRes.data.length,
          total_papers:        papersRes.data.length,
          total_tutorials:     tutorialsRes.data.length,
          total_reviews:       reviewsRes.data.length,
          total_invitations:   invitationsRes.data.length,
          total_roles:         rolesRes.data.length,
          total_user_papers:   userPapersRes.data.length,
          total_user_projects: userProjectsRes.data.length,
          total_paper_projects:paperProjectsRes.data.length,
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        navigate('/');
      }
    })();
  }, [navigate]);

  const chartData = {
    labels: [
      'Users', 'Friendships', 'Projects', 'Papers', 'Tutorials',
      'Reviews', 'Invitations', 'Roles', 'User-Papers', 'User-Projects',
      'Paper-Projects',
    ],
    datasets: [
      {
        label: 'Counts',
        data: [
          data.total_users || 0,
          data.total_friendships || 0,
          data.total_projects || 0,
          data.total_papers || 0,
          data.total_tutorials || 0,
          data.total_reviews || 0,
          data.total_invitations || 0,
          data.total_roles || 0,
          data.total_user_papers || 0,
          data.total_user_projects || 0,
          data.total_paper_projects || 0,
        ],
        backgroundColor: Array(11).fill('#007bff'),
        borderColor: '#fff',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Singularity Express Dashboard Overview',
      },
    },
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-5 fw-bold text-primary">Dashboard</h1>

      <ul className="nav nav-pills justify-content-center mb-5 flex-wrap gap-2">
        <li className="nav-item">
          <button className="nav-link" onClick={() => navigate('/dashboard/users')}>
            Users
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link" onClick={() => navigate('/dashboard/friendships')}>
            Friendships
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link" onClick={() => navigate('/dashboard/projects')}>
            Projects
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link" onClick={() => navigate('/dashboard/papers')}>
            Papers
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link" onClick={() => navigate('/dashboard/tutorials')}>
            Tutorials
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link" onClick={() => navigate('/dashboard/reviews')}>
            Reviews
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link" onClick={() => navigate('/dashboard/invitations')}>
            Invitations
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link" onClick={() => navigate('/dashboard/required_roles')}>
            Roles
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link" onClick={() => navigate('/dashboard/user_papers')}>
            User-Papers
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link" onClick={() => navigate('/dashboard/user_projects')}>
            User-Projects
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link" onClick={() => navigate('/dashboard/paper_projects')}>
            Paper-Projects
          </button>
        </li>
      </ul>

      <div className="card shadow mb-5">
        <div className="card-body">
          <h2 className="mb-4 fw-bold text-danger">Overview Chart</h2>
          <div className="chart-container mb-4">
            <Bar data={chartData} options={chartOptions} />
          </div>

          <h3 className="mt-4">Summary</h3>
          <ul className="list-group">
            <li className="list-group-item">Users: {data.total_users || 0}</li>
            <li className="list-group-item">Friendships: {data.total_friendships || 0}</li>
            <li className="list-group-item">Projects: {data.total_projects || 0}</li>
            <li className="list-group-item">Papers: {data.total_papers || 0}</li>
            <li className="list-group-item">Tutorials: {data.total_tutorials || 0}</li>
            <li className="list-group-item">Reviews: {data.total_reviews || 0}</li>
            <li className="list-group-item">Invitations: {data.total_invitations || 0}</li>
            <li className="list-group-item">Roles: {data.total_roles || 0}</li>
            <li className="list-group-item">User-Papers: {data.total_user_papers || 0}</li>
            <li className="list-group-item">User-Projects: {data.total_user_projects || 0}</li>
            <li className="list-group-item">Paper-Projects: {data.total_paper_projects || 0}</li>
          </ul>

          <div className="text-center mt-4">
            <button className="btn btn-link" onClick={() => navigate('/')}>
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
