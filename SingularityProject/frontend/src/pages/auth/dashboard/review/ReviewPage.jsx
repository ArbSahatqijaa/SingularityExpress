import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../services/api';

export default function ReviewPage() {
  const [Review, setReview]     = useState([]);
  const [me, setMe]           = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const navigate              = useNavigate();


  useEffect(() => {
    API.get('/whoami/')
      .then(({ data }) => setMe(data))
      .catch(() => setMe(null));
  }, []);

  // fetch all Review
  useEffect(() => {
    const fetchReview = async () => {
      try {
        const { data } = await API.get('/reviews/');
        setReview(data);
        console.log(data);
      } catch (err) {
        setError('Failed to load Review');
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, []);


  const canManage = target =>
    me?.is_superuser || (!target.is_staff && !target.is_superuser);

  const handleDelete = async ReviewID => {
    if (!canManage(Review.find(u => u.review_id === ReviewID))) {
      return alert("You don't have permission to delete this Review");
    }
    if (!window.confirm('Delete this Review?')) return;
    await API.delete(`/reviews/${ReviewID}/`);
    setReview(Review.filter(u => u.review_id !== ReviewID));
  };

  const handleEdit = ReviewID => {
    if (!canManage(Review.find(u => u.review_id === ReviewID))) {
      return alert("You don't have permission to edit this Review");
    }
    navigate(`/dashboard/reviews/edit/${ReviewID}`);
  };

  if (loading) return <div>Loading Review...</div>;
  if (error)   return <div className="text-danger">{error}</div>;

  return (
    <div className="container py-4">
  <h1 className="mb-4 text-primary">Manage Review</h1>

  <div className="d-flex justify-content-between align-items-center mb-3">
    <button
      className="btn btn-success"
      onClick={() => navigate('/dashboard/reviews/new')}
    >
     Create New Review
    </button>
  </div>

  {Review.length > 0 ? (
    <div className="table-responsive">
      <table className="table table-hover table-bordered align-middle shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Reviewer</th>
            <th>Paper Reviewed</th>
            <th>Project Reviewed</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Review.map(u => (
            <tr key={u.review_id}>
              <td>{u.review_id}</td>
              <td>{u.reviewer.username}</td>
              <td>{u.paper_reviewed}</td>
              <td>{u.project_reviewed}</td>
              <td>{u.rating}</td>
              <td>{u.comment}</td>
              <td>
                  <>
                    <button
                      className="btn btn-sm btn-outline-warning me-1"
                      onClick={() => handleEdit(u.review_id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(u.review_id)}
                    >
                      Delete
                    </button>
                  </>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="text-muted">No Review available</p>
  )}
</div>
  );
}