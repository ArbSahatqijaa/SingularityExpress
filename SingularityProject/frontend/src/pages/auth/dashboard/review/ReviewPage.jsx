import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../services/api';
import DashboardLayout from '../DashboardLayout';

export default function ReviewPage() {
  const [reviews, setReviews] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await API.get('/reviews/');
        setReviews(data);
      } catch (err) {
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const canManage = target => me?.is_superuser || (!target.is_staff && !target.is_superuser);

  const handleDelete = async reviewId => {
    if (!canManage(reviews.find(r => r.review_id === reviewId))) {
      return alert("You don't have permission to delete this review");
    }
    if (!window.confirm('Delete this review?')) return;
    await API.delete(`/reviews/${reviewId}/`);
    setReviews(reviews.filter(r => r.review_id !== reviewId));
  };

  const handleEdit = reviewId => {
    if (!canManage(reviews.find(r => r.review_id === reviewId))) {
      return alert("You don't have permission to edit this review");
    }
    navigate(`/dashboard/reviews/edit/${reviewId}`);
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Loading reviews...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;

  return (
    <DashboardLayout>
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Review Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage paper and project reviews</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/reviews/new')}
              className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-md"
            >
              + New Review
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">ID</th>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">Reviewer</th>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">Paper</th>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">Project</th>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">Rating</th>
                    <th className="px-6 py-4 font-medium tracking-wide text-gray-600">Comment</th>
                    <th className="px-6 py-4 text-center font-medium tracking-wide text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reviews.map(r => (
                    <tr key={r.review_id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-900">{r.review_id}</td>
                      <td className="px-6 py-4">{r.reviewer?.username}</td>
                      <td className="px-6 py-4">{r.paper_reviewed}</td>
                      <td className="px-6 py-4">{r.project_reviewed}</td>
                      <td className="px-6 py-4">{r.rating}</td>
                      <td className="px-6 py-4">{r.comment}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleEdit(r.review_id)}
                            className="px-3 py-1.5 text-xs bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-md shadow-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(r.review_id)}
                            className="px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md shadow-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
