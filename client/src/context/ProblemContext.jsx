import { createContext, useContext, useState, useCallback } from 'react';
import { problemsAPI, commentsAPI, votesAPI } from '../api/api';

const ProblemContext = createContext();

export const useProblem = () => {
  const context = useContext(ProblemContext);
  if (!context) {
    throw new Error('useProblem must be used within ProblemProvider');
  }
  return context;
};

export const ProblemProvider = ({ children }) => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await problemsAPI.getAll();
      setProblems(response.data);
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProblem = async (formData) => {
    const response = await problemsAPI.create(formData);
    setProblems([response.data, ...problems]);
    return response.data;
  };

  const updateProblemStatus = async (problemId, status) => {
    const response = await problemsAPI.updateStatus(problemId, status);
    setProblems(problems.map(p => p.id === problemId ? response.data : p));
    return response.data;
  };

  const addComment = async (problemId, text) => {
    const response = await commentsAPI.create(problemId, text);
    // Update the problem with the new comment
    setProblems(problems.map(p => {
      if (p.id === problemId) {
        return {
          ...p,
          comments: [response.data, ...(p.comments || [])],
        };
      }
      return p;
    }));
    return response.data;
  };

  const handleVote = async (problemId, type) => {
    const response = await votesAPI.vote(problemId, type);
    
    // Update the specific problem locally instead of fetching all
    setProblems(problems.map(p => {
      if (p.id === problemId) {
        // Calculate new vote counts based on action
        let newUpvotes = p.upvotes || 0;
        let newDownvotes = p.downvotes || 0;
        
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
          ...p,
          upvotes: Math.max(0, newUpvotes),
          downvotes: Math.max(0, newDownvotes),
        };
      }
      return p;
    }));
    
    return response.data;
  };

  const value = {
    problems,
    loading,
    fetchProblems,
    createProblem,
    updateProblemStatus,
    addComment,
    handleVote,
  };

  return <ProblemContext.Provider value={value}>{children}</ProblemContext.Provider>;
};
