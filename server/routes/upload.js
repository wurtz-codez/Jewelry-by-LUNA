const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

// Route to upload multiple images
router.post('/', auth, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Return the Cloudinary URLs of the uploaded files
    const filePaths = req.files.map(file => file.path);
    
    return res.status(200).json({ 
      message: 'Files uploaded successfully',
      filePaths
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      message: 'Server error during upload',
      error: error.message 
    });
  }
});

// Route to upload a single image
router.post('/single', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    return res.status(200).json({ 
      message: 'File uploaded successfully',
      filePath: req.file.path
    });
  } catch (error) {
    console.error('Single upload error:', error);
    return res.status(500).json({ 
      message: 'Server error during upload',
      error: error.message 
    });
  }
});

// Route to upload videos
router.post('/videos', auth, upload.array('videos', 2), (req, res) => {
  try {
    console.log('Video upload request received');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    if (!req.files || req.files.length === 0) {
      console.log('No video files found in request');
      return res.status(400).json({ message: 'No files uploaded' });
    }

    console.log(`Processing ${req.files.length} video files`);
    
    // Validate file types
    const invalidFiles = req.files.filter(file => !file.mimetype.startsWith('video/'));
    if (invalidFiles.length > 0) {
      console.log('Invalid video file types detected:', invalidFiles.map(f => f.mimetype));
      return res.status(400).json({ message: 'Please upload valid video files' });
    }

    // Return the Cloudinary URLs of the uploaded videos
    const filePaths = req.files.map(file => {
      console.log(`Video uploaded successfully: ${file.originalname} (${file.size} bytes) -> ${file.path}`);
      return file.path;
    });
    
    console.log('All videos uploaded successfully');
    return res.status(200).json({ 
      message: 'Videos uploaded successfully',
      filePaths
    });
  } catch (error) {
    console.error('Video upload error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      message: 'Server error during video upload',
      error: error.message 
    });
  }
});

// Route to delete image
router.delete('/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      return res.status(200).json({ message: 'File deleted successfully' });
    } else {
      return res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ 
      message: 'Server error during file deletion',
      error: error.message 
    });
  }
});

module.exports = router;