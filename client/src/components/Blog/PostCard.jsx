import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../hooks/usePosts';

const PostCard = ({ post, onDelete }) => {
  const { user, isAuthenticated } = useAuth();
  const { toggleLike, likePost, unlikePost } = usePosts();
  
  const [isLiked, setIsLiked] = useState(() => {
    // Ensure post.likes is an array and check if user has liked
    const likes = Array.isArray(post.likes) ? post.likes : [];
    return user ? likes.includes(user._id) : false;
  });
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    
    try {
      if (isLiked) {
        await unlikePost(post._id);
        setLikesCount(prev => prev - 1);
      } else {
        await likePost(post._id);
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDelete(post.id);
    }
    setShowMenu(false);
  };

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

  const isOwner = isAuthenticated && user?._id === post.author?._id;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-700"
    >
      <Link to={`/post/${post.id}`}>
        {/* Cover Image */}
      {post.coverImage && (
        <div className="aspect-video overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            onError={(e) => {
              // Fallback to a default image if the image fails to load
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/800x450?text=Image+Not+Available';
            }}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}


        {/* Content */}
        <div className="p-6">
          {/* Author info and menu */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <img
                src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.username || 'User'}&background=random`}
                alt={post.author?.username || 'User'}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium text-white">{post.author?.username || 'Anonymous'}</p>
                <p className="text-xs text-gray-400">{formatDate(post.createdAt)}</p>
              </div>
            </div>

            {isOwner && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  <MoreHorizontal className="text-gray-400" size={16} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-1 w-32 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10">
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-gray-800 transition-colors duration-200 rounded-lg"
                    >
                      <Trash2 size={14} />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 hover:text-primary-400 transition-colors duration-200">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-gray-300 mb-4 line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary-900/20 text-primary-400 text-xs rounded-full border border-primary-800/30"
              >
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{post.tags.length - 3} more</span>
            )}
          </div>

          {/* Meta info */}
          <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>{post.readTime} min read</span>
              </div>
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Actions */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              disabled={!isAuthenticated}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                isLiked
                  ? 'text-red-500 bg-red-900/20'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-900/20'
              } ${!isAuthenticated && 'cursor-not-allowed opacity-50'}`}
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
              <span className="text-sm font-medium">{likesCount}</span>
            </button>

            <Link
              to={`/post/${post.id}#comments`}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-900/20 transition-colors duration-200"
            >
              <MessageCircle size={16} />
              <span className="text-sm font-medium">Comment</span>
            </Link>
          </div>

          <button className="p-2 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors duration-200">
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default PostCard;