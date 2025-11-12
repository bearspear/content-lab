# Plugin System Documentation

## Overview

The Content Lab Plugin System is a **convention-based, zero-configuration** architecture that enables features to be:
- Automatically discovered from the filesystem
- Independently developed and tested
- Selectively enabled/disabled via configuration
- Dynamically registered at runtime
- Eventually extracted into separate npm packages

**Phase 3 Status:** ✅ Convention-Based Discovery + Automation + Validation

## Architecture

### Core Components

1. **PluginRegistryService** - Central registry for all feature plugins
2. **FeatureLoaderService** - Loads and registers plugins based on configuration
3. **FeaturePlugin Interface** - Contract that all plugins must implement
4. **Feature Configuration** - Single source of truth for enabling/disabling features
5. **Convention-Based Discovery** - Automatic filesystem scanning for plugins
6. **Code Generation** - Automated generation of routes and loader files
7. **Validation System** - Build-time checks for plugin integrity

### Directory Structure

```
src/app/core/plugin-system/
├── plugin.interface.ts           # Plugin contract & types
├── plugin-registry.service.ts    # Plugin registry
├── feature-loader.service.ts     # Feature loader (AUTO-GENERATED)
├── feature-config.interface.ts   # Build config types
├── index.ts                       # Public API exports
└── README.md                      # This file

src/app/
├── app.routes.ts                  # Routes (AUTO-GENERATED)
└── features/
    ├── my-tool/
    │   ├── my-tool.component.ts
    │   └── my-tool.plugin.ts      # ← Convention: [name].plugin.ts
    └── another-tool/
        ├── another-tool.component.ts
        └── another-tool.plugin.ts

feature.config.js                  # Single source of truth (root)
scripts/
├── generate-routes.js             # Code generation script
└── validate-plugins.js            # Validation script
```

## Plugin Contract

Every feature must implement the `FeaturePlugin` interface:

```typescript
export interface FeaturePlugin {
  metadata: FeaturePluginMetadata;
  loadComponent: () => Promise<any>;
  onActivate?(): void | Promise<void>;
  onDeactivate?(): void | Promise<void>;
  config?: Record<string, any>;
}
```

### Plugin Metadata

```typescript
export interface FeaturePluginMetadata {
  id: string;                    // e.g., 'tetris'
  name: string;                  // e.g., 'Tetris Game'
  description: string;           // Short description
  version: string;               // Semantic version
  icon: string;                  // SVG icon string
  category: ToolCategory;        // Category enum
  route: string;                 // Route path
  badge?: string;                // Optional badge
  badgeClass?: string;           // Badge CSS class
  dependencies?: string[];       // External deps
}
```

## Creating a Plugin (Phase 3 - Zero Configuration)

**Convention:** Just follow the naming pattern `features/[name]/[name].plugin.ts` and you're done!

### Step 1: Create Plugin Definition File

Create a `.plugin.ts` file following the naming convention:

```typescript
// src/app/features/my-tool/my-tool.plugin.ts

import { FeaturePlugin, ToolCategory } from '@content-lab/plugin-system';

export const metadata = {
  id: 'my-tool',  // Must match directory name
  name: 'My Awesome Tool',
  description: 'Does amazing things',
  version: '1.0.0',
  category: ToolCategory.Utilities,
  route: '/tools/my-tool',
  icon: `<svg>...</svg>`,
  dependencies: ['monaco-editor']  // Optional: external dependencies
};

export const plugin: FeaturePlugin = {
  metadata,
  loadComponent: () => import('./my-tool.component')
    .then(m => m.MyToolComponent),

  // Optional: lifecycle hooks
  onActivate: () => {
    console.log('[MyTool] Plugin activated');
  },

  onDeactivate: () => {
    console.log('[MyTool] Plugin deactivated');
  },

  // Optional: plugin-specific configuration
  config: {
    maxFileSize: 10 * 1024 * 1024,
    defaultMode: 'editor'
  }
};
```

### Step 2: Enable in Feature Config

Add your feature to `feature.config.js` (the ONLY file you need to edit):

```javascript
module.exports = {
  buildName: 'content-lab-full',
  version: '1.0.0',
  features: {
    'my-tool': { enabled: true }  // Feature ID must match directory name
  }
};
```

### Step 3: Generate and Validate

Run the automated build preparation:

```bash
npm run generate:routes  # Auto-discovers plugins and generates files
npm run validate:plugins # Validates everything is properly configured
```

