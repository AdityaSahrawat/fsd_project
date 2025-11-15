import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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
      const response = await axios.get(`${API_URL}/problems`);
      setProblems(response.data);
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProblem = async (formData) => {
    const response = await axios.post(`${API_URL}/problems`, formData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setProblems([response.data, ...problems]);
    return response.data;
  };

  const updateProblemStatus = async (problemId, status, formData = null) => {
    let response;
    if (formData) {
      response = await axios.patch(`${API_URL}/problems/${problemId}/complete`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      response = await axios.patch(`${API_URL}/problems/${problemId}/status`, { status }, {
        withCredentials: true,
      });
    }
    
    setProblems(problems.map(p => {
      if (p.id === problemId) {
        return {
          ...response.data,
          comments: p.comments,
          upvotes: p.upvotes,
          downvotes: p.downvotes,
        };
      }
      return p;
    }));
    return response.data;
  };

  const addComment = async (problemId, text) => {
    const response = await axios.post(`${API_URL}/comments`, { problemId, text }, {
      withCredentials: true,
    });
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
    const response = await axios.post(`${API_URL}/votes`, { problemId, type }, {
      withCredentials: true,
    });
    
    setProblems(problems.map(p => {
      if (p.id === problemId) {
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

  const updateProblemInList = useCallback((updatedProblem) => {
    setProblems(problems.map(p => p.id === updatedProblem.id ? updatedProblem : p));
  }, [problems]);

  const value = {
    problems,
    loading,
    fetchProblems,
    createProblem,
    updateProblemStatus,
    updateProblemInList,
    addComment,
    handleVote,
  };

  return <ProblemContext.Provider value={value}>{children}</ProblemContext.Provider>;
};
