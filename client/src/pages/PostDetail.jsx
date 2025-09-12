import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Clock, 
  ArrowLeft, 
  MoreHorizontal,
  Trash2,
  Edit
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../hooks/usePosts';
import { getPost } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { likePost, unlikePost, deletePost } = usePosts();
  const [post, setPost] = useState({
    title: '',
    content: '',
    author: {},
    coverImage: '',
    tags: [],
    likes: [],
    createdAt: new Date(),
    readTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [comment, setComment] = useState('');
  const [comments] = useState([
    {
      id: 1,
      author: {
        name: 'Alex Rivera',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        username: 'alexcodes'
      },
      content: 'Great article! Really helpful insights about React and TypeScript.',
      createdAt: new Date('2024-01-14'),
      likes: 5
    },
    {
      id: 2,
      author: {
        name: 'Jamie Liu',
        avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        username: 'jamiedesign'
      },
      content: 'Thanks for sharing this! I learned something new about hooks.',
      createdAt: new Date('2024-01-13'),
      likes: 3
    }
  ]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await getPost(id);
        // Ensure all required properties exist with default values
        setPost({
          title: data.title || '',
          content: data.content || '',
          author: data.author || {},
          coverImage: data.coverImage || '',
          tags: data.tags || [],
          likes: data.likes || [],
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          readTime: data.readTime || 0,
          ...data // Include any additional properties from the server
        });
        setError(null);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load the post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffTime = Math.abs(now - postDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (post.likes.includes(user?._id)) {
        await unlikePost(post._id);
      } else {
        await likePost(post._id);
      }
      
      // Refresh the post data
      const response = await fetch(`http://localhost:5000/api/posts/single/${id}`);
      if (!response.ok) {
        throw new Error('Failed to refresh post data');
      }
      const updatedPost = await response.json();
      setPost(updatedPost);
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleDelete = async () => {
    if (!isAuthenticated || user?._id !== post.author._id) {
      return;
    }

    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const deleted = await deletePost(post._id);
        if (deleted) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Post Not Found</h1>
          <p className="text-gray-400">The post you're looking for doesn't exist.</p>
          <Link to="/" className="text-blue-500 hover:text-blue-400 mt-4 inline-block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share && post && post.title && post.content) {
      try {
        await navigator.share({
          title: post.title || 'Blog Post',
          text: post.content ? post.content.substring(0, 100) + '...' : '',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Sharing failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast here
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    // In a real app, this would create a new comment
    console.log('New comment:', comment);
    setComment('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Post not found</h1>
          <Link
            to="/"
            className="text-primary-400 hover:text-primary-300 transition-colors duration-200"
          >
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = isAuthenticated && user?.id === post.author.id;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Back Navigation */}
      <div className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>

            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  <MoreHorizontal className="text-gray-400" size={20} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => navigate(`/edit/${post.id}`)}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-gray-700 transition-colors duration-200"
                    >
                      <Edit size={14} />
                      <span className="text-sm">Edit</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-gray-700 transition-colors duration-200"
                    >
                      <Trash2 size={14} />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight">
            {post.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link
                to={`/profile/${post.author.id}`}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
              >
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-white">{post.author.name}</p>
                  <p className="text-sm text-gray-400">@{post.author.username}</p>
                </div>
              </Link>
              <button className="text-primary-400 hover:text-primary-300 font-medium transition-colors duration-200">
                Follow
              </button>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>{post.readTime} min read</span>
              </div>
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="mb-8">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full aspect-video object-cover rounded-xl"
              />
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-900/20 text-primary-400 text-sm rounded-full border border-primary-800/30 hover:bg-primary-900/30 transition-colors duration-200 cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none mb-12">
            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>

          {/* Article Actions */}
          <div className="flex items-center justify-between border-t border-gray-800 pt-8 mb-12">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLike}
                disabled={!isAuthenticated}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  post.liked
                    ? 'text-red-500 bg-red-900/20'
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-900/20'
                } ${!isAuthenticated && 'cursor-not-allowed opacity-50'}`}
              >
                <Heart size={18} fill={post.liked ? 'currentColor' : 'none'} />
                <span className="font-medium">{post.likes}</span>
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-900/20 transition-colors duration-200">
                <MessageCircle size={18} />
                <span className="font-medium">{comments.length}</span>
              </button>
            </div>

            <button
              onClick={handleShare}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors duration-200"
            >
              <Share2 size={18} />
            </button>
          </div>
        </motion.div>

        {/* Comments Section */}
        <section id="comments" className="border-t border-gray-800 pt-8">
          <h3 className="text-xl font-semibold text-white mb-6">
            Comments ({comments.length})
          </h3>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="flex space-x-4">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows={3}
                    className="w-full input-field resize-none"
                  />
                  <div className="flex items-center justify-end mt-2">
                    <button
                      type="submit"
                      disabled={!comment.trim()}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center bg-gray-800 rounded-lg p-8 mb-8 border border-gray-700">
              <p className="text-gray-300 mb-4">Join the conversation</p>
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="text-primary-400 hover:text-primary-300 font-medium transition-colors duration-200"
                >
                  Sign in
                </Link>
                <span className="text-gray-500">or</span>
                <Link
                  to="/signup"
                  className="text-primary-400 hover:text-primary-300 font-medium transition-colors duration-200"
                >
                  Create an account
                </Link>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex space-x-4"
              >
                <img
                  src={comment.author.avatar}
                  alt={comment.author.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-white">{comment.author.name}</span>
                      <span className="text-gray-400">@{comment.author.username}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-300">{comment.content}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-2">
                    <button className="flex items-center space-x-1 text-gray-400 hover:text-red-500 transition-colors duration-200">
                      <Heart size={14} />
                      <span className="text-sm">{comment.likes}</span>
                    </button>
                    <button className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
                      Reply
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
};

export default PostDetail;