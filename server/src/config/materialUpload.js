const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Material upload directory
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const materialDir = path.join(uploadDir, 'teacher-materials');

// Ensure directory exists
if (!fs.existsSync(materialDir)) {
  fs.mkdirSync(materialDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, materialDir);
  },
  filename: function (req, file, cb) {
    // Use timestamp + random for safe filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'file-' + uniqueSuffix + ext);
  }
});

// File filter for material uploads
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExts.includes(ext)) {
    return cb(null, true);
  }

  cb(new Error('仅支持 JPG、PNG、WEBP、PDF、TXT 文件'));
};

// Configure multer for materials
const materialUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: fileFilter
});

module.exports = materialUpload;