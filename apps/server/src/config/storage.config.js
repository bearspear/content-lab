/**
 * Storage Configuration
 *
 * Configuration for file storage locations and settings
 */

const path = require('path');

// Base directories relative to project root
const BASE_DIR = process.cwd();
const TEMP_DIR = process.env.TEMP_DIR || path.join(BASE_DIR, 'temp');
const PUBLIC_DIR = path.join(BASE_DIR, 'public');

module.exports = {
  // Temporary file storage
  tempDir: TEMP_DIR,
  uploadsDir: path.join(TEMP_DIR, 'uploads'),
  capturesDir: path.join(TEMP_DIR, 'captures'),

  // Public file serving
  publicDir: PUBLIC_DIR,

  // File size limits
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 104857600, // 100MB default

  // Cleanup settings
  cleanupInterval: parseInt(process.env.CLEANUP_INTERVAL) || 3600000, // 1 hour default
  maxFileAge: 24 * 60 * 60 * 1000 // 24 hours
};
