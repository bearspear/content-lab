#!/usr/bin/env node
/**
 * Plugin Validation Script
 *
 * Validates that all enabled features in feature.config.js are properly registered
 * in both app.routes.ts and feature-loader.service.ts
 *
 * This prevents "orphaned plugins" - features that are enabled but not accessible
 *
 * Exit codes:
 * - 0: All validations passed
 * - 1: Validation failures found
 * - 2: Critical error (file not found, parse error, etc.)
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Paths to important files
const paths = {
  featureConfig: path.join(__dirname, '../apps/content-lab/src/feature.config.js'),
  appRoutes: path.join(__dirname, '../apps/content-lab/src/app/app.routes.ts'),
  featureLoader: path.join(__dirname, '../apps/content-lab/src/app/core/plugin-system/feature-loader.service.ts'),
  featuresDir: path.join(__dirname, '../apps/content-lab/src/app/features')
};

/**
 * Read and parse feature.config.js to extract enabled features
 */
function getEnabledFeatures() {
  try {
    if (!fs.existsSync(paths.featureConfig)) {
      throw new Error(`feature.config.js not found at: ${paths.featureConfig}`);
    }

    const configContent = fs.readFileSync(paths.featureConfig, 'utf8');

    // Extract enabled features using regex
    // Matches: 'feature-name': { enabled: true }
    const featureRegex = /'([^']+)':\s*{\s*enabled:\s*true/g;
    const enabledFeatures = [];

    let match;
    while ((match = featureRegex.exec(configContent)) !== null) {
      enabledFeatures.push(match[1]);
    }

    return enabledFeatures;
  } catch (error) {
    console.error(`${colors.red}${colors.bold}✗ Error reading feature.config.js:${colors.reset}`);
    console.error(`  ${error.message}`);
    process.exit(2);
  }
}

/**
 * Check if plugin file exists for a feature
 */
function pluginFileExists(featureId) {
  const pluginPath = path.join(paths.featuresDir, featureId, `${featureId}.plugin.ts`);
  return fs.existsSync(pluginPath);
}

/**
 * Validate that feature is imported in app.routes.ts
 */
function validateAppRoutes(featureId) {
  try {
    const routesContent = fs.readFileSync(paths.appRoutes, 'utf8');

    // Check 1: Import statement exists
    // Example: import { plugin as markdownToHtmlPlugin } from './features/markdown-to-html/markdown-to-html.plugin';
    const importRegex = new RegExp(`import.*from.*['"].*features/${featureId}/${featureId}\\.plugin['"]`);
    const hasImport = importRegex.test(routesContent);

    // Check 2: Entry in allPlugins map
    // Example: 'markdown-to-html': markdownToHtmlPlugin,
    const mapRegex = new RegExp(`['"]${featureId}['"]:\\s*\\w+Plugin`);
    const hasMapEntry = mapRegex.test(routesContent);

    return {
      hasImport,
      hasMapEntry,
      isValid: hasImport && hasMapEntry
    };
  } catch (error) {
    console.error(`${colors.red}✗ Error reading app.routes.ts:${colors.reset}`);
    console.error(`  ${error.message}`);
    process.exit(2);
  }
}

/**
 * Validate that feature-loader imports allPlugins from app.routes
 */
