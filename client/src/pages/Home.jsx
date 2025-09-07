import { motion } from 'framer-motion';
import { PenTool, TrendingUp, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/Blog/PostCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { posts, loading, deletePost } = usePosts();

  const trendingTags = [
    { name: 'React', count: 1234 },
    { name: 'JavaScript', count: 987 },
    { name: 'TypeScript', count: 756 },
    { name: 'Next.js', count: 654 },
    { name: 'Node.js', count: 543 },
  ];

  const topAuthors = [
    {
      id: 1,
      name: 'Sarah Chen',
      posts: 42,
      followers: 1200,
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    },
    {
      id: 2,
      name: 'Alex Rivera',
      posts: 38,
      followers: 980,
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    },
    {
      id: 3,
      name: 'Jamie Liu',
      posts: 35,
      followers: 850,
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
    },
  ];

  const stats = [
    { label: 'New Posts', value: '127', icon: TrendingUp },
    { label: 'Active Users', value: '2.4k', icon: Users },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="gradient-hero py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Welcome to BlogS
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Discover amazing stories, share your thoughts, and connect with a community of passionate writers.
            </p>
            
            {isAuthenticated ? (
              <Link
                to="/create"
                className="inline-flex items-center space-x-2 bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <PenTool size={20} />
                <span>Start Writing</span>
              </Link>
            ) : (
              <Link
                to="/signup"
                className="inline-flex items-center space-x-2 bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <span>Join the Community</span>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filter tabs */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Latest Posts</h2>
              <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
                <button className="px-4 py-2 bg-primary-600 text-white rounded-md font-medium transition-colors duration-200">
                  Latest
                </button>
                <button className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-200">
                  Trending
                </button>
                <button className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-200">
                  Following
                </button>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="space-y-6">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <PostCard post={post} onDelete={deletePost} />
                </motion.div>
              ))}
            </div>

            {posts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PenTool className="text-gray-500" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
                <p className="text-gray-400 mb-6">Be the first to share your story!</p>
                {isAuthenticated && (
                  <Link
                    to="/create"
                    className="btn-primary"
                  >
                    Create Your First Post
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* This Week Stats */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Award className="text-primary-500" size={20} />
                <span>This Week</span>
              </h3>
              <div className="space-y-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="text-primary-500" size={16} />
                        <span className="text-gray-300">{stat.label}</span>
                      </div>
                      <span className="bg-primary-900/20 text-primary-400 px-2 py-1 rounded-full text-sm font-medium">
                        {stat.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trending Tags */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <TrendingUp className="text-primary-500" size={20} />
                <span>Trending Tags</span>
              </h3>
              <div className="space-y-3">
                {trendingTags.map((tag, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-300 hover:text-white cursor-pointer transition-colors duration-200">
                      #{tag.name}
                    </span>
                    <span className="bg-primary-900/20 text-primary-400 px-2 py-1 rounded-full text-xs font-medium">
                      {tag.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Authors */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Users className="text-primary-500" size={20} />
                <span>Top Authors</span>
              </h3>
              <div className="space-y-4">
                {topAuthors.map((author, index) => (
                  <div key={author.id} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 w-4">{index + 1}.</span>
                      <img
                        src={author.avatar}
                        alt={author.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{author.name}</p>
                      <p className="text-xs text-gray-400">
                        {author.posts} posts • {author.followers} followers
                      </p>
                    </div>
                    <button className="text-xs bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-full transition-colors duration-200">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;