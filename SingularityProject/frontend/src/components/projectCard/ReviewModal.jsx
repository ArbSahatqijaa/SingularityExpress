// src/components/projectCard/ReviewModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import { Star, Loader2 } from 'lucide-react';

export default function ReviewModal({ projectId, onClose, onSuccess }) {
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
        const response = await API.get(`/reviews/?project_reviewed=${projectId}`);
        setReviews(response.data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setFetchingReviews(false);
      }
    };

    fetchReviews();
  }, [projectId]);

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
        project_reviewed: projectId,
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
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-50/80 backdrop-blur-sm z-50 p-6 sm:p-12 overflow-auto flex justify-center items-start sm:items-center"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white shadow-xl rounded-2xl max-w-2xl w-full p-8 space-y-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold text-gray-800"
            >
              Submit a Review
            </motion.h2>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 text-sm transition-colors duration-200"
            >
              ✕ Close
            </motion.button>
          </div>

          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit} 
            className="space-y-5"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1.0 - 5.0)</label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
              <motion.textarea
                whileFocus={{ scale: 1.02 }}
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                placeholder="Share your thoughts about the project..."
                maxLength={255}
              />
            </motion.div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm"
              >
                {error}
              </motion.p>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-end gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onClose}
                disabled={loading}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors duration-200"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Submitting…' : 'Submit Review'}
              </motion.button>
            </motion.div>
          </motion.form>

          {/* Reviews Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Project Reviews</h3>
            {fetchingReviews ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-600"
              >
                Loading reviews…
              </motion.p>
            ) : reviews.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-600"
              >
                No reviews yet for this project.
              </motion.p>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.review_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="border border-gray-200 bg-gray-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 text-yellow-500 font-semibold"
                    >
                      <Star className="w-4 h-4" />
                      <span>{review.rating.toFixed(1)} / 5</span>
                    </motion.div>
                    {review.comment && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-700 mt-2"
                      >
                        {review.comment}
                      </motion.p>
                    )}
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-xs text-gray-500 mt-2"
                    >
                      by {review.reviewer?.username || 'Anonymous'} on {new Date(review.created_at).toLocaleDateString()}
                    </motion.p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
