#!/bin/bash

# Usage: ./create-lab-app.sh <feature-name> <title> <port> <component-name>

feature=$1
title=$2
port=$3
component=$4

echo "Creating ${feature}-lab..."

# Create directory structure
mkdir -p "apps/${feature}-lab/src/app"

# Create project.json
cat > "apps/${feature}-lab/project.json" << EOF
{
  "name": "${feature}-lab",
  "\$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "prefix": "app",
  "sourceRoot": "apps/${feature}-lab/src",
  "tags": ["lab-app"],
  "targets": {
    "build": {
      "executor": "@angular-devkit/build-angular:application",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/apps/${feature}-lab",
        "index": "apps/${feature}-lab/src/index.html",
        "browser": "apps/${feature}-lab/src/main.ts",
        "polyfills": ["zone.js"],
        "tsConfig": "apps/${feature}-lab/tsconfig.app.json",
        "inlineStyleLanguage": "scss",
        "assets": [
          {
            "glob": "**/*",
            "input": "apps/content-lab/src/assets",
            "output": "assets"
          }
        ],
        "styles": ["apps/${feature}-lab/src/styles.scss"],
        "scripts": []
      },
      "configurations": {
        "production": {
          "budgets": [
            {
              "type": "initial",
              "maximumWarning": "500kb",
              "maximumError": "1mb"
            }
          ],
          "outputHashing": "all"
        },
        "development": {
          "optimization": false,
          "extractLicenses": false,
          "sourceMap": true
        }
      },
      "defaultConfiguration": "production"
    },
    "serve": {
      "executor": "@angular-devkit/build-angular:dev-server",
      "configurations": {
        "production": {
          "buildTarget": "${feature}-lab:build:production"
        },
        "development": {
          "buildTarget": "${feature}-lab:build:development"
        }
      },
      "defaultConfiguration": "development",
      "options": {
        "port": ${port}
      }
    }
  }
}
EOF

# Create tsconfig.json
cat > "apps/${feature}-lab/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": false,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    }
  ],
  "extends": "../../tsconfig.json"
}
EOF

# Create tsconfig.app.json
cat > "apps/${feature}-lab/tsconfig.app.json" << 'EOF'
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "types": []
  },
  "files": ["src/main.ts"],
  "include": ["src/**/*.d.ts"]
}
EOF

# Create index.html
cat > "apps/${feature}-lab/src/index.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>
</body>
</html>
EOF

# Create styles.scss
cat > "apps/${feature}-lab/src/styles.scss" << 'EOF'
/* Import Content Lab base styles */
@import '../../../apps/content-lab/src/styles.scss';

/* Minimal layout for standalone app */
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

app-root {
  display: block;
  width: 100%;
  height: 100%;
}
EOF

# Create main.ts
cat > "apps/${feature}-lab/src/main.ts" << 'EOF'
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
EOF

# Create app.config.ts
cat > "apps/${feature}-lab/src/app/app.config.ts" << 'EOF'
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter([])
  ]
};
EOF

# Convert feature name to component selector
selector=$(echo "$feature" | sed 's/-/\-/g')

# Create app.component.ts
cat > "apps/${feature}-lab/src/app/app.component.ts" << EOF
import { Component } from '@angular/core';
import { ${component} } from '../../../content-lab/src/app/features/${feature}/${feature}.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [${component}],
  template: \`<app-${selector}></app-${selector}>\`,
  styles: [\`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  \`]
})
export class AppComponent {}
EOF

echo "✓ Created ${feature}-lab on port ${port}"
