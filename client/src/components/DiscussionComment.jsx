import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './DiscussionComment.css';

const API_URL = 'http://localhost:5000/api';

const YouTubeComment = ({ comment, discussionId, onReplyAdded }) => {
  const { user } = useAuth();
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [showReplies, setShowReplies] = useState(true);

  const upvotes = comment.votes?.filter(v => v.type === 'UPVOTE').length || 0;
  const downvotes = comment.votes?.filter(v => v.type === 'DOWNVOTE').length || 0;
  const netVotes = upvotes - downvotes;

  const formatDate = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  const handleVote = async (type) => {
    if (!user) return;

    try {
      const response = await axios.post(
        `${API_URL}/discussions/comments/${comment.id}/vote`,
        { type },
        { withCredentials: true }
      );

      if (response.data.action === 'removed') {
        setUserVote(null);
      } else {
        setUserVote(type);
      }

      // Trigger re-fetch of discussion data
      if (onReplyAdded) onReplyAdded();
    } catch (error) {
      console.error('Error voting on comment:', error);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !user) return;

    setSubmitting(true);
    try {
      await axios.post(
        `${API_URL}/discussions/${discussionId}/comments`,
        { text: replyText, parentCommentId: comment.id },
        { withCredentials: true }
      );

      setReplyText('');
      setShowReplyBox(false);
      if (onReplyAdded) onReplyAdded();
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="yt-comment">
      <div className="yt-comment-avatar">
        {comment.user?.isAdmin ? '👨‍💼' : '👤'}
      </div>
      <div className="yt-comment-content">
        <div className="yt-comment-header">
          <span className="yt-comment-author">{comment.user?.name}</span>
          {comment.user?.isAdmin && <span className="yt-admin-badge">Admin</span>}
          <span className="yt-comment-email">@{comment.user?.email}</span>
          <span className="yt-comment-date">{formatDate(comment.createdAt)}</span>
        </div>
        
        <p className="yt-comment-text">{comment.text}</p>
        
        <div className="yt-comment-actions">
          <button
            className={`yt-vote-btn ${userVote === 'UPVOTE' ? 'active' : ''}`}
            onClick={() => handleVote('UPVOTE')}
            disabled={!user}
          >
            👍
          </button>
          <span className="yt-vote-count">{netVotes > 0 ? netVotes : ''}</span>
          <button
            className={`yt-vote-btn ${userVote === 'DOWNVOTE' ? 'active' : ''}`}
            onClick={() => handleVote('DOWNVOTE')}
            disabled={!user}
          >
            👎
          </button>
          
          {user && (
            <button
              className="yt-reply-btn"
              onClick={() => setShowReplyBox(!showReplyBox)}
            >
              Reply
            </button>
          )}
        </div>

        {showReplyBox && (
          <form onSubmit={handleReplySubmit} className="yt-reply-form">
            <div className="yt-reply-input-wrapper">
              <div className="yt-comment-avatar-small">
                {user?.isAdmin ? '👨‍💼' : '👤'}
              </div>
              <input
                type="text"
                placeholder="Add a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                autoFocus
              />
            </div>
            <div className="yt-reply-actions">
              <button
                type="button"
                className="yt-cancel-btn"
                onClick={() => {
                  setShowReplyBox(false);
                  setReplyText('');
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="yt-submit-btn"
                disabled={submitting || !replyText.trim()}
              >
                {submitting ? 'Replying...' : 'Reply'}
              </button>
            </div>
          </form>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="yt-replies-section">
            <button
              className="yt-toggle-replies"
              onClick={() => setShowReplies(!showReplies)}
            >
              {showReplies ? '▼' : '▶'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </button>
            
            {showReplies && (
              <div className="yt-replies-list">
                {comment.replies.map((reply) => (
                  <YouTubeComment
                    key={reply.id}
                    comment={reply}
                    discussionId={discussionId}
                    onReplyAdded={onReplyAdded}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeComment;
