import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  sendSignupOTP: (email) => api.post('/auth/signup/send-otp', { email }),
  verifySignup: (email, otp, name, password) => api.post('/auth/signup/verify', { email, otp, name, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const problemsAPI = {
  getAll: () => api.get('/problems'),
  getOne: (id) => api.get(`/problems/${id}`),
  create: (formData) => api.post('/problems', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateStatus: (id, status) => api.patch(`/problems/${id}/status`, { status }),
};

export const commentsAPI = {
  getByProblem: (problemId) => api.get(`/comments/problem/${problemId}`),
  create: (problemId, text) => api.post('/comments', { problemId, text }),
};

export const votesAPI = {
  vote: (problemId, type) => api.post('/votes', { problemId, type }),
  getUserVote: (problemId) => api.get(`/votes/problem/${problemId}/user`),
};

export default api;
