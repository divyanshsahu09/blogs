import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Link as LinkIcon, Edit, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/Blog/PostCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Profile = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { posts, loading, deletePost } = usePosts();
  const [activeTab, setActiveTab] = useState('posts');

  // In a real app, you'd fetch user profile based on ID
  // For demo, using current user or mock data
  const profileUser = user || {
    id: 1,
    name: 'Sarah Chen',
    username: 'sarahdev',
    email: 'sarah@example.com',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1',
    bio: 'Full-stack developer passionate about React, TypeScript, and building amazing user experiences. Always learning and sharing knowledge with the community.',
    location: 'San Francisco, CA',
    website: 'https://sarahchen.dev',
    joinedAt: new Date('2023-01-15'),
    stats: {
      posts: 42,
      followers: 1200,
      following: 345,
    }
  };

  const userPosts = posts.filter(post => post.author.id === profileUser.id);
  const isOwnProfile = isAuthenticated && user?.id === profileUser.id;

  const tabs = [
    { id: 'posts', label: 'Posts', count: userPosts.length },
    { id: 'liked', label: 'Liked', count: 0 },
    { id: 'drafts', label: 'Drafts', count: 0, private: true },
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
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profileUser.avatar}
                alt={profileUser.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white/20"
              />
              {isOwnProfile && (
                <button className="absolute bottom-0 right-0 p-2 bg-white text-gray-900 rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-200">
                  <Edit size={16} />
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {profileUser.name}
                  </h1>
                  <p className="text-blue-100 text-lg">@{profileUser.username}</p>
                </div>

                <div className="mt-4 md:mt-0 flex items-center space-x-3">
                  {isOwnProfile ? (
                    <>
                      <Link
                        to="/settings"
                        className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>
                      <Link
                        to="/create"
                        className="bg-white text-purple-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                      >
                        Write Post
                      </Link>
                    </>
                  ) : (
                    <button className="bg-white text-purple-600 hover:bg-blue-50 px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                      Follow
                    </button>
                  )}
                </div>
              </div>

              {/* Bio */}
              <p className="text-blue-50 mb-4 max-w-2xl leading-relaxed">
                {profileUser.bio}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-blue-100 mb-6">
                {profileUser.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin size={14} />
                    <span>{profileUser.location}</span>
                  </div>
                )}
                {profileUser.website && (
                  <a
                    href={profileUser.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 hover:text-white transition-colors duration-200"
                  >
                    <LinkIcon size={14} />
                    <span>{profileUser.website.replace('https://', '')}</span>
                  </a>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>Joined {profileUser.joinedAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center md:justify-start space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{profileUser.stats.posts}</div>
                  <div className="text-blue-200 text-sm">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{profileUser.stats.followers.toLocaleString()}</div>
                  <div className="text-blue-200 text-sm">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{profileUser.stats.following}</div>
                  <div className="text-blue-200 text-sm">Following</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-800 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              if (tab.private && !isOwnProfile) return null;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'posts' && (
            <div>
              {userPosts.length > 0 ? (
                <div className="space-y-6">
                  {userPosts.map((post, index) => (
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
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Edit className="text-gray-500" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {isOwnProfile ? "You haven't written any posts yet" : "No posts yet"}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {isOwnProfile 
                      ? "Share your thoughts and knowledge with the community!"
                      : `${profileUser.name} hasn't published any posts yet.`
                    }
                  </p>
                  {isOwnProfile && (
                    <Link
                      to="/create"
                      className="btn-primary"
                    >
                      Write Your First Post
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'liked' && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ❤️
                </motion.div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No liked posts yet</h3>
              <p className="text-gray-400">
                {isOwnProfile 
                  ? "Posts you like will appear here"
                  : `${profileUser.name} hasn't liked any posts yet.`
                }
              </p>
            </div>
          )}

          {activeTab === 'drafts' && isOwnProfile && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Edit className="text-gray-500" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No drafts</h3>
              <p className="text-gray-400 mb-6">
                Your unpublished drafts will appear here
              </p>
              <Link
                to="/create"
                className="btn-primary"
              >
                Start Writing
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;