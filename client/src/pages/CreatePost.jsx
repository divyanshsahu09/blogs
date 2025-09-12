import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Image, 
  X, 
  Upload, 
  Eye, 
  PenTool, 
  Save, 
  Plus,
  Bold,
  Italic,
  List,
  Link,
  Code
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../hooks/usePosts';
import { uploadToCloudinary } from '../utils/cloudinary';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Modal from '../components/UI/Modal';

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  content: yup.string().required('Content is required'),
});

const CreatePost = () => {
  const [activeTab, setActiveTab] = useState('write');
  const [coverImage, setCoverImage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  
  const { user } = useAuth();
  const { addPost } = usePosts();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    getValues,
    reset
  } = useForm({
    resolver: yupResolver(schema),
  });

  const watchedContent = watch('content', '');
  const watchedTitle = watch('title', '');

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    setUploading(true);
    console.log('Starting image upload to Cloudinary...', file.name);
    
    try {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Image size should be less than 5MB');
      }

      const result = await uploadToCloudinary(file);
      
      if (result.success) {
        console.log('Image uploaded successfully to Cloudinary:', result.url);
        setCoverImage(result.url);
      } else {
        throw new Error(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error.message || 'An error occurred while uploading the image');
      setCoverImage(''); // Clear any previous image
    } finally {
      setUploading(false);
    }
  };

  const handleImageUrlSubmit = () => {
    if (imageUrl.trim()) {
      setCoverImage(imageUrl.trim());
      setImageUrl('');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const insertFormatting = (format) => {
    const textarea = document.querySelector('textarea[name="content"]');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        break;
      case 'list':
        formattedText = `\n- ${selectedText || 'list item'}`;
        break;
      case 'link':
        formattedText = `[${selectedText || 'link text'}](url)`;
        break;
      case 'code':
        formattedText = `\`${selectedText || 'code'}\``;
        break;
      default:
        return;
    }

    const newContent = 
      textarea.value.substring(0, start) + 
      formattedText + 
      textarea.value.substring(end);
    
    setValue('content', newContent);
    
    // Set focus back to textarea
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + formattedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (!coverImage) {
        throw new Error('Please add a cover image for your post');
      }

      // Create the post data
      const newPost = {
        title: data.title,
        content: data.content,
        tags: tags.filter(tag => tag.trim() !== ''), // Remove any empty tags
        coverImage: coverImage, // The Cloudinary URL from image upload
      };

      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('You must be logged in to create a post');
      }

      console.log('Submitting post with image:', newPost);

      // Save to database
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newPost),
        credentials: 'include'
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || `Failed to save post: ${response.statusText}`);
      }

      console.log('Post saved successfully:', responseData);

      // Update frontend state with the complete post data from the server
      // addPost({
      //   ...responseData,
      //   // Ensure we have all required fields for the PostCard
      //   author: {
      //     ...responseData.author,
      //     name: responseData.author?.username || 'Anonymous',
      //     avatar: responseData.author?.avatar || `https://ui-avatars.com/api/?name=${responseData.author?.username || 'User'}&background=random`
      //   },
      //   likes: responseData.likes || [],
      //   liked: responseData.likes?.includes(responseData.author?._id) || false
      // });


      addPost({
  ...responseData,
  coverImage: responseData.coverImage, // make sure Cloudinary URL is kept
  author: {
    ...responseData.author,
    name: responseData.author?.username || 'Anonymous',
    avatar: responseData.author?.avatar // don’t force mock image here
  },
  likes: responseData.likes || [],
  liked: responseData.likes?.includes(user?._id) || false
});


      // Clear the form
      reset();
      setTags([]);
      setCoverImage('');

      // Close the modal and redirect to the new post
      setShowPublishModal(false);
      navigate(`/post/${responseData._id}`);
    } catch (error) {
      console.error('Failed to create post:', error);
      
      // Handle token expiration or invalid token
      if (error.message.includes('jwt expired') || 
          error.message.includes('invalid token') || 
          error.message.includes('Token is not valid')) {
        // Clear invalid token and user data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // Show appropriate message and redirect to login
        alert('Your session has expired. Please log in again.');
        navigate('/login', { state: { from: '/create-post', message: 'Session expired. Please log in again.' } });
      } else {
        // For other errors, show the error message
        alert(error.message || 'Failed to create post. Please try again.');
      }
  } finally {
    setSaving(false);
  }
};

  const saveDraft = async () => {
    const formData = getValues();
    // In a real app, save draft to localStorage or API
    localStorage.setItem('draft', JSON.stringify({
      ...formData,
      coverImage,
      tags,
      savedAt: new Date().toISOString(),
    }));
    
    // Show feedback
    const originalText = document.querySelector('.save-button').textContent;
    document.querySelector('.save-button').textContent = 'Saved!';
    setTimeout(() => {
      document.querySelector('.save-button').textContent = originalText;
    }, 2000);
  };

  // Load draft on component mount
  useState(() => {
    const draft = localStorage.getItem('draft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        setValue('title', parsedDraft.title || '');
        setValue('content', parsedDraft.content || '');
        setCoverImage(parsedDraft.coverImage || '');
        setTags(parsedDraft.tags || []);
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  const renderPreview = () => (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-6">
        {watchedTitle || 'Your Post Title'}
      </h1>
      
      <div className="flex items-center space-x-3 mb-8">
        <img
          src={user?.avatar}
          alt={user?.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-medium text-white">{user?.name}</p>
          <p className="text-sm text-gray-400">
            {new Date().toLocaleDateString()} • 1 min read
          </p>
        </div>
      </div>

      {coverImage && (
        <img
          src={coverImage}
          alt="Cover"
          className="w-full aspect-video object-cover rounded-lg mb-8"
        />
      )}
      
      <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
        {watchedContent || 'Your post content will appear here...'}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X size={20} />
              </button>
              <div className="flex items-center space-x-3">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400">@{user?.username}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">1 min read</span>
              <button
                onClick={saveDraft}
                className="save-button flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Save size={16} />
                <span>Save Draft</span>
              </button>
              <button
                onClick={() => setShowPublishModal(true)}
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                <PenTool size={16} />
                <span>Publish</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-3">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 mb-6">
              <button
                onClick={() => setActiveTab('write')}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                  activeTab === 'write'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Write
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                  activeTab === 'preview'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Preview
              </button>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700">
              {activeTab === 'write' ? (
                <div className="p-6">
                  {/* Cover Image Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Cover Image (Optional)
                    </h3>
                    
                    {coverImage ? (
                      <div className="relative">
                        <img
                          src={coverImage}
                          alt="Cover"
                          className="w-full aspect-video object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setCoverImage('')}
                          className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center">
                        <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Image className="text-gray-400" size={24} />
                        </div>
                        <p className="text-gray-400 mb-4">Add a cover image</p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                          <label className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200">
                            <Upload size={16} />
                            <span>Upload Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e.target.files[0])}
                              disabled={uploading}
                            />
                          </label>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="url"
                              placeholder="Enter image URL..."
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              className="input-field flex-1"
                            />
                            <button
                              onClick={handleImageUrlSubmit}
                              className="btn-secondary"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                        
                        {uploading && (
                          <div className="mt-4">
                            <LoadingSpinner size="sm" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Title Input */}
                  <div className="mb-6">
                    <input
                      {...register('title')}
                      type="text"
                      placeholder="Enter your post title..."
                      className="w-full text-3xl font-bold bg-transparent border-none text-white placeholder-gray-500 focus:outline-none resize-none"
                    />
                    {errors.title && (
                      <p className="mt-2 text-red-400 text-sm">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Formatting Toolbar */}
                  <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-900 rounded-lg">
                    <button
                      type="button"
                      onClick={() => insertFormatting('bold')}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors duration-200"
                      title="Bold"
                    >
                      <Bold size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('italic')}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors duration-200"
                      title="Italic"
                    >
                      <Italic size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('list')}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors duration-200"
                      title="List"
                    >
                      <List size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('link')}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors duration-200"
                      title="Link"
                    >
                      <Link size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('code')}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors duration-200"
                      title="Code"
                    >
                      <Code size={16} />
                    </button>
                  </div>

                  {/* Content Textarea */}
                  <div className="mb-6">
                    <textarea
                      {...register('content')}
                      placeholder="Tell your story... (Supports Markdown)"
                      className="w-full min-h-[400px] bg-transparent border-none text-gray-300 placeholder-gray-500 focus:outline-none resize-none text-lg leading-relaxed"
                    />
                    {errors.content && (
                      <p className="mt-2 text-red-400 text-sm">{errors.content.message}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  {renderPreview()}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
              
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="text"
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 input-field"
                />
                <button
                  onClick={addTag}
                  className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="flex items-center space-x-2 px-3 py-1 bg-primary-900/20 text-primary-400 text-sm rounded-full border border-primary-800/30"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-primary-300 hover:text-primary-200 transition-colors duration-200"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Publishing Tips */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Publishing Tips</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Add a compelling title to grab readers' attention</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Include relevant tags to help people discover your post</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Use markdown for better formatting (bold, lists, links)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Add a cover image to make your post stand out</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Modal */}
      <Modal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        title="Publish Post"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you ready to publish your post? Once published, it will be visible to all users.
          </p>
          
          <div className="flex items-center justify-end space-x-4">
            <button
              onClick={() => setShowPublishModal(false)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={saving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Publish Now'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreatePost;