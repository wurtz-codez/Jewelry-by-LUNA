const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage with format-specific options
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jewelry-by-luna',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'webm'],
    // Format-specific transformations will be handled by the resource_type detection
    format: async (req, file) => {
      if (file.mimetype.startsWith('video/')) {
        return 'mp4'; // Convert all videos to mp4 for better compatibility
      }
      return undefined; // Let Cloudinary detect the format for images
    },
    resource_type: async (req, file) => {
      if (file.mimetype.startsWith('video/')) {
        return 'video';
      }
      return 'image';
    },
    // Add video-specific transformations
    transformation: async (req, file) => {
      if (file.mimetype.startsWith('video/')) {
        return [
          { width: 1280, height: 720, crop: 'scale' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ];
      }
      return undefined;
    }
  }
});

// Create multer upload instance with increased size limits for videos
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Accept both image and video files
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  }
});

module.exports = {
  cloudinary,
  upload
}; 