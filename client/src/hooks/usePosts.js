import { useState, useEffect } from 'react';
import api, { getPosts, createPost } from '../utils/api';


export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for demo
  const mockPosts = [
    {
      id: 1,
      title: 'Building Modern Web Applications with React and TypeScript',
      content: 'Discover the best practices for creating scalable and maintainable web applications using React 18 and TypeScript. Learn about hooks, context, and performance optimization techniques.',
      excerpt: 'Discover the best practices for creating scalable and maintainable web applications using React 18 and TypeScript...',
      coverImage: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      author: {
        id: 1,
        name: 'Sarah Chen',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        username: 'sarahdev'
      },
      tags: ['React', 'TypeScript', 'JavaScript', 'Web Development'],
      likes: 245,
      liked: false,
      createdAt: new Date('2024-01-15'),
      readTime: 8
    },
    {
      id: 2,
      title: 'The Future of JavaScript: ES2024 Features You Should Know',
      content: 'JavaScript continues to evolve with exciting new features in ES2024. Explore the latest additions to the language and how they can improve your development workflow.',
      excerpt: 'JavaScript continues to evolve with exciting new features in ES2024. Explore the latest additions to the language...',
      coverImage: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      author: {
        id: 2,
        name: 'Alex Rivera',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        username: 'alexcodes'
      },
      tags: ['JavaScript', 'ES2024', 'Programming'],
      likes: 189,
      liked: true,
      createdAt: new Date('2024-01-12'),
      readTime: 6
    },
    {
      id: 3,
      title: 'Mastering CSS Grid: Advanced Layout Techniques',
      content: 'CSS Grid is a powerful tool for creating complex web layouts. Learn advanced techniques and best practices for responsive design.',
      excerpt: 'CSS Grid is a powerful tool for creating complex web layouts. Learn advanced techniques and best practices...',
      coverImage: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      author: {
        id: 3,
        name: 'Jamie Liu',
        avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        username: 'jamiedesign'
      },
      tags: ['CSS', 'Grid', 'Web Design', 'Frontend'],
      likes: 156,
      liked: false,
      createdAt: new Date('2024-01-10'),
      readTime: 5
    }
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPosts(mockPosts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const toggleLike = (postId) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    );
  };

  const deletePost = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  const addPost = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  return {
    posts,
    loading,
    error,
    toggleLike,
    deletePost,
    addPost
  };
};