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
          API.get('/user_papers/'),
          API.get('/user_projects/'),
          API.get('/paper_projects/'),
        ]);

        setData({
          total_users: usersRes.data.length,
          total_friendships: friendshipsRes.data.length,
          total_projects: projectsRes.data.length,
          total_papers: papersRes.data.length,
          total_tutorials: tutorialsRes.data.length,
          total_reviews: reviewsRes.data.length,
          total_invitations: invitationsRes.data.length,
          total_user_papers: userPapersRes.data.length,
          total_user_projects: userProjectsRes.data.length,
          total_paper_projects: paperProjectsRes.data.length,
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
      'Reviews', 'Invitations','User-Papers', 'User-Projects',
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
          data.total_user_papers || 0,
          data.total_user_projects || 0,
          data.total_paper_projects || 0,
        ],
        backgroundColor: '#6366f1',
        borderRadius: 6,
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
        color: '#1f2937',
        font: { size: 18 },
      },
    },
    scales: {
      y: {
        ticks: {
          beginAtZero: true,
          color: '#6b7280',
        },
        grid: {
          color: '#e5e7eb',
        },
      },
      x: {
        ticks: {
          color: '#6b7280',
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">
        Admin Dashboard
      </h1>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {[
          { label: 'Users', path: '/dashboard/users' },
          { label: 'Friendships', path: '/dashboard/friendships' },
          { label: 'Projects', path: '/dashboard/projects' },
          { label: 'Papers', path: '/dashboard/papers' },
          { label: 'Tutorials', path: '/dashboard/tutorials' },
          { label: 'Reviews', path: '/dashboard/reviews' },
          { label: 'Invitations', path: '/dashboard/invitations' },
          { label: 'User-Papers', path: '/dashboard/user_papers' },
          { label: 'User-Projects', path: '/dashboard/user_projects' },
          { label: 'Paper-Projects', path: '/dashboard/paper_projects' },
        ].map(({ label, path }) => (
          <button
            key={label}
            className="bg-white px-4 py-2 rounded shadow hover:bg-indigo-100 text-indigo-700 font-medium"
            onClick={() => navigate(path)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Overview Chart</h2>
        <Bar data={chartData} options={chartOptions} />

        <h3 className="text-lg font-semibold text-gray-600 mt-6 mb-2">Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="bg-gray-50 p-4 rounded shadow">
              <p className="text-sm text-gray-500">{key.replace(/_/g, ' ')}</p>
              <p className="text-xl font-bold text-indigo-600">{value}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <button
            className="text-indigo-600 hover:underline"
            onClick={() => navigate('/home')}
          >
            Return to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}
