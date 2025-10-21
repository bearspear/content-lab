const fs = require('fs');
const path = require('path');

// Read angular.json
const angularJsonPath = path.join(__dirname, '..', 'angular.json');
const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));

// Fix Monaco configuration for all lab apps
Object.keys(angularJson.projects).forEach(projectName => {
  if (projectName.endsWith('-lab')) {
    const project = angularJson.projects[projectName];

    // Add allowedCommonJsDependencies to handle Monaco
    if (!project.architect.build.options.allowedCommonJsDependencies) {
      project.architect.build.options.allowedCommonJsDependencies = [];
    }

    // Add html2pdf.js if not present
    if (!project.architect.build.options.allowedCommonJsDependencies.includes('html2pdf.js')) {
      project.architect.build.options.allowedCommonJsDependencies.push('html2pdf.js');
    }

    console.log(`✓ Updated Monaco config for ${projectName}`);
  }
});

// Write back to angular.json
fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));

console.log('\n✓ All lab apps updated with Monaco configuration');
