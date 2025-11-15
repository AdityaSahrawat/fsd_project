import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Header from '../components/Header';
import YouTubeComment from '../components/DiscussionComment';
import './DiscussionDetail.css';

const API_URL = 'http://localhost:5000/api';

const DiscussionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [discussion, setDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchDiscussion();
  }, [id]);

  const fetchDiscussion = async () => {
    try {
      const response = await axios.get(`${API_URL}/discussions/${id}`);
      setDiscussion(response.data);
    } catch (error) {
      console.error('Error fetching discussion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (type) => {
    if (!user) return;

    try {
      const response = await axios.post(
        `${API_URL}/discussions/${id}/vote`,
        { type },
        { withCredentials: true }
      );

      if (response.data.action === 'removed') {
        setUserVote(null);
      } else {
        setUserVote(type);
      }

      // Recalculate votes
      let newUpvotes = discussion.upvotes || 0;
      let newDownvotes = discussion.downvotes || 0;

      if (response.data.action === 'removed') {
        if (type === 'UPVOTE') newUpvotes--;
        else newDownvotes--;
      } else if (response.data.action === 'updated') {
        if (type === 'UPVOTE') {
          newUpvotes++;
          newDownvotes--;
        } else {
          newDownvotes++;
          newUpvotes--;
        }
      } else if (response.data.action === 'created') {
        if (type === 'UPVOTE') newUpvotes++;
        else newDownvotes++;
      }

      setDiscussion({
        ...discussion,
        upvotes: Math.max(0, newUpvotes),
        downvotes: Math.max(0, newDownvotes),
      });
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      await axios.post(
        `${API_URL}/discussions/${id}/comments`,
        { text: newComment },
        { withCredentials: true }
      );

      setNewComment('');
      fetchDiscussion(); // Refresh to get new comment with all nested data
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === discussion.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? discussion.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="discussion-detail-container">
          <div className="loading">Loading...</div>
        </div>
      </>
    );
  }

  if (!discussion) {
    return (
      <>
        <Header />
        <div className="discussion-detail-container">
          <div className="error">Discussion not found</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="discussion-detail-container">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>

        <div className="discussion-detail-card">
          <div className="discussion-detail-header">
            <h1 className="discussion-detail-title">{discussion.title}</h1>
            <div className="discussion-detail-meta">
              <span>by {discussion.user?.name || discussion.user?.email}</span>
              <span>•</span>
              <span>{formatDate(discussion.createdAt)}</span>
            </div>
          </div>

          {discussion.images && discussion.images.length > 0 && (
            <div className="discussion-detail-images">
              <div className="image-viewer-large">
                {discussion.images[currentImageIndex].endsWith('.mp4') ||
                discussion.images[currentImageIndex].endsWith('.mov') ||
                discussion.images[currentImageIndex].endsWith('.avi') ? (
                  <video
                    src={`http://localhost:5000${discussion.images[currentImageIndex]}`}
                    controls
                    className="discussion-detail-media"
                  />
                ) : (
                  <img
                    src={`http://localhost:5000${discussion.images[currentImageIndex]}`}
                    alt={discussion.title}
                    className="discussion-detail-media"
                  />
                )}

                {discussion.images.length > 1 && (
                  <>
                    <button className="image-nav prev" onClick={prevImage}>
                      ‹
                    </button>
                    <button className="image-nav next" onClick={nextImage}>
                      ›
                    </button>
                    <div className="image-indicator">
                      {currentImageIndex + 1} / {discussion.images.length}
                    </div>
                  </>
                )}
              </div>

              {discussion.images.length > 1 && (
                <div className="image-thumbnails-large">
                  {discussion.images.map((img, index) => (
                    <div
                      key={index}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      {img.endsWith('.mp4') || img.endsWith('.mov') || img.endsWith('.avi') ? (
                        <div className="video-thumbnail">🎥</div>
                      ) : (
                        <img src={`http://localhost:5000${img}`} alt="" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <p className="discussion-detail-description">{discussion.description}</p>

          <div className="discussion-detail-actions">
            <div className="vote-buttons">
              <button
                className={`vote-btn upvote ${userVote === 'UPVOTE' ? 'active' : ''}`}
                onClick={() => handleVote('UPVOTE')}
                disabled={!user}
              >
                <span className="vote-icon">👍</span>
                <span className="vote-count">{discussion.upvotes || 0}</span>
              </button>
              <button
                className={`vote-btn downvote ${userVote === 'DOWNVOTE' ? 'active' : ''}`}
                onClick={() => handleVote('DOWNVOTE')}
                disabled={!user}
              >
                <span className="vote-icon">👎</span>
                <span className="vote-count">{discussion.downvotes || 0}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="comments-section">
          <h2 className="comments-title">
            💬 {discussion.comments?.length || 0} Comments
          </h2>

          {user && (
            <form onSubmit={handleAddComment} className="yt-add-comment-form">
              <div className="yt-comment-input-wrapper">
                <div className="yt-comment-avatar">
                  {user?.isAdmin ? '👨‍💼' : '👤'}
                </div>
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  required
                />
              </div>
              <div className="yt-comment-submit-actions">
                <button
                  type="button"
                  className="yt-cancel-btn"
                  onClick={() => setNewComment('')}
                  disabled={!newComment.trim()}
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting || !newComment.trim()} className="yt-submit-btn">
                  {submitting ? 'Posting...' : 'Comment'}
                </button>
              </div>
            </form>
          )}

          <div className="comments-list">
            {discussion.comments && discussion.comments.length > 0 ? (
              discussion.comments.map((comment) => (
                <YouTubeComment
                  key={comment.id}
                  comment={comment}
                  discussionId={id}
                  onReplyAdded={fetchDiscussion}
                />
              ))
            ) : (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DiscussionDetail;
