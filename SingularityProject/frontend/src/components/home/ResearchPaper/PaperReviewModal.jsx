import React, { useState, useEffect } from 'react';
import API from '../../../services/api';
import { Star, Loader2 } from 'lucide-react';

export default function PaperReviewModal({ paperId, onClose, onSuccess }) {
  const [rating, setRating] = useState(1.0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [fetchingReviews, setFetchingReviews] = useState(false);

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
      setReviews(prev => [response.data, ...prev]);
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
    <div className="fixed inset-0 bg-gray-50 z-50 p-6 sm:p-12 overflow-auto flex justify-center items-start sm:items-center">
      <div className="bg-white shadow-xl rounded-2xl max-w-2xl w-full p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Submit a Review</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">✕ Close</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1.0 - 5.0)</label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(parseFloat(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share your thoughts about the paper..."
              maxLength={255}
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </form>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Paper Reviews</h3>
          {fetchingReviews ? (
            <p>Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet for this paper.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div
                  key={review.review_id}
                  className="border border-gray-200 bg-gray-50 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-2 text-yellow-500 font-semibold">
                    <Star className="w-4 h-4" />
                    <span>{review.rating.toFixed(1)} / 5</span>
                  </div>
                  {review.comment && <p className="text-gray-700 mt-2">{review.comment}</p>}
                  <p className="text-xs text-gray-500 mt-2">
                    by {review.reviewer?.username || 'Anonymous'} on {new Date(review.created_at).toLocaleDateString()}
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
