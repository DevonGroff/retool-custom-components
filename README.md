# Retool Custom Components Library

A **Retool Custom Component Library** for building advanced, reusable React components that extend Retool's native functionality. This library uses Retool's official CLI tool (`npx retool-ccl`) to develop, test, and deploy custom components directly into your Retool applications.

## 🎯 What is This?

This is a **Retool Custom Component Library**—not a standalone application. It's a development project that:

- Builds custom React components locally with TypeScript
- Syncs components to your Retool organization via CLI
- Allows live development with hot-reloading in Retool apps
- Deploys versioned components for production use

**Key Concept:** You develop components here, deploy them to Retool, then drag-and-drop them into your Retool apps like any native component.

## 📦 Current Components

### 1. AG Grid Component
A powerful data grid built on [AG Grid Community Edition](https://www.ag-grid.com/), providing:
- Advanced sorting, filtering, and pagination
- Cell editing with change tracking
- Custom cell renderers (Link, Badge, Currency, Percentage, Date)
- CSV export (all data or selected rows)
- Row selection (single/multi-select)
- Custom theming and styling
- Real-time Retool state integration

**Status:** Production-ready with Community Edition features  
**Enterprise Upgrade:** Available for advanced features (row grouping, tree data, Excel export, aggregation)

## 🏗️ Repository Structure

```
retool-custom-components/
├── package.json                    # Dependencies & metadata
├── tsconfig.json                   # TypeScript configuration
├── src/
│   ├── index.tsx                   # ⚠️ MAIN ENTRY POINT - exports all components
│   └── ag-grid/                    # AG Grid component
│       └── AGGridComponent.tsx
└── docs/                          # Additional documentation
```

**Critical:** Only components exported from `src/index.tsx` are detected by Retool.

## 🚀 Quick Start

### Prerequisites

1. **Node.js v20+** ([Download](https://nodejs.org/))
2. **Retool Account** with admin permissions
3. **Retool API Access Token** with Custom Component Libraries read/write scopes
   - Generate at: `https://[your-org].retool.com/settings/api` (see [API Authentication docs](https://docs.retool.com/reference/api/authentication))

### Initial Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/DevonGroff/retool-custom-components.git
   cd retool-custom-components
   npm install
   ```

2. **Login to Retool**
   ```bash
   npx retool-ccl login
   ```
   - Prompts for your Retool organization URL (e.g., `https://yourcompany.retool.com`)
   - Prompts for your API access token
   - Credentials are saved securely for future commands

3. **Initialize Library** (First time only)
   ```bash
   npx retool-ccl init
   ```
   - Creates the library in your Retool organization
   - Registers metadata from `package.json`
   - Only needs to be run once per library

## 💻 Development Workflow

### Live Development Mode (Recommended)

**Dev mode** provides hot-reloading—changes sync to Retool automatically as you save files.

```bash
npx retool-ccl dev
```

**What happens:**
- Watches `src/` for file changes
- Automatically rebuilds and syncs to Retool
- Creates a **personal dev version** tied to your access token
- Other developers get their own dev versions (no conflicts)

**Using in Retool:**
1. Open any Retool app
2. Drag in your custom component from the component panel
3. In the component's settings, select your **dev** version
4. Changes appear live as you edit code

**Note:** Dev mode keeps running—press `Ctrl+C` to stop.

### Building Without Deploying

Test your build without syncing to Retool:

```bash
npx retool-ccl build
# or
npx retool-ccl deploy --dry-run
```

### Deploying to Production

When ready for production use:

1. **Deploy a versioned release**
   ```bash
   npx retool-ccl deploy
   ```
   - Creates a new numbered version (e.g., `v1`, `v2`, `v3`)
   - Available to all users in your organization
   - Immutable once deployed

2. **Update your Retool app to use the deployed version**
   - Open your app in Retool
   - Go to `⋮` menu → **App settings** → **Custom Components**
   - Change from `dev` to the latest version number
   - May need to refresh the page to see new versions

**Best Practice:** Always test in dev mode first, then deploy when stable.

## 🔄 Multi-Environment Sync

If you have multiple Retool instances (staging, production, etc.) or use Retool Spaces:

### Setup Primary Instance

Choose one instance as your **primary** (where you develop and deploy):

```bash
# Login to primary instance
npx retool-ccl login
# Deploy to primary
npx retool-ccl deploy
```

### Sync to Other Instances

```bash
npx retool-ccl sync
```

**What it does:**
- Prompts for target instance URL and access token
- Copies all library versions from primary to target
- Apps on target instance automatically use synced versions

**Important:** Always deploy to your primary instance first, then sync to others.

## 🧩 Adding New Components

### Step-by-Step Process

1. **Create Component Directory**
   ```bash
   mkdir -p src/my-component
   ```

2. **Write Your Component**

   Create `src/my-component/MyComponent.tsx`:
   ```typescript
   import React, { FC } from 'react';
   import { Retool } from '@tryretool/custom-component-support';

   interface MyComponentProps {
     model: {
       sampleText: string;
       sampleNumber: number;
     };
     modelUpdate: (update: Partial<MyComponentProps['model']>) => void;
   }

   export const MyComponent: FC<MyComponentProps> = ({ model, modelUpdate }) => {
     return (
       <div>
         <h1>{model.sampleText}</h1>
         <button onClick={() => modelUpdate({ sampleNumber: model.sampleNumber + 1 })}>
           Count: {model.sampleNumber}
         </button>
       </div>
     );
   };

   // Required: Configure component settings
   Retool.useComponentSettings({
     defaultHeight: 20,
     defaultWidth: 6,
   });
   ```

3. **Export from Index**

   Add to `src/index.tsx`:
   ```typescript
   export { AGGridComponent } from './ag-grid/AGGridComponent';
   export { MyComponent } from './my-component/MyComponent'; // Add this line
   ```

4. **Test in Dev Mode**
   ```bash
   npx retool-ccl dev
   ```
   - Your new component appears in Retool's component panel
   - Drag it into any app to test

5. **Deploy When Ready**
   ```bash
   npx retool-ccl deploy
   ```

### Component Best Practices

- **TypeScript Required** - Retool CCL expects `.tsx` files
- **Export from `src/index.tsx`** - Only exported components are detected
- **Use `Retool.useComponentSettings()`** - Configure default size and behavior
- **Props Pattern** - Retool injects `model`, `modelUpdate`, and `triggerQuery`
- **State Management** - Use `model` for Retool-managed state, React hooks for internal state

## 🔌 Retool Integration API

### Props Injected by Retool

Your components automatically receive these props:

```typescript
interface RetoolComponentProps<TModel = any> {
  // Current state (read)
  model: TModel;
  
  // Update state (write) - triggers Retool re-render
  modelUpdate: (updates: Partial<TModel>) => void;
  
  // Trigger Retool queries
  triggerQuery: (queryName: string, additionalScope?: Record<string, any>) => void;
}
```

### Retool Hooks (from `@tryretool/custom-component-support`)

```typescript
import { Retool } from '@tryretool/custom-component-support';

// Configure component appearance in Retool
Retool.useComponentSettings({
  defaultHeight: 40,  // Height in Retool grid units
  defaultWidth: 12,   // Width in Retool grid units (max 12)
});

// Subscribe to Retool state changes
const [stateValue, setStateValue] = Retool.useStateString({
  name: 'myState',
  initialValue: 'default',
  inspector: 'text', // How it appears in Retool UI
});

// More state hooks available:
// Retool.useStateNumber()
// Retool.useStateBoolean()
// Retool.useStateArray()
// Retool.useStateObject()
```

### Example: Component with Retool State

```typescript
import React, { FC } from 'react';
import { Retool } from '@tryretool/custom-component-support';

export const Counter: FC = () => {
  const [count, setCount] = Retool.useStateNumber({
    name: 'count',
    initialValue: 0,
    inspector: 'number',
  });

  Retool.useComponentSettings({
    defaultHeight: 10,
    defaultWidth: 6,
  });

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
};
```

**In Retool:** Access this state as `{{ customComponent1.count }}` in your app.

## 📋 CLI Command Reference

All commands use `npx retool-ccl [command]` format:

| Command | Description | When to Use |
|---------|-------------|-------------|
| `login` | Authenticate with Retool | First time, or switching organizations |
| `init` | Create library in Retool | Once per library, first deployment |
| `dev` | Start development server | During active development |
| `build` | Build without deploying | Test build process |
| `deploy` | Deploy new version | Ready for production |
| `sync` | Copy to another instance | Multi-environment deployments |

### Advanced Options

**Non-Interactive Mode** (for CI/CD):
```bash
# Using environment variables
RETOOL_CCL_URL=https://yourco.retool.com \
RETOOL_CCL_ACCESS_TOKEN=retool_secret123 \
npx retool-ccl deploy
```

**Custom Headers** (for self-hosted with load balancers):
```bash
npx retool-ccl deploy --header 'Authorization: Bearer token123'
```

**Verbose Output** (for debugging):
```bash
npx retool-ccl deploy -v
```

**Skip Update Checks:**
```bash
npx retool-ccl deploy --skip-updates-check
```

## 🔐 Authentication & Security

### Access Token Requirements

Your API token needs these scopes:
- ✅ **Custom Component Libraries** (read)
- ✅ **Custom Component Libraries** (write)

### Team Collaboration

Each developer should:
1. Have their own API access token
2. Run `npx retool-ccl login` with their token
3. Use `npx retool-ccl dev` to get a personal dev version

**Why?** Each token gets a unique dev branch (identified by the token creator's email). This prevents developers from overwriting each other's work.

### Git Workflow

**Do commit:**
- Source code (`src/`)
- `package.json` and `package-lock.json`
- `tsconfig.json`
- Documentation

**Don't commit:**
- `node_modules/`
- Build artifacts (`dist/`, `build/`)
- Retool credentials (stored securely by CLI)

## ⚠️ Known Limitations

Per [Retool's documentation](https://docs.retool.com/apps/guides/components/custom-component-libraries):

- **File Size:** Individual revisions limited to 10MB (30MB in dev mode)
- **Total Size:** 5GB limit across all libraries (Retool Cloud)
- **File Types:** Only JavaScript and CSS loaded at runtime
- **Node Version:** Requires Node.js v20 or later
- **Language:** Must use React and TypeScript
- **Mobile:** Not supported in Retool Mobile apps
- **PDF Export:** Custom components excluded from PDF downloads
- **Permissions:** Admin role required to deploy

## 🐛 Troubleshooting

### Common Issues

**"Package not found" error when running `npx retool-ccl`**
- Use `npx @tryretool/custom-component-support [command]` instead
- Or install globally: `npm install -g @tryretool/custom-component-support`

**Dev mode not syncing changes**
- Verify `npx retool-ccl dev` is still running
- Check console for errors
- Try stopping and restarting dev mode
- Clear browser cache and refresh Retool

**Components not appearing in Retool**
- Ensure component is exported from `src/index.tsx`
- Check that `npx retool-ccl dev` or `deploy` completed successfully
- Refresh the Retool app page
- Verify you're using the correct version in Custom Components settings

**Build errors**
- Run `npm install` to ensure dependencies are installed
- Check TypeScript errors: `npx tsc --noEmit`
- Verify React components export correctly

**Authentication errors**
- Regenerate API access token in Retool settings
- Run `npx retool-ccl login` again
- Verify token has correct scopes

### Getting Debug Info

Enable verbose logging:
```bash
npx retool-ccl deploy -v
```

Check build output without deploying:
```bash
npx retool-ccl build
```

### Dev Mode Conflicts

If multiple developers work on the same library:
- Each developer gets their own dev version (identified by their email)
- No conflicts will occur during `dev` mode
- Only `deploy` creates shared production versions

## 📚 Documentation & Resources

### Official Retool Documentation
- [Build Custom Component Libraries](https://docs.retool.com/apps/guides/components/custom-component-libraries) - Main guide
- [Retool CLI Reference](https://docs.retool.com/apps/guides/custom/custom-component-libraries/retool-ccl) - CLI commands
- [Custom Component API](https://docs.retool.com/apps/guides/custom/custom-components) - API reference
- [Retool API Authentication](https://docs.retool.com/reference/api/authentication) - Access tokens

### Example Repositories
- [Retool Custom Component Examples](https://github.com/tryretool/custom-component-examples) - Official examples
- [Retool Custom Component Guide](https://github.com/tryretool/custom-component-guide) - Legacy guide (pre-CCL)

### AG Grid Documentation
- [AG Grid React Guide](https://www.ag-grid.com/react-data-grid/)
- [AG Grid Community vs Enterprise](https://www.ag-grid.com/react-data-grid/community-vs-enterprise/)
- [AG Grid API Reference](https://www.ag-grid.com/react-data-grid/reference/)

## 🤝 Contributing

### Adding New Components

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/new-component`
3. Add your component following the structure in "Adding New Components"
4. Test thoroughly in dev mode
5. Update this README with component documentation
6. Submit a pull request

### Code Standards

- Write TypeScript, not JavaScript
- Use functional components with hooks
- Follow existing code style and organization
- Add JSDoc comments for complex functions
- Test in Retool before committing

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🆘 Support

### For This Repository
- Open an issue: [GitHub Issues](https://github.com/DevonGroff/retool-custom-components/issues)
- Contact the development team

### For Retool Platform Issues
- [Retool Community Forum](https://community.retool.com/) - Community support
- [Retool Documentation](https://docs.retool.com/) - Official docs
- [Retool Support](https://retool.com/support) - Customer support (paid plans)

## 🎓 Learning Path

**New to Retool Custom Components?** Follow this path:

1. **Read** [Build Custom Component Libraries](https://docs.retool.com/apps/guides/components/custom-component-libraries)
2. **Install** prerequisites and run `npx retool-ccl login`
3. **Clone** this repo and run `npx retool-ccl dev`
4. **Modify** the AG Grid component and watch it update in Retool
5. **Create** a simple component following "Adding New Components"
6. **Deploy** your first version with `npx retool-ccl deploy`
7. **Build** more complex components as needed

---

## 📝 Quick Reference Card

```bash
# Initial Setup (one time)
npx retool-ccl login                # Authenticate
npx retool-ccl init                 # Create library in Retool

# Development (daily workflow)
npm install                         # Install dependencies
npx retool-ccl dev                  # Start live dev mode (keep running)
# Make changes → Save files → See updates in Retool instantly

# Deployment (when ready for production)
npx retool-ccl deploy               # Deploy new version
# Update app in Retool: Settings > Custom Components > Select version

# Multi-environment
npx retool-ccl sync                 # Copy to staging/production

# Troubleshooting
npx retool-ccl build                # Test build
npx retool-ccl deploy -v            # Verbose logging
```

---

**Built with ❤️ for Retool**

This library follows Retool's official Custom Component Library architecture, ensuring compatibility and maintainability across all components.
