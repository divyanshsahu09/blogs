// Cloudinary upload utility
export const uploadToCloudinary = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'blog_uploads'); // Replace with your Cloudinary preset
    formData.append('cloud_name', 'your_cloud_name'); // Replace with your Cloudinary cloud name

    const response = await fetch(
      'https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', // Replace with your cloud name
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return {
      success: true,
      url: data.secure_url,
      public_id: data.public_id,
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