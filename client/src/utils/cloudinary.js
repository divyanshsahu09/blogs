// Cloudinary configuration
const CLOUD_NAME = 'dnqb6ehel';
const UPLOAD_PRESET = 'blog_unsigned';

// Cloudinary upload utility
export const uploadToCloudinary = async (file) => {
  const cloudName = CLOUD_NAME;
  const uploadPreset = UPLOAD_PRESET;
  
  if (!cloudName || !uploadPreset) {
    console.error('Cloudinary configuration is missing. Please set up your environment variables.');
    return {
      success: false,
      error: 'Cloudinary is not properly configured.'
    };
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('cloud_name', cloudName);

    console.log('Uploading to Cloudinary with config:', { cloudName, uploadPreset });
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const responseData = await response.json();
    console.log('Cloudinary response:', responseData);

    if (!response.ok) {
      throw new Error(`Upload failed: ${responseData.error?.message || response.statusText}`);
    }

    return {
      success: true,
      url: responseData.secure_url,
      public_id: responseData.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Mock function for demo purposes
export const mockUploadToCloudinary = async (file) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        url: `https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`,
        public_id: 'mock_id_' + Date.now(),
      });
    }, 2000);
  });
};