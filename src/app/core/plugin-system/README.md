# Plugin System Documentation

## Overview

The Content Lab Plugin System is a modular architecture that enables features to be:
- Independently developed and tested
- Selectively included in builds
- Dynamically registered at runtime
- Eventually extracted into separate npm packages

## Architecture

### Core Components

1. **PluginRegistryService** - Central registry for all feature plugins
2. **FeatureLoaderService** - Loads and registers plugins based on configuration
3. **FeaturePlugin Interface** - Contract that all plugins must implement
4. **Feature Configuration** - TypeScript config file specifying enabled features

### Directory Structure

```
src/app/core/plugin-system/
├── plugin.interface.ts           # Plugin contract & types
├── plugin-registry.service.ts    # Plugin registry
├── feature-loader.service.ts     # Feature loader
├── feature-config.interface.ts   # Build config types
├── index.ts                       # Public API exports
└── README.md                      # This file

feature.config.ts                  # Build configuration (root)
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

## Creating a Plugin

### Step 1: Create Plugin Definition File

Create a `.plugin.ts` file in your feature directory:

```typescript
// src/app/features/my-tool/my-tool.plugin.ts

import { FeaturePlugin, ToolCategory } from '@core/plugin-system';

export const metadata = {
  id: 'my-tool',
  name: 'My Awesome Tool',
  description: 'Does amazing things',
  version: '1.0.0',
  category: ToolCategory.Utilities,
  route: '/tools/my-tool',
  icon: `<svg>...</svg>`
};

export const plugin: FeaturePlugin = {
  metadata,
  loadComponent: () => import('./my-tool.component')
    .then(m => m.MyToolComponent)
};
```

### Step 2: Register in Feature Config

Add your feature to `feature.config.ts`:

```typescript
const config: FeatureBuildConfig = {
  buildName: 'content-lab-full',
  version: '1.0.0',
  features: {
    'my-tool': { enabled: true }
  }
};
```

### Step 3: Add to Feature Loader

Update the `pluginPaths` map in `feature-loader.service.ts`:

```typescript
const pluginPaths: Record<string, string> = {
  'my-tool': '../features/my-tool/my-tool.plugin',
  // ... other plugins
};
```

That's it! Your plugin will now be loaded automatically.

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

## Migration Path

### Current Phase: Phase 0 (Foundation) ✓
- Plugin system infrastructure created
- Core interfaces and services implemented
- Build configuration system in place

### Next Phase: Phase 1 (Plugin Migration)
- Convert existing features to plugins
- Create `.plugin.ts` files for each feature
- Update sidebar to use plugin registry
- Dynamic route generation

### Future Phases
- Phase 2: Build configuration system
- Phase 3: Monorepo structure
- Phase 4: npm package publishing
- Phase 5: Complete separation

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

When adding new features:
1. Create plugin definition file
2. Add to feature configuration
3. Update plugin paths in loader
4. Test the plugin loads correctly
5. Update documentation

## Support

For questions or issues:
- See main project documentation
- Check Phase 0 implementation plan
- Review code examples above

---

**Phase 0 Status:** ✓ Complete
**Last Updated:** 2025-10-19
**Version:** 1.0.0