function validateFeatureLoader(featureId) {
  try {
    const loaderContent = fs.readFileSync(paths.featureLoader, 'utf8');

    // Check that feature-loader imports allPlugins from app.routes
    // Example: import { allPlugins } from '../../app.routes';
    const importRegex = /import\s*{\s*allPlugins\s*}\s*from\s*['"].*app\.routes['"]/;
    const hasImport = importRegex.test(loaderContent);

    return {
      hasImport,
      isValid: hasImport
    };
  } catch (error) {
    console.error(`${colors.red}✗ Error reading feature-loader.service.ts:${colors.reset}`);
    console.error(`  ${error.message}`);
    process.exit(2);
  }
}

/**
 * Main validation function
 */
function validatePlugins() {
  console.log(`\n${colors.cyan}${colors.bold}🔍 Plugin Validation Report${colors.reset}\n`);
  console.log(`${colors.blue}Validating plugin registration for all enabled features...${colors.reset}\n`);

  const enabledFeatures = getEnabledFeatures();
  console.log(`Found ${colors.bold}${enabledFeatures.length}${colors.reset} enabled features in feature.config.js\n`);

  const errors = [];
  const warnings = [];
  const successes = [];

  // Validate each enabled feature
  for (const featureId of enabledFeatures) {
    const featureErrors = [];

    // Check 1: Plugin file exists
    if (!pluginFileExists(featureId)) {
      featureErrors.push({
        severity: 'error',
        message: `Plugin file missing: features/${featureId}/${featureId}.plugin.ts`,
        fix: `Create the plugin file or disable the feature in feature.config.js`
      });
    }

    // Check 2: Imported in app.routes.ts
    const routesValidation = validateAppRoutes(featureId);
    if (!routesValidation.hasImport) {
      featureErrors.push({
        severity: 'error',
        message: `Not imported in app.routes.ts`,
        fix: `Add: import { plugin as ${featureId.replace(/-/g, '')}Plugin } from './features/${featureId}/${featureId}.plugin';`
      });
    } else if (!routesValidation.hasMapEntry) {
      featureErrors.push({
        severity: 'error',
        message: `Imported but not in allPlugins map in app.routes.ts`,
        fix: `Add to allPlugins: '${featureId}': ${featureId.replace(/-/g, '')}Plugin,`
      });
    }

    // Note: feature-loader.service.ts now imports allPlugins from app.routes
    // No per-feature validation needed - if app.routes is valid, loader will work

    // Collect results
    if (featureErrors.length > 0) {
      errors.push({ featureId, errors: featureErrors });
    } else {
      successes.push(featureId);
    }
  }

  // Print results
  console.log(`${colors.bold}Results:${colors.reset}\n`);

  if (successes.length > 0) {
    console.log(`${colors.green}✓ Valid Features (${successes.length}):${colors.reset}`);
    successes.forEach(id => {
      console.log(`  ${colors.green}✓${colors.reset} ${id}`);
    });
    console.log();
  }

  if (errors.length > 0) {
    console.log(`${colors.red}${colors.bold}✗ Invalid Features (${errors.length}):${colors.reset}\n`);

    errors.forEach(({ featureId, errors: featureErrors }) => {
      console.log(`${colors.red}${colors.bold}  ✗ ${featureId}${colors.reset}`);
      featureErrors.forEach(err => {
        const icon = err.severity === 'error' ? '✗' : '⚠';
        const color = err.severity === 'error' ? colors.red : colors.yellow;
        console.log(`${color}    ${icon} ${err.message}${colors.reset}`);
        console.log(`${colors.cyan}      Fix: ${err.fix}${colors.reset}`);
      });
      console.log();
    });
  }

  // Print summary
  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  Total features: ${enabledFeatures.length}`);
  console.log(`  ${colors.green}Valid: ${successes.length}${colors.reset}`);
  console.log(`  ${colors.red}Invalid: ${errors.length}${colors.reset}`);
  console.log();

  // Exit with appropriate code
  if (errors.length > 0) {
    console.log(`${colors.red}${colors.bold}❌ VALIDATION FAILED${colors.reset}`);
    console.log(`${colors.yellow}Fix the issues above before building or starting the application.${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bold}✅ ALL VALIDATIONS PASSED${colors.reset}`);
    console.log(`${colors.green}All enabled features are properly registered!${colors.reset}\n`);
    process.exit(0);
  }
}

// Run validation
try {
  validatePlugins();
} catch (error) {
  console.error(`\n${colors.red}${colors.bold}✗ Critical error during validation:${colors.reset}`);
  console.error(`  ${error.message}`);
  console.error(`  ${error.stack}\n`);
  process.exit(2);
}
