const fs = require('fs');
const path = require('path');

// Read angular.json
const angularJsonPath = path.join(__dirname, '..', 'angular.json');
const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));

// List of all lab apps
const labApps = [
  { name: 'markdown-to-html', port: 4201 },
  { name: 'text-editor', port: 4202 },
  { name: 'svg-editor', port: 4203 },
  { name: 'js-playground', port: 4204 },
  { name: 'json-editor', port: 4205 },
  { name: 'regex-tester', port: 4206 },
  { name: 'diff-checker', port: 4207 },
  { name: 'csv-editor', port: 4208 },
  { name: 'word-counter', port: 4209 },
  { name: 'base64-encoder', port: 4210 },
  { name: 'world-clock', port: 4211 },
  { name: 'flac-player', port: 4212 },
  { name: 'timeline-visualizer', port: 4213 },
  { name: 'globe-visualizer', port: 4214 },
  { name: 'star-map', port: 4215 },
  { name: 'tetris', port: 4216 },
  { name: 'markdown-converter', port: 4217 }
];

// Add each lab app to projects
labApps.forEach(({ name, port }) => {
  const appName = `${name}-lab`;
  angularJson.projects[appName] = {
    projectType: 'application',
    schematics: {
      '@schematics/angular:component': {
        style: 'scss'
      }
    },
    root: `apps/${appName}`,
    sourceRoot: `apps/${appName}/src`,
    prefix: 'app',
    architect: {
      build: {
        builder: '@angular-devkit/build-angular:application',
        options: {
          outputPath: `dist/apps/${appName}`,
          index: `apps/${appName}/src/index.html`,
          browser: `apps/${appName}/src/main.ts`,
          polyfills: ['zone.js'],
          tsConfig: `apps/${appName}/tsconfig.app.json`,
          inlineStyleLanguage: 'scss',
          assets: [
            {
              glob: '**/*',
              input: 'apps/content-lab/src/assets',
              output: 'assets'
            }
          ],
          styles: [`apps/${appName}/src/styles.scss`],
          scripts: []
        },
        configurations: {
          production: {
            budgets: [
              {
                type: 'initial',
                maximumWarning: '500kb',
                maximumError: '1mb'
              },
              {
                type: 'anyComponentStyle',
                maximumWarning: '2kb',
                maximumError: '4kb'
              }
            ],
            outputHashing: 'all'
          },
          development: {
            optimization: false,
            extractLicenses: false,
            sourceMap: true
          }
        },
        defaultConfiguration: 'production'
      },
      serve: {
        builder: '@angular-devkit/build-angular:dev-server',
        options: {
          port
        },
        configurations: {
          production: {
            buildTarget: `${appName}:build:production`
          },
          development: {
            buildTarget: `${appName}:build:development`
          }
        },
        defaultConfiguration: 'development'
      }
    }
  };
});

// Write back to angular.json
fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2));

console.log(`✓ Added ${labApps.length} lab apps to angular.json`);
console.log('Lab apps registered:');
labApps.forEach(({ name, port }) => {
  console.log(`  - ${name}-lab (port ${port})`);
});
