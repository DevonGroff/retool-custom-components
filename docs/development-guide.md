# Development Guide

This guide covers how to develop and maintain components in this library.

## Development Environment

### Prerequisites
- Node.js v16+
- npm or yarn
- Retool CLI
- Git

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Component Structure

Each component should follow this structure:

```
src/your-component/
├── YourComponent.tsx          # Main component
├── components/                # Sub-components
│   ├── SubComponent1.tsx
│   └── SubComponent2.tsx
├── hooks/                     # Custom hooks
│   ├── useYourHook.ts
│   └── useAnotherHook.ts
└── utils/                     # Utility functions
    ├── helper1.ts
    └── helper2.ts
```

## Creating a New Component

### 1. Create Component Directory
```bash
mkdir src/your-component
mkdir src/your-component/components
mkdir src/your-component/hooks
mkdir src/your-component/utils
```

### 2. Create Main Component File
```typescript
// src/your-component/YourComponent.tsx
import React from 'react';
import { Retool } from '@tryretool/custom-component-support';

interface YourComponentProps {
  // Define your props here
  data?: any[];
  onDataChange?: (data: any[]) => void;
}

const YourComponent: React.FC<YourComponentProps> = ({
  data = [],
  onDataChange,
  ...props
}) => {
  // Component implementation
  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
};

export default YourComponent;
```

### 3. Update Exports
Add to `src/index.tsx`:
```typescript
export { YourComponent } from './your-component/YourComponent';
```

### 4. Update Manifest
Add to `retool-custom-component-manifest.json`:
```json
{
  "customComponentSupportVersion": "2",
  "components": {
    "YourComponent": {
      "name": "Your Component Name",
      "model": [
        {
          "name": "data",
          "initialValue": [],
          "label": "Data",
          "description": "Data to display",
          "type": "array"
        }
      ],
      "events": [],
      "defaultHeight": 40,
      "defaultWidth": 12
    }
  }
}
```

## Best Practices

### Code Organization
- Keep components focused and single-purpose
- Use custom hooks for complex logic
- Extract utility functions to separate files
- Use TypeScript for type safety

### Styling
- Use CSS modules or styled-components
- Follow Retool's design patterns
- Make components responsive
- Test with different themes

### Testing
- Test with various data types and sizes
- Test edge cases (empty data, errors)
- Test with Retool's different themes
- Test responsive behavior

### Performance
- Use React.memo for expensive components
- Implement proper cleanup in useEffect
- Avoid unnecessary re-renders
- Optimize for large datasets

## Shared Resources

### Types
Define shared types in `src/shared/types/`:
```typescript
// src/shared/types/common.ts
export interface BaseComponentProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}
```

### Utilities
Create shared utilities in `src/shared/utils/`:
```typescript
// src/shared/utils/helpers.ts
export const formatData = (data: any[]) => {
  // Shared formatting logic
};
```

### Styles
Place shared styles in `src/shared/styles/`:
```css
/* src/shared/styles/common.css */
.retool-component {
  font-family: inherit;
  box-sizing: border-box;
}
```

## Deployment

### Building
```bash
npm run build
```

### Deploying
```bash
npm run deploy
```

### Versioning
- Use semantic versioning
- Update version in package.json
- Tag releases in Git
- Document breaking changes

## Troubleshooting

### Common Issues
1. **Import errors**: Check relative paths
2. **Type errors**: Ensure proper TypeScript setup
3. **Build failures**: Check for syntax errors
4. **Deployment issues**: Verify Retool CLI setup

### Debugging
- Use browser dev tools
- Check Retool console logs
- Test in isolation
- Use debug logging

## Contributing

1. Follow the coding standards
2. Write clear commit messages
3. Test your changes thoroughly
4. Update documentation
5. Submit pull requests with descriptions
