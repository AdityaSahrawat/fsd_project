import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProblem } from '../context/ProblemContext';
import CommentSection from './CommentSection';
import './ProblemCard.css';

const ProblemCard = ({ problem }) => {
  const { user, isAdmin } = useAuth();
  const { updateProblemStatus, handleVote } = useProblem();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [userVote, setUserVote] = useState(null);

  const statusColors = {
    PENDING: '#f59e0b',
    IN_PROGRESS: '#3b82f6',
    COMPLETED: '#10b981',
  };

  const statusLabels = {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateProblemStatus(problem.id, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleVoteClick = async (type) => {
    if (!user) return;
    
    try {
      const response = await handleVote(problem.id, type);
      
      // Update local vote state based on server response
      if (response.action === 'removed') {
        setUserVote(null);
      } else {
        setUserVote(type);
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === problem.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? problem.images.length - 1 : prev - 1
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className="problem-card">
        <div className="problem-card-content">
          {problem.images && problem.images.length > 0 && (
            <div className="problem-images">
              <div className="image-viewer">
                {problem.images[currentImageIndex].endsWith('.mp4') ||
                problem.images[currentImageIndex].endsWith('.mov') ||
                problem.images[currentImageIndex].endsWith('.avi') ? (
                  <video 
                    src={`http://localhost:5000${problem.images[currentImageIndex]}`}
                    controls
                    className="problem-media"
                  />
                ) : (
                  <img 
                    src={`http://localhost:5000${problem.images[currentImageIndex]}`}
                    alt={problem.title}
                    className="problem-media"
                  />
                )}
                
                {problem.images.length > 1 && (
                  <>
                    <button className="image-nav prev" onClick={prevImage}>
                      ‹
                    </button>
                    <button className="image-nav next" onClick={nextImage}>
                      ›
                    </button>
                    <div className="image-indicator">
                      {currentImageIndex + 1} / {problem.images.length}
                    </div>
                  </>
                )}
              </div>

              {problem.images.length > 1 && (
                <div className="image-thumbnails">
                  {problem.images.map((img, index) => (
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

          <div className="problem-details">
            <div className="problem-header">
              <div>
                <h3 className="problem-title">{problem.title}</h3>
                <div className="problem-meta">
                  <span className="problem-author">by {problem.user?.name || problem.user?.email}</span>
                  <span className="problem-date">{formatDate(problem.createdAt)}</span>
                </div>
              </div>
              
              {isAdmin ? (
                <select
                  className="status-select"
                  value={problem.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{ borderColor: statusColors[problem.status] }}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              ) : (
                <span 
                  className="status-badge"
                  style={{ backgroundColor: statusColors[problem.status] }}
                >
                  {statusLabels[problem.status]}
                </span>
              )}
            </div>

            <p className="problem-description">{problem.description}</p>

            <div className="problem-actions">
              <div className="vote-buttons">
                <button 
                  className={`vote-btn upvote ${userVote === 'UPVOTE' ? 'active' : ''}`}
                  onClick={() => handleVoteClick('UPVOTE')}
                  disabled={!user}
                >
                  <span className="vote-icon">👍</span>
                  <span className="vote-count">{problem.upvotes || 0}</span>
                </button>
                <button 
                  className={`vote-btn downvote ${userVote === 'DOWNVOTE' ? 'active' : ''}`}
                  onClick={() => handleVoteClick('DOWNVOTE')}
                  disabled={!user}
                >
                  <span className="vote-icon">👎</span>
                  <span className="vote-count">{problem.downvotes || 0}</span>
                </button>
              </div>

              <button 
                className="comment-toggle"
                onClick={() => setShowComments(!showComments)}
              >
                💬 {problem.comments?.length || 0} Comments
              </button>
            </div>
          </div>
        </div>
      </div>

      {showComments && (
        <CommentSection 
          problem={problem}
          onClose={() => setShowComments(false)}
        />
      )}
    </>
  );
};

export default ProblemCard;
