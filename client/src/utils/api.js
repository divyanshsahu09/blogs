import axios from 'axios';
import Cookies from 'js-cookie';

// Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    console.error('API error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: errorMessage,
      response: error.response?.data,
    });
    return Promise.reject(new Error(errorMessage));
  }
);

// Export default axios instance
export default api;

// Auth endpoints
export const registerUser = async (userData) => {
  const response = await api.post('/api/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/api/auth/login', credentials);
  const { token } = response.data;
  if (token) {
    Cookies.set('accessToken', token, { sameSite: 'lax' });
    window.dispatchEvent(new Event('authChange'));
  }
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post('/api/auth/logout');
  Cookies.remove('accessToken');
  return response.data;
};

// Posts endpoints
export const createPost = async (postData) => {
  const response = await api.post('/api/posts', postData);
  return response.data;
};

export const updatePost = async (postId, postData) => {
  const response = await api.put(`/api/posts/${postId}`, postData);
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await api.delete(`/api/posts/${postId}`);
  return response.data;
};

export const getPost = async (postId) => {
  const response = await api.get(`/api/posts/single/${postId}`);
  return response.data;
};

export const getPosts = async () => {
  const response = await api.get('/api/posts');
  return response.data;
};

export const getUserPosts = async () => {
  const response = await api.get('/api/posts/user');
  return response.data;
};