**That's it!** Your plugin is now:
- ✅ Auto-discovered from filesystem
- ✅ Routes automatically generated
- ✅ Loader automatically configured
- ✅ Validated for correctness

**No manual mapping required!** The system discovers plugins by scanning for `features/*/[name].plugin.ts` files.

## Usage Examples

### Accessing the Plugin Registry

```typescript
import { PluginRegistryService } from '@core/plugin-system';

constructor(private pluginRegistry: PluginRegistryService) {}

ngOnInit() {
  // Get all plugins
  const allPlugins = this.pluginRegistry.getAll();

  // Get plugins by category
  const games = this.pluginRegistry.getByCategory(ToolCategory.Games);

  // Get specific plugin
  const tetris = this.pluginRegistry.getById('tetris');

  // Search plugins
  const results = this.pluginRegistry.search('editor');
}
```

### Using Feature Loader

```typescript
import { FeatureLoaderService } from '@core/plugin-system';

constructor(private loader: FeatureLoaderService) {}

// Check if feature is enabled
const isEnabled = this.loader.isFeatureEnabled('tetris');

// Get enabled features list
const enabled = this.loader.getEnabledFeatures();

// Get build config
const buildConfig = this.loader.getBuildConfig();
```

## Build Configurations

Create different build configurations for different use cases:

### Full Build (feature.config.ts)
```typescript
{
  buildName: 'content-lab-full',
  features: {
    'tetris': { enabled: true },
    'json-editor': { enabled: true },
    // ... all 17 features
  }
}
```

### Lightweight Build (configs/feature.config.lightweight.ts)
```typescript
{
  buildName: 'content-lab-lite',
  features: {
    'markdown-to-html': { enabled: true },
    'text-editor': { enabled: true },
    'base64-encoder': { enabled: true }
    // Only essential features
  }
}
```

### Developer Build (configs/feature.config.developer.ts)
```typescript
{
  buildName: 'content-lab-dev',
  features: {
    'js-playground': { enabled: true },
    'json-editor': { enabled: true },
    'regex-tester': { enabled: true }
    // Only dev tools
  }
}
```

## Tool Categories

```typescript
export enum ToolCategory {
  ContentDesign = 'content-design',
  CodeDev = 'code-dev',
  DataText = 'data-text',
  Utilities = 'utilities',
  Visualizations = 'visualizations',
  Games = 'games'
}
```

## Lifecycle Hooks

Plugins can implement optional lifecycle hooks:

```typescript
export const plugin: FeaturePlugin = {
  metadata,
  loadComponent: () => import('./my-tool.component'),

  onActivate: async () => {
    console.log('Plugin activated');
    // Initialize resources
  },

  onDeactivate: () => {
    console.log('Plugin deactivated');
    // Clean up resources
  }
};
```

## Type Guards

Use type guards to validate plugins:

```typescript
import { isFeaturePlugin, isValidMetadata } from '@core/plugin-system';

if (isFeaturePlugin(obj)) {
  // obj is a valid FeaturePlugin
  this.pluginRegistry.register(obj);
}

if (isValidMetadata(metadata)) {
  // metadata is valid
}
```

## Best Practices

1. **Always use semantic versioning** for plugin versions
2. **Provide clear, concise descriptions** in metadata
3. **Declare external dependencies** in the dependencies array
4. **Use lifecycle hooks** for resource management
5. **Test plugins in isolation** before integration
6. **Keep plugin files co-located** with components

## Error Handling

The plugin system handles errors gracefully:

- Invalid plugins are rejected with clear error messages
- Failed plugin loads don't crash the app
- Duplicate registrations are warned but ignored
- Missing plugin files are logged as warnings

## Evolution & Migration Path

### ✅ Phase 0 (Foundation) - COMPLETE
- Plugin system infrastructure created
- Core interfaces and services implemented
- Build configuration system in place

### ✅ Phase 1 (Stabilization) - COMPLETE
- Validation scripts added (`npm run validate:plugins`)
- Orphaned plugins detected and fixed
- Build-time safety nets implemented
- Pre-build hooks integrated

### ✅ Phase 2 (Automation) - COMPLETE
- Code generation implemented (`npm run generate:routes`)
- Auto-generation of app.routes.ts and feature-loader.service.ts
- Single source of truth: feature.config.js
- Pre-build automation: `npm run prebuild`

