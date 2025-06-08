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

        const responses = await Promise.all([
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
          total_users: responses[0].data.length,
          total_friendships: responses[1].data.length,
          total_projects: responses[2].data.length,
          total_papers: responses[3].data.length,
          total_tutorials: responses[4].data.length,
          total_reviews: responses[5].data.length,
          total_invitations: responses[6].data.length,
          total_user_papers: responses[7].data.length,
          total_user_projects: responses[8].data.length,
          total_paper_projects: responses[9].data.length,
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
      'Reviews', 'Invitations', 'User-Papers', 'User-Projects',
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
        borderRadius: 8,
        barThickness: 20,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Platform Insights Overview',
        color: '#111827',
        font: { size: 20, weight: 'bold' },
      },
    },
    scales: {
      y: {
        ticks: { beginAtZero: true, color: '#4B5563' },
        grid: { color: '#E5E7EB' },
      },
      x: {
        ticks: { color: '#4B5563' },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="text-xl font-bold text-indigo-700 tracking-tight">Admin Dashboard</span>
          <span className="text-sm text-gray-500 hidden sm:inline">Singularity Express</span>
          <button
            onClick={() => navigate('/home')}
            className="text-sm text-indigo-600 hover:underline"
          >
            Return to Home
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <section className="mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
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
                onClick={() => navigate(path)}
                className="bg-white border border-gray-200 hover:border-indigo-500 rounded-xl py-3 px-4 text-sm font-medium text-center text-gray-800 shadow-md hover:shadow-lg transition"
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Overview Chart</h2>
          <div className="overflow-x-auto">
            <Bar data={chartData} options={chartOptions} />
          </div>

          <h3 className="text-lg font-medium text-gray-700 mt-10 mb-4">Summary Statistics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Object.entries(data).map(([key, value]) => (
              <div
                key={key}
                className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl text-center shadow-sm hover:shadow-md transition"
              >
                <p className="text-sm text-indigo-900 font-medium capitalize">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="mt-2 text-2xl font-extrabold text-indigo-700">{value}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
