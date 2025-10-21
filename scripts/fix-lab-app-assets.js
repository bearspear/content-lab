const fs = require('fs');
const path = require('path');

// Read angular.json
const angularJsonPath = path.join(__dirname, '..', 'angular.json');
const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));

// Fix assets for all lab apps
Object.keys(angularJson.projects).forEach(projectName => {
  if (projectName.endsWith('-lab')) {
    const project = angularJson.projects[projectName];

    // Update assets to include Monaco
    project.architect.build.options.assets = [
      {
        glob: '**/*',
        input: 'apps/content-lab/src/assets',
        output: 'assets'
      },
      {
        glob: '**/*',
        input: 'node_modules/monaco-editor',
        output: 'assets/monaco-editor'
      }
    ];

    console.log(`✓ Updated assets for ${projectName}`);
  }
});

// Write back to angular.json
fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));

console.log('\n✓ All lab apps updated with Monaco assets');
