import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDiscussion } from '../context/DiscussionContext';
import { useNavigate } from 'react-router-dom';
import './DiscussionCard.css';

const DiscussionCard = ({ discussion }) => {
  const { user } = useAuth();
  const { handleDiscussionVote } = useDiscussion();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userVote, setUserVote] = useState(null);

  const handleVoteClick = async (type) => {
    if (!user) return;
    
    try {
      const response = await handleDiscussionVote(discussion.id, type);
      
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
      prev === discussion.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? discussion.images.length - 1 : prev - 1
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleOpenDiscussion = () => {
    navigate(`/discussion/${discussion.id}`);
  };

  return (
    <div className="discussion-card" onClick={handleOpenDiscussion}>
      <div className="discussion-card-content">
        {discussion.images && discussion.images.length > 0 && (
          <div className="discussion-images" onClick={(e) => e.stopPropagation()}>
            <div className="image-viewer">
              {discussion.images[currentImageIndex].endsWith('.mp4') ||
              discussion.images[currentImageIndex].endsWith('.mov') ||
              discussion.images[currentImageIndex].endsWith('.avi') ? (
                <video 
                  src={`http://localhost:5000${discussion.images[currentImageIndex]}`}
                  controls
                  className="discussion-media"
                />
              ) : (
                <img 
                  src={`http://localhost:5000${discussion.images[currentImageIndex]}`}
                  alt={discussion.title}
                  className="discussion-media"
                />
              )}
              
              {discussion.images.length > 1 && (
                <>
                  <button className="image-nav prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
                    ‹
                  </button>
                  <button className="image-nav next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
                    ›
                  </button>
                  <div className="image-indicator">
                    {currentImageIndex + 1} / {discussion.images.length}
                  </div>
                </>
              )}
            </div>

            {discussion.images.length > 1 && (
              <div className="image-thumbnails">
                {discussion.images.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
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

        <div className="discussion-details">
          <div className="discussion-header">
            <div>
              <h3 className="discussion-title">{discussion.title}</h3>
              <div className="discussion-meta">
                <span className="discussion-author">by {discussion.user?.name || discussion.user?.email}</span>
                <span className="discussion-date">{formatDate(discussion.createdAt)}</span>
              </div>
            </div>
          </div>

          <p className="discussion-description">{discussion.description}</p>

          <div className="discussion-actions" onClick={(e) => e.stopPropagation()}>
            <div className="vote-buttons">
              <button 
                className={`vote-btn upvote ${userVote === 'UPVOTE' ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); handleVoteClick('UPVOTE'); }}
                disabled={!user}
              >
                <span className="vote-icon">👍</span>
                <span className="vote-count">{discussion.upvotes || 0}</span>
              </button>
              <button 
                className={`vote-btn downvote ${userVote === 'DOWNVOTE' ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); handleVoteClick('DOWNVOTE'); }}
                disabled={!user}
              >
                <span className="vote-icon">👎</span>
                <span className="vote-count">{discussion.downvotes || 0}</span>
              </button>
            </div>

            <button className="comment-toggle">
              💬 {discussion.comments?.length || 0} Comments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionCard;
