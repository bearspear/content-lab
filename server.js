#!/usr/bin/env node

const express = require('express');
const compression = require('compression');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Middleware
app.use(compression()); // Enable GZIP compression
app.use(cors()); // Enable CORS

// Serve static files from the 'public' directory
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath, {
  maxAge: '1y', // Cache static assets for 1 year
  etag: true,
  fallthrough: true // Continue to next middleware if file not found
}));

// SPA fallback: serve index.html for all non-file routes
// This allows Angular routing to work properly
app.get('*', (req, res) => {
  // Check if the request is for a file (has extension)
  const requestedPath = req.path;
  const hasExtension = path.extname(requestedPath) !== '';

  // If it's a file request that wasn't found by static middleware, return 404
  if (hasExtension) {
    return res.status(404).send('File not found');
  }

  // Otherwise, serve index.html for Angular routing
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Start server
app.listen(PORT, HOST, async () => {
  const url = `http://${HOST}:${PORT}`;
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║              Content Lab Server                        ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  🚀 Server running at: ${url}`);
  console.log('');
  console.log('  Press Ctrl+C to stop');
  console.log('');

  // Auto-open browser using dynamic import
  try {
    const open = (await import('open')).default;
    await open(url);
  } catch (error) {
    console.log('  (Could not auto-open browser)');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n\n  👋 Shutting down gracefully...\n');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n\n  👋 Shutting down gracefully...\n');
  process.exit(0);
});
