import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProblem } from '../context/ProblemContext';
import './CommentSection.css';

const CommentSection = ({ problem, onClose }) => {
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { addComment } = useProblem();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await addComment(problem.id, newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="comment-overlay" onClick={onClose}>
      <div className="comment-section" onClick={(e) => e.stopPropagation()}>
        <div className="comment-header">
          <h3>Comments</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="comments-list">
          {problem.comments && problem.comments.length > 0 ? (
            problem.comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-avatar">
                  {comment.user?.isAdmin ? '👨‍💼' : '👤'}
                </div>
                <div className="comment-content">
                  <div className="comment-user-info">
                    <span className="comment-user-name">
                      {comment.user?.name || comment.user?.email}
                    </span>
                    {comment.user?.isAdmin && (
                      <span className="admin-badge">Admin</span>
                    )}
                    <span className="comment-date">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-comments">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>

        {user ? (
          <form onSubmit={handleSubmit} className="comment-form">
            <div className="comment-input-wrapper">
              <textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows="3"
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-submit"
              disabled={loading || !newComment.trim()}
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <div className="login-prompt">
            <p>Please login to comment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
