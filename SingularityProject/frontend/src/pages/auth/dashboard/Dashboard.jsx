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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [data, setData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
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
        ] = await Promise.all([
          API.get('/users/'),
          API.get('/friendships/'),
          API.get('/projects/'),
          API.get('/papers/'),
          API.get('/tutorials/'),
          API.get('/reviews/'),
          API.get('/invitations/'),
          API.get('/required_roles/'),
        ]);

        setData({
          total_users: usersRes.data.length,
          total_friendships: friendshipsRes.data.length,
          total_projects: projectsRes.data.length,
          total_papers: papersRes.data.length,
          total_tutorials: tutorialsRes.data.length,
          total_reviews: reviewsRes.data.length,
          total_invitations: invitationsRes.data.length,
          total_roles: rolesRes.data.length,
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        navigate('/');
      }
    };

    fetchData();
  }, [navigate]);

  const chartData = {
    labels: [
      'Users',
      'Friendships',
      'Projects',
      'Papers',
      'Tutorials',
      'Reviews',
      'Invitations',
      'Roles',
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
        ],
        backgroundColor: Array(8).fill('#007bff'),
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

      <div className="d-flex justify-content-center flex-wrap gap-2 mb-5">
        <button className="btn btn-outline-primary" onClick={() => navigate('/users')}>
          Users
        </button>
        <button className="btn btn-outline-primary" onClick={() => navigate('/friendships')}>
          Friendships
        </button>
        <button className="btn btn-outline-primary" onClick={() => navigate('/projects')}>
          Projects
        </button>
        <button className="btn btn-outline-primary" onClick={() => navigate('/papers')}>
          Papers
        </button>
        <button className="btn btn-outline-primary" onClick={() => navigate('/tutorials')}>
          Tutorials
        </button>
        <button className="btn btn-outline-primary" onClick={() => navigate('/reviews')}>
          Reviews
        </button>
        <button className="btn btn-outline-primary" onClick={() => navigate('/invitations')}>
          Invitations
        </button>
        <button className="btn btn-outline-primary" onClick={() => navigate('/required_roles')}>
          Roles
        </button>
      </div>

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
};

export default Dashboard;
