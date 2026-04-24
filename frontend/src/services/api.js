import axios from 'axios';

// const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: 'https://students-connect-9ywv.onrender.com/api'

});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const userAPI = {
  search: (query) => api.get(`/users/search?query=${query}`),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  getAll: () => api.get('/users'),
};

export const clubAPI = {
  getAll: () => api.get('/clubs'),
  getById: (id) => api.get(`/clubs/${id}`),
  addHiring: (id, data) => api.post(`/clubs/${id}/hirings`, data),
  updateHiring: (clubId, hiringId, data) => api.put(`/clubs/${clubId}/hirings/${hiringId}`, data),
};

export const messageAPI = {
  getConversation: (userId1, userId2) => api.get(`/messages/${userId1}/${userId2}`),
  getConversations: (userId) => api.get(`/messages/conversations/${userId}`),
  markAsRead: (userId1, userId2) => api.put(`/messages/read/${userId1}/${userId2}`),
};

export const applicationAPI = {
  submit: (data) => api.post('/applications', data),
  getByClub: (clubId) => api.get(`/applications/club/${clubId}`),
  getByStudent: (studentId) => api.get(`/applications/student/${studentId}`),
  updateStatus: (id, status) => api.put(`/applications/${id}`, { status }),
};

export default api;
