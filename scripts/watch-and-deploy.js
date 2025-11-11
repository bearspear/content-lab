#!/usr/bin/env node

/**
 * Watch and Deploy Script for Content Lab
 *
 * Watches the build output directory and automatically copies changes
 * to the content-lab-server/public directory for development.
 *
 * Usage:
 *   npm run watch:deploy
 *
 * Or run both commands in parallel:
 *   npm run watch & npm run watch:deploy
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const SOURCE_DIR = path.join(__dirname, '../dist/apps/content-lab/browser');
const TARGET_DIR = path.join(__dirname, '../../content-lab-server/public');
const DEBOUNCE_MS = 1000; // Wait 1 second after last change before copying

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTimestamp(message, color = 'cyan') {
  const timestamp = new Date().toLocaleTimeString();
  log(`[${timestamp}] ${message}`, color);
}

// Check if source directory exists
function checkSourceDir() {
  if (!fs.existsSync(SOURCE_DIR)) {
    log('⚠️  Build directory not found!', 'yellow');
    log(`Expected: ${SOURCE_DIR}`, 'yellow');
    log('\nPlease run one of the following first:', 'yellow');
    log('  npm run build          (production build)', 'cyan');
    log('  npm run watch          (development watch mode)', 'cyan');
    log('\nOr run both in parallel:', 'yellow');
    log('  npm run watch & npm run watch:deploy', 'cyan');
    process.exit(1);
  }
}

// Ensure target directory exists
function ensureTargetDir() {
  const serverDir = path.join(__dirname, '../../content-lab-server');

  if (!fs.existsSync(serverDir)) {
    log('❌ content-lab-server directory not found!', 'red');
    log(`Expected: ${serverDir}`, 'red');
    process.exit(1);
  }

  if (!fs.existsSync(TARGET_DIR)) {
    log('Creating target directory...', 'yellow');
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }
}

// Copy directory recursively
function copyDir(src, dest) {
  // Create destination directory
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Delete directory recursively (for cleanup)
function deleteDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// Perform the deployment
function deploy() {
  logTimestamp('🚀 Deploying to content-lab-server...', 'blue');

  try {
    // Remove old public directory
    logTimestamp('Removing old files...', 'yellow');
    deleteDir(TARGET_DIR);

    // Copy new build
    logTimestamp('Copying new build...', 'yellow');
    copyDir(SOURCE_DIR, TARGET_DIR);

    logTimestamp('✅ Deployment complete!', 'green');
    log(`   Source: ${SOURCE_DIR}`, 'reset');
    log(`   Target: ${TARGET_DIR}`, 'reset');
  } catch (error) {
    log(`❌ Deployment failed: ${error.message}`, 'red');
  }
}

// Watch for changes with debouncing
let deployTimeout = null;
let isDeploying = false;

function scheduleDeployment() {
  if (isDeploying) {
    return;
  }

  // Clear existing timeout
  if (deployTimeout) {
    clearTimeout(deployTimeout);
  }

  // Schedule new deployment
  deployTimeout = setTimeout(() => {
    isDeploying = true;
    deploy();
    isDeploying = false;
    deployTimeout = null;
  }, DEBOUNCE_MS);
}

function startWatching() {
  log('\n👀 Watching for changes...', 'cyan');
  log(`   Source: ${SOURCE_DIR}`, 'reset');
  log(`   Target: ${TARGET_DIR}`, 'reset');
  log('\nPress Ctrl+C to stop\n', 'yellow');

  // Watch the source directory recursively
  const watcher = fs.watch(SOURCE_DIR, { recursive: true }, (eventType, filename) => {
    if (filename) {
      logTimestamp(`File changed: ${filename}`, 'yellow');
      scheduleDeployment();
    }
  });

  // Handle process termination
  process.on('SIGINT', () => {
    log('\n\n👋 Stopping watch mode...', 'yellow');
    watcher.close();
    process.exit(0);
  });

  // Perform initial deployment
  deploy();
}

// Main execution
function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('  Content Lab - Watch & Deploy to Server', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  checkSourceDir();
  ensureTargetDir();
  startWatching();
}

// Run the script
main();
