import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/posts');
      setPosts(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError(err.response?.data?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const addPost = useCallback((newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  }, []);

  const updatePost = useCallback((updatedPost) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  }, []);

  const deletePost = useCallback(async (postId) => {
    try {
      await api.delete(`/api/posts/${postId}`);
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      return true;
    } catch (err) {
      console.error('Failed to delete post:', err);
      return false;
    }
  }, []);

  const likePost = useCallback(async (postId) => {
    try {
      await api.put(`/api/posts/${postId}/like`);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? {
                ...post,
                likes: [...(post.likes || []), user?._id],
                likesCount: (post.likesCount || 0) + 1
              }
            : post
        )
      );
    } catch (err) {
      console.error('Failed to like post:', err);
      throw err;
    }
  }, [user?._id]);

  const unlikePost = useCallback(async (postId) => {
    try {
      await api.put(`/api/posts/${postId}/unlike`);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? {
                ...post,
                likes: (post.likes || []).filter(id => id !== user?._id),
                likesCount: Math.max((post.likesCount || 0) - 1, 0)
              }
            : post
        )
      );
    } catch (err) {
      console.error('Failed to unlike post:', err);
      throw err;
    }
  }, [user?._id]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    addPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    refetch: fetchPosts
  };
};

export default usePosts;