### ✅ Phase 3 (Modernization) - COMPLETE
- **Convention-based plugin discovery**
- Zero manual mapping required
- Filesystem scanning for `features/*/[name].plugin.ts`
- Developer workflow: 8 steps → 2 steps

### ✅ Phase 4 (Advanced Features) - COMPLETE
- ✅ **Lifecycle hooks implementation** (onActivate, onDeactivate, onInitialize, onDestroy)
  - PluginLifecycleService manages plugin activation/deactivation
  - Router integration for automatic lifecycle management
  - Error handling and graceful degradation
- ✅ **Dependency validation system**
  - PluginDependencyValidatorService validates required dependencies
  - Runtime detection of global libraries and npm packages
  - Clear warning messages for missing dependencies
- ⏸️ Service plugins (deferred - not needed yet)
- ⏸️ Plugin communication bus (deferred - not needed yet)
- ⏸️ Dynamic plugin loading (deferred - not needed yet)

**See:** [docs/PHASE_4_COMPLETION.md](../../../../docs/PHASE_4_COMPLETION.md) for complete details

### 🔮 Future Phases
- Phase 5: Monorepo structure with Nx
- Phase 6: npm package publishing
- Phase 7: Complete plugin separation

## API Reference

### PluginRegistryService

| Method | Description |
|--------|-------------|
| `register(plugin)` | Register a plugin |
| `registerMany(plugins)` | Register multiple plugins |
| `getAll()` | Get all registered plugins |
| `getById(id)` | Get plugin by ID |
| `getByCategory(category)` | Get plugins by category |
| `has(id)` | Check if plugin exists |
| `unregister(id)` | Unregister a plugin |
| `clear()` | Clear all plugins |
| `getCount()` | Get plugin count |
| `getCategories()` | Get unique categories |
| `search(query)` | Search plugins |
| `getByDependency(dep)` | Get plugins with dependency |

### FeatureLoaderService

| Method | Description |
|--------|-------------|
| `loadFeatures()` | Load all enabled features |
| `getBuildConfig()` | Get build configuration |
| `getEnabledFeatures()` | Get enabled feature IDs |
| `isFeatureEnabled(id)` | Check if feature is enabled |
| `getFeatureConfig(id)` | Get feature-specific config |

## Troubleshooting

### Plugin Not Loading
- Check that `enabled: true` in `feature.config.ts`
- Verify plugin path in `feature-loader.service.ts`
- Ensure `.plugin.ts` file exists and exports `plugin`

### Duplicate Registration Warning
- Plugin is already registered
- Check for duplicate calls to `register()`

### Invalid Plugin Error
- Plugin doesn't implement `FeaturePlugin` interface
- Missing required metadata fields
- Use `isFeaturePlugin()` to validate

## Contributing

When adding new features (Phase 3 workflow):
1. Create plugin definition file following naming convention: `features/[name]/[name].plugin.ts`
2. Add to `feature.config.js` with `enabled: true`
3. Run `npm run generate:routes` to auto-discover and generate files
4. Run `npm run validate:plugins` to verify correctness
5. Test the plugin loads correctly
6. Update documentation if needed

## Troubleshooting

### Common Issues

**Problem:** Plugin not discovered by generation script
- **Solution:** Verify naming convention: directory name must match plugin file name
- **Example:** `features/my-tool/my-tool.plugin.ts` ✅ | `features/my-tool/plugin.ts` ❌

**Problem:** Validation fails after generation
- **Solution:** Check that feature ID in plugin metadata matches directory name
- **Solution:** Ensure `feature.config.js` has `enabled: true` for the feature

**Problem:** Plugin appears in routes but doesn't load
- **Solution:** Check component import path in `loadComponent` function
- **Solution:** Verify component is exported from its module

## Support

For questions or issues:
- See main project documentation
- Check [docs/PLUGIN_DEVELOPMENT_GUIDE.md](../../../../docs/PLUGIN_DEVELOPMENT_GUIDE.md)
- Review code examples above
- Check [docs/PLUGIN_SYSTEM_ANALYSIS.md](../../../../docs/PLUGIN_SYSTEM_ANALYSIS.md) for architecture details

---

**Current Phase:** Phase 4 (Advanced Features) ✅ COMPLETE
**Last Updated:** 2025-11-11
**Version:** 4.0.0

**Next Phase:** Phase 5 (Optional advanced features based on future needs)
