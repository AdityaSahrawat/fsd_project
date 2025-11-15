import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const DiscussionContext = createContext();

export const useDiscussion = () => {
  const context = useContext(DiscussionContext);
  if (!context) {
    throw new Error('useDiscussion must be used within DiscussionProvider');
  }
  return context;
};

export const DiscussionProvider = ({ children }) => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDiscussions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/discussions`);
      setDiscussions(response.data);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDiscussion = async (formData) => {
    const response = await axios.post(`${API_URL}/discussions`, formData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setDiscussions([response.data, ...discussions]);
    return response.data;
  };

  const addDiscussionComment = async (discussionId, text) => {
    const response = await axios.post(
      `${API_URL}/discussions/${discussionId}/comments`,
      { text },
      { withCredentials: true }
    );
    
    // Update the discussion with the new comment
    setDiscussions(discussions.map(d => {
      if (d.id === discussionId) {
        return {
          ...d,
          comments: [response.data, ...(d.comments || [])],
        };
      }
      return d;
    }));
    return response.data;
  };

  const handleDiscussionVote = async (discussionId, type) => {
    const response = await axios.post(
      `${API_URL}/discussions/${discussionId}/vote`,
      { type },
      { withCredentials: true }
    );
    
    // Update the specific discussion locally
    setDiscussions(discussions.map(d => {
      if (d.id === discussionId) {
        let newUpvotes = d.upvotes || 0;
        let newDownvotes = d.downvotes || 0;
        
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
        
        return {
          ...d,
          upvotes: Math.max(0, newUpvotes),
          downvotes: Math.max(0, newDownvotes),
        };
      }
      return d;
    }));
    
    return response.data;
  };

  const value = {
    discussions,
    loading,
    fetchDiscussions,
    createDiscussion,
    addDiscussionComment,
    handleDiscussionVote,
  };

  return <DiscussionContext.Provider value={value}>{children}</DiscussionContext.Provider>;
};
