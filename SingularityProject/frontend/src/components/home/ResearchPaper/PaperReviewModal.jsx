import React, { useState, useEffect } from 'react';
import API from '../../../services/api';

export default function PaperReviewModal({ paperId, onClose, onSuccess }) {
  const [rating, setRating] = useState(1.0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [fetchingReviews, setFetchingReviews] = useState(false);

  // Fetch all reviews for the current paper
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setFetchingReviews(true);
        const response = await API.get(`/reviews/?paper_reviewed=${paperId}`);
        setReviews(response.data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setFetchingReviews(false);
      }
    };

    fetchReviews();
  }, [paperId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      setError("Rating must be between 1 and 5.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await API.post('/reviews/', {
        rating,
        comment,
        paper_reviewed: paperId,
      });

      onSuccess?.(response.data);
      setReviews(prev => [response.data, ...prev]); // Add new review to top
      setRating(1.0);
      setComment('');
    } catch (err) {
      console.error(err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 p-6 sm:p-12 overflow-auto">
      <button onClick={onClose} className="text-gray-500 mb-4">← Back</button>
      <div className="modal">
        <h2 className="text-2xl font-bold mb-6">Submit a Review</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <label>
            Rating (1.0 - 5.0):
            <input
              className="w-full border p-2 rounded"
              type="number"
              step="0.1"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(parseFloat(e.target.value))}
              required
            />
          </label>
          <label>
            Comment (optional):
            <textarea
              className="w-full border p-2 rounded"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={255}
              placeholder="Your feedback here..."
            />
          </label>
          {error && <p className="text-red-600">{error}</p>}
          <div className="space-y-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>

        {/* Display Reviews */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">All Reviews</h3>
          {fetchingReviews ? (
            <p>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet for this paper.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.review_id}
                  className="border p-4 rounded shadow-sm bg-gray-50"
                >
                  <p className="font-medium">Rating: {review.rating.toFixed(1)} / 5</p>
                  {review.comment && <p className="text-gray-700 mt-1">{review.comment}</p>}
                  <p className="text-sm text-gray-500 mt-1">
                    by {review.reviewer?.username || 'Anonymous'} on{' '}
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
