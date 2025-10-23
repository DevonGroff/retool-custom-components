# Retool Custom Components Library

A collection of custom components for Retool applications, designed to extend Retool's built-in functionality with advanced data visualization and interaction capabilities.

## 🚀 Components

### AG Grid Component
A powerful data grid component built on AG Grid Community, featuring:
- **Advanced Data Display**: Sortable, filterable columns with customizable styling
- **Row Selection**: Single and multi-row selection with programmatic control
- **Cell Editing**: Inline cell editing with validation and change tracking
- **Pagination**: Built-in pagination for large datasets
- **Data Export**: Export selected or all data to CSV
- **Real-time Updates**: Seamless integration with Retool queries and state

## 📁 Repository Structure

```
retool-custom-components/
├── README.md
├── .gitignore
├── package.json                    # Dependencies for all components
├── retool-custom-component-manifest.json  # Component definitions
├── tsconfig.json
├── src/
│   ├── index.tsx                   # Main entry point
│   ├── ag-grid/                    # AG Grid component
│   │   ├── AGGridComponent.tsx
│   │   ├── components/             # Sub-components
│   │   ├── hooks/                  # Custom hooks
│   │   └── utils/                  # Utility functions
│   ├── [future-component]/         # Future components
│   └── shared/                     # Shared resources
│       ├── types/                  # TypeScript types
│       ├── utils/                  # Shared utilities
│       └── styles/                 # Shared styles
└── docs/                          # Documentation
```

## 🛠️ Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Retool CLI (`@tryretool/custom-component-support`)

### Setup
1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

### Building
```bash
npm run build
```

### Deployment
```bash
npm run deploy
```

## 📚 Adding New Components

To add a new component to this library:

1. **Create component directory**:
   ```bash
   mkdir src/your-component-name
   ```

2. **Add component files**:
   - `YourComponent.tsx` - Main component file
   - `components/` - Sub-components (if needed)
   - `hooks/` - Custom hooks (if needed)
   - `utils/` - Utility functions (if needed)

3. **Update exports** in `src/index.tsx`:
   ```typescript
   export { YourComponent } from './your-component-name/YourComponent';
   ```

4. **Add to manifest** in `retool-custom-component-manifest.json`:
   ```json
   {
     "customComponentSupportVersion": "2",
     "components": {
       "AGGridComponent": { /* existing config */ },
       "YourComponent": {
         "name": "Your Component Name",
         "model": [ /* component properties */ ],
         "events": [ /* component events */ ],
         "defaultHeight": 40,
         "defaultWidth": 12
       }
     }
   }
   ```

## 🔧 Component Development Guidelines

### File Organization
- Each component should have its own directory under `src/`
- Use subdirectories for `components/`, `hooks/`, and `utils/`
- Keep shared code in `src/shared/`

### Naming Conventions
- Component files: `PascalCase.tsx`
- Hook files: `useCamelCase.ts`
- Utility files: `camelCase.ts`
- Directory names: `kebab-case`

### TypeScript
- Use TypeScript for all new components
- Define proper interfaces for props and state
- Export types from `src/shared/types/` when reusable

### Styling
- Use CSS modules or styled-components
- Follow Retool's design system when possible
- Place shared styles in `src/shared/styles/`

## 📖 Documentation

- [Getting Started Guide](docs/getting-started.md)
- [Development Guide](docs/development-guide.md)
- [Component API Reference](docs/api-reference.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions or issues:
- Check the [documentation](docs/)
- Open an issue on GitHub
- Contact the development team

---

**Note**: This library follows Retool's recommended structure for custom component libraries, ensuring compatibility and maintainability across all components.