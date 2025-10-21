#!/usr/bin/env node

/**
 * Script to update all lab apps' budget configuration
 * to allow for larger bundle sizes
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
    const prodConfig = angularJson.projects[appName].architect.build.configurations.production;

    // Update budget limits to allow for larger bundles
    if (prodConfig && prodConfig.budgets) {
      prodConfig.budgets = prodConfig.budgets.map(budget => {
        if (budget.type === 'initial') {
          return {
            ...budget,
            maximumWarning: '2mb',
            maximumError: '5mb'
          };
        }
        if (budget.type === 'anyComponentStyle') {
          return {
            ...budget,
            maximumWarning: '6kb',
            maximumError: '10kb'
          };
        }
        return budget;
      });

      console.log(`✅ Updated budgets for ${appName}`);
      updatedCount++;
    }
  } else {
    console.log(`⚠️  ${appName} not found`);
  }
});

// Write updated angular.json
fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));

console.log(`\n✅ Successfully updated budgets for ${updatedCount} lab apps`);
console.log('📝 Updated angular.json with increased budget limits');
console.log('   - Initial bundle: 2mb warning / 5mb error');
console.log('   - Component styles: 6kb warning / 10kb error');
