import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()

// List of supported MIME types
const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff'
];

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public/uploads')
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Get file extension from mimetype
    const ext = file.mimetype.split('/')[1]
    // Generate unique filename with proper extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    cb(null, `${uniqueSuffix}.${ext}`)
  }
})

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (SUPPORTED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Unsupported file type. Supported types: JPG, PNG, GIF, WebP, SVG, BMP, TIFF'))
  }
}

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter
})

router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        supportedTypes: SUPPORTED_MIME_TYPES
      })
    }

    // Return file information including MIME type
    const publicPath = `/uploads/${req.file.filename}`
    res.json({
      url: publicPath,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    res.status(500).json({ 
      error: error.message || 'Failed to upload file',
      supportedTypes: SUPPORTED_MIME_TYPES
    })
  }
})

// Route to get supported file types
router.get('/upload/supported-types', (req, res) => {
  res.json({
    supportedTypes: SUPPORTED_MIME_TYPES,
    maxSize: '10MB'
  })
})

export default router