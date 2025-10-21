#!/usr/bin/env node

/**
 * Script to update all lab apps' angular.json configuration
 * to handle Monaco Editor .ttf files properly
 */

const fs = require('fs');
const path = require('path');

const angularJsonPath = path.join(__dirname, '..', 'angular.json');
const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));

// List of all lab apps
const labApps = [
  'markdown-to-html-lab',
  'text-editor-lab',
  'svg-editor-lab',
  'js-playground-lab',
  'json-editor-lab',
  'regex-tester-lab',
  'diff-checker-lab',
  'csv-editor-lab',
  'word-counter-lab',
  'base64-encoder-lab',
  'world-clock-lab',
  'flac-player-lab',
  'timeline-visualizer-lab',
  'globe-visualizer-lab',
  'star-map-lab',
  'tetris-lab',
  'markdown-converter-lab'
];

let updatedCount = 0;

// Update each lab app
labApps.forEach(appName => {
  if (angularJson.projects[appName]) {
    const buildOptions = angularJson.projects[appName].architect.build.options;

    // Add loader configuration for .ttf files
    if (!buildOptions.loader) {
      buildOptions.loader = {};
    }

    // Configure .ttf files to be treated as file assets
    buildOptions.loader['.ttf'] = 'file';

    console.log(`✅ Updated ${appName}`);
    updatedCount++;
  } else {
    console.log(`⚠️  ${appName} not found`);
  }
});

// Write updated angular.json
fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));

console.log(`\n✅ Successfully updated ${updatedCount} lab apps`);
console.log('📝 Updated angular.json with .ttf file loader configuration');
